const fs = require('fs');
const path = require('path');

let html = '';
scanHtmlFiles('./html');
// html = `<ul>${html}</ul>`;
fs.writeFileSync('index.html', html, { encoding: 'utf8' });

function scanHtmlFiles(dir) {
    fs.readdirSync(dir).
        forEach(name => {
            const fullName = path.join(dir, name);
            if (fs.statSync(fullName).isFile && fullName.endsWith('.html')) {
                html += `<div><a href="${fullName}">${fullName.slice(0, -5)}</a></div>`;
            }
            else {
                scanHtmlFiles(fullName);
            }
        });
}