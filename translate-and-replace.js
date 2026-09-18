const { Project, SyntaxKind } = require('ts-morph');
const fs = require('fs');
const path = require('path');
const translate = require('google-translate-api-x');

const projectPath = process.argv[2] || 'c:/Sharif/scalafrodriguez-front_end';
const stringsPath = path.join(__dirname, 'strings.json');
const clientTsPath = path.join(projectPath, 'lib', 'i18n', 'client.ts');

async function main() {
  const extractedStrings = JSON.parse(fs.readFileSync(stringsPath, 'utf8'));
  const texts = Object.keys(extractedStrings);
  console.log(`Translating ${texts.length} strings...`);

  const keysMapping = {}; // text -> key
  const translations = {
    en: {}, es: {}, fr: {}, it: {}, ar: {}
  };

  // Generate keys
  texts.forEach((text, i) => {
    let baseKey = text.replace(/[^a-zA-Z0-9]/g, ' ').trim().split(/\s+/).slice(0, 4).join('');
    baseKey = baseKey.charAt(0).toLowerCase() + baseKey.slice(1);
    if (!baseKey || baseKey.length < 2) baseKey = `string${i}`;
    let finalKey = `dyn_${baseKey}_${i}`;
    keysMapping[text] = finalKey;
    translations.en[finalKey] = text;
  });

  // Translate in batches to avoid rate limits
  const targetLangs = ['es', 'fr', 'it', 'ar'];
  
  for (const lang of targetLangs) {
    console.log(`Translating to ${lang}...`);
    // chunking texts to avoid payload too large
    const chunkSize = 50;
    for (let i = 0; i < texts.length; i += chunkSize) {
      const chunkTexts = texts.slice(i, i + chunkSize);
      try {
        const res = await translate(chunkTexts, { to: lang });
        // res can be array if input is array
        const results = Array.isArray(res) ? res : [res];
        results.forEach((r, idx) => {
          const originalText = chunkTexts[idx];
          const key = keysMapping[originalText];
          translations[lang][key] = r.text;
        });
        await new Promise(resolve => setTimeout(resolve, 1000)); // 1s delay
      } catch (err) {
        console.error(`Error translating to ${lang} at chunk ${i}:`, err.message);
        // Fallback to english if error
        chunkTexts.forEach(originalText => {
          translations[lang][keysMapping[originalText]] = originalText;
        });
      }
    }
  }

  console.log("Translations complete. Updating client.ts...");
  // Let's output translations to a JSON file so we can inject them easily, or directly modify client.ts
  fs.writeFileSync('translations.json', JSON.stringify(translations, null, 2));

  // Modify client.ts
  let clientTsContent = fs.readFileSync(clientTsPath, 'utf8');
  
  // We will find `export const commonEN = {` and insert our keys
  function insertKeys(langCode, translationsObj) {
    const varName = `common${langCode.toUpperCase()}`;
    const regex = new RegExp(`export const ${varName} = \\{`);
    const match = clientTsContent.match(regex);
    if (match) {
      const insertPos = match.index + match[0].length;
      let injectStr = `\n  // Dynamic Extractions\n  dynamic: ${JSON.stringify(translationsObj, null, 4).replace(/\\n/g, '\\\\n')},`;
      clientTsContent = clientTsContent.slice(0, insertPos) + injectStr + clientTsContent.slice(insertPos);
    }
  }

  insertKeys('en', translations.en);
  insertKeys('es', translations.es);
  insertKeys('fr', translations.fr);
  insertKeys('it', translations.it);
  insertKeys('ar', translations.ar);

  fs.writeFileSync(clientTsPath, clientTsContent);
  console.log("client.ts updated.");

  console.log("Updating TSX files with ts-morph...");
  const project = new Project({
    tsConfigFilePath: path.join(projectPath, 'tsconfig.json'),
  });

  let modifiedFilesCount = 0;
  
  for (const [text, instances] of Object.entries(extractedStrings)) {
    const key = `dynamic.${keysMapping[text]}`;
    
    // group by file
    const fileGroups = {};
    instances.forEach(inst => {
      if (!fileGroups[inst.file]) fileGroups[inst.file] = [];
      fileGroups[inst.file].push(inst);
    });

    for (const [filePath, fileInstances] of Object.entries(fileGroups)) {
      const sourceFile = project.getSourceFile(filePath);
      if (!sourceFile) continue;

      let fileModified = false;

      // Make sure useTranslation is imported and instantiated
      const importDecls = sourceFile.getImportDeclarations();
      let hasUseTranslationImport = importDecls.some(id => id.getModuleSpecifierValue() === 'react-i18next');
      
      if (!hasUseTranslationImport) {
        sourceFile.addImportDeclaration({
          namedImports: ['useTranslation'],
          moduleSpecifier: 'react-i18next'
        });
      }

      // Add `const { t } = useTranslation();` to components if needed.
      // This is hard to do perfectly across all components, so we assume `t` is available or we add it to the default export.
      // A better way is to check functions returning JSX.
      const functions = [...sourceFile.getFunctions(), ...sourceFile.getVariableDeclarations().filter(v => v.getInitializer() && (v.getInitializer().getKind() === SyntaxKind.ArrowFunction || v.getInitializer().getKind() === SyntaxKind.FunctionExpression))];
      
      functions.forEach(f => {
        const funcNode = f.getKind() === SyntaxKind.VariableDeclaration ? f.getInitializer() : f;
        if (!funcNode || !funcNode.getBody) return;
        const body = funcNode.getBody();
        if (body && body.getKind() === SyntaxKind.Block) {
          const hasT = body.getText().includes('const { t }');
          const hasUseTrans = body.getText().includes('useTranslation()');
          if (!hasT && !hasUseTrans && body.getText().includes('<')) { // heuristic for component
            body.insertStatements(0, 'const { t } = useTranslation();');
          }
        }
      });

      // We replace the text
      fileInstances.forEach(inst => {
        try {
          if (inst.type === 'JsxText') {
            const jsxTexts = sourceFile.getDescendantsOfKind(SyntaxKind.JsxText);
            const node = jsxTexts.find(n => n.getStartLineNumber() === inst.line && n.getText().replace(/[\\r\\n]+/g, ' ').trim() === text);
            if (node) {
              node.replaceWithText(`{t('${key}')}`);
              fileModified = true;
            }
          } else if (inst.type.startsWith('JsxAttribute-')) {
            const attrName = inst.type.split('-')[1];
            const jsxAttrs = sourceFile.getDescendantsOfKind(SyntaxKind.JsxAttribute);
            const node = jsxAttrs.find(n => n.getStartLineNumber() === inst.line && n.getNameNode().getText() === attrName);
            if (node) {
              const init = node.getInitializer();
              if (init && init.getKind() === SyntaxKind.StringLiteral && init.getLiteralValue().trim() === text) {
                node.setInitializer(`{t('${key}')}`);
                fileModified = true;
              }
            }
          }
        } catch (e) {
          // ignore parsing errors for specific nodes
        }
      });

      if (fileModified) {
        sourceFile.saveSync();
        modifiedFilesCount++;
      }
    }
  }

  console.log(`Modified ${modifiedFilesCount} files.`);
}

main().catch(console.error);
