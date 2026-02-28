const fs = require('fs');
const path = require('path');

const DIRECTORIES = ['src', '.'];
const EXTENSIONS = ['.tsx', '.ts', '.html'];

const REPLACEMENTS = [
    { from: /Escrow Africa/g, to: 'Escrow Nigeria' },
    { from: /Africa's/g, to: "Nigeria's" },
    { from: /across Africa/g, to: 'across Nigeria' },
    { from: /\(EA\)/g, to: '(EN)' },
    { from: /"EA"/g, to: '"EN"' },
    { from: / EA /g, to: ' EN ' },
    { from: / EA\./g, to: ' EN.' },
    { from: /EA's/g, to: "EN's" },
    { from: /EA fee/g, to: 'EN fee' },
    { from: /escrowafrica/g, to: 'escrownigeria' }
];

function processDirectory(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        if (file === 'node_modules' || file === '.git' || file === 'dist') continue;

        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            processDirectory(fullPath);
        } else {
            if (EXTENSIONS.some(ext => file.endsWith(ext))) {
                let content = fs.readFileSync(fullPath, 'utf8');
                let originalContent = content;

                for (const { from, to } of REPLACEMENTS) {
                    content = content.replace(from, to);
                }

                if (content !== originalContent) {
                    fs.writeFileSync(fullPath, content);
                    console.log(`Updated: ${fullPath}`);
                }
            }
        }
    }
}

for (const dir of DIRECTORIES) {
    if (dir === '.') {
        // Only process index.html in root
        let content = fs.readFileSync('index.html', 'utf8');
        let originalContent = content;
        for (const { from, to } of REPLACEMENTS) {
            content = content.replace(from, to);
        }
        if (content !== originalContent) {
            fs.writeFileSync('index.html', content);
            console.log(`Updated: index.html`);
        }
    } else {
        processDirectory(dir);
    }
}
console.log('Done!');
