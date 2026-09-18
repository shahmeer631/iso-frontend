const { Project, SyntaxKind } = require('ts-morph');
const fs = require('fs');
const path = require('path');

const projectPath = process.argv[2] || 'c:/Sharif/scalafrodriguez-front_end';
console.log(`Analyzing project at: ${projectPath}`);

const project = new Project({
  tsConfigFilePath: path.join(projectPath, 'tsconfig.json'),
});

const sourceFiles = project.getSourceFiles();
const extractedStrings = {};

let totalStrings = 0;

sourceFiles.forEach(sourceFile => {
  const filePath = sourceFile.getFilePath();
  // Only process components, app, sheard
  if (!filePath.includes('/components/') && !filePath.includes('/app/') && !filePath.includes('/sheard/')) {
    return;
  }

  // Find all JSX Text nodes
  const jsxTexts = sourceFile.getDescendantsOfKind(SyntaxKind.JsxText);
  jsxTexts.forEach(node => {
    const text = node.getText().replace(/[\r\n]+/g, ' ').trim();
    // Exclude simple symbols, whitespace, numbers, and very short texts
    if (text && text.length > 1 && /[a-zA-Z]/.test(text) && !text.startsWith('{')) {
      if (!extractedStrings[text]) {
        extractedStrings[text] = [];
        totalStrings++;
      }
      extractedStrings[text].push({ file: filePath, type: 'JsxText', line: node.getStartLineNumber() });
    }
  });

  // Find all String literals inside JSX attributes
  const jsxAttributes = sourceFile.getDescendantsOfKind(SyntaxKind.JsxAttribute);
  jsxAttributes.forEach(node => {
    const name = node.getNameNode().getText();
    // common text attributes
    if (name === 'placeholder' || name === 'title' || name === 'alt' || name === 'label') {
      const init = node.getInitializer();
      if (init && init.getKind() === SyntaxKind.StringLiteral) {
        const text = init.getLiteralValue().trim();
        if (text && text.length > 1 && /[a-zA-Z]/.test(text)) {
          if (!extractedStrings[text]) {
            extractedStrings[text] = [];
            totalStrings++;
          }
          extractedStrings[text].push({ file: filePath, type: `JsxAttribute-${name}`, line: node.getStartLineNumber() });
        }
      }
    }
  });
});

console.log(`Extracted ${totalStrings} unique strings.`);

fs.writeFileSync(path.join(__dirname, 'strings.json'), JSON.stringify(extractedStrings, null, 2));
console.log('Saved to strings.json');

