const fs = require('fs');
const path = require('path');

const walk = (dir) => {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach((file) => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else {
            if (file.endsWith('.tsx') || file.endsWith('.ts')) {
                results.push(file);
            }
        }
    });
    return results;
}

const files = walk(path.join(__dirname, 'src'));

let changedFiles = 0;

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let newContent = content;

    // Global replacements
    newContent = newContent.replace(/Escrow Africa/g, 'Escrow Nigeria');

    // Replace EA with EN globally as an exact word
    newContent = newContent.replace(/\bEA\b/g, 'EN');

    // Specific contextual strings
    newContent = newContent.replace(/across Africa/g, 'across Nigeria');
    newContent = newContent.replace(/Africa's/g, "Nigeria's");

    if (content !== newContent) {
        fs.writeFileSync(file, newContent);
        changedFiles++;
        console.log('Updated: ' + file);
    }
});

console.log('Total files updated: ' + changedFiles);
