const fs = require('fs');
const path = require('path');

const brandCyan = 'brand-cyan';
const brandCyanFg = '#0F111A';

const prefixes = '((?:hover:|focus:|active:|group-hover:|group-focus:|dark:|peer-checked:)*)';

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    const regexBgBlue = new RegExp(prefixes + 'bg-blue-\\\\d+(?:\\\\/\\\\d+)?', 'g');
    content = content.replace(regexBgBlue, (match, prefix) => {
        const p = prefix || '';
        return p + 'bg-' + brandCyan + ' ' + p + 'text-[' + brandCyanFg + ']';
    });

    const regexBgHex = new RegExp(prefixes + 'bg-\\\\[#(?:3F3EED|3f3eed|2E2DB8|2e2db8)\\\\](?:\\\\/\\\\d+)?', 'g');
    content = content.replace(regexBgHex, (match, prefix) => {
        const p = prefix || '';
        return p + 'bg-' + brandCyan + ' ' + p + 'text-[' + brandCyanFg + ']';
    });

    const regexTextBlue = new RegExp(prefixes + 'text-blue-\\\\d+(?:\\\\/\\\\d+)?', 'g');
    content = content.replace(regexTextBlue, (match, prefix) => {
        return (prefix || '') + 'text-' + brandCyan;
    });

    const regexTextHex = new RegExp(prefixes + 'text-\\\\[#(?:3F3EED|3f3eed|2E2DB8|2e2db8)\\\\](?:\\\\/\\\\d+)?', 'g');
    content = content.replace(regexTextHex, (match, prefix) => {
        return (prefix || '') + 'text-' + brandCyan;
    });

    const otherProps = ['border', 'ring', 'from', 'to', 'via', 'fill', 'stroke', 'shadow', 'decoration', 'accent'];
    for (const prop of otherProps) {
        const regexPropBlue = new RegExp(prefixes + prop + '-blue-\\\\d+(?:\\\\/\\\\d+)?', 'g');
        content = content.replace(regexPropBlue, (match, prefix) => {
            return (prefix || '') + prop + '-' + brandCyan;
        });

        const regexPropHex = new RegExp(prefixes + prop + '-\\\\[#(?:3F3EED|3f3eed|2E2DB8|2e2db8)\\\\](?:\\\\/\\\\d+)?', 'g');
        content = content.replace(regexPropHex, (match, prefix) => {
            return (prefix || '') + prop + '-' + brandCyan;
        });
    }

    if (filePath !== 'app\\\\globals.css' && filePath !== 'app/globals.css') {
        content = content.replace(/#(3F3EED|3f3eed|2E2DB8|2e2db8)/g, '#00F0FF');
    }

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Updated:', filePath);
    }
}

function walkDir(dir) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        if (fs.statSync(dirPath).isDirectory()) {
            if (f !== 'node_modules' && f !== '.next' && f !== '.git') walkDir(dirPath);
        } else if (/\\\\.(tsx|ts|jsx|js|css)$/.test(dirPath)) {
            processFile(dirPath);
        }
    });
}
walkDir('.');
