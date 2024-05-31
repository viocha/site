const fs = require('fs');
const path = require('path');

const idxPath=path.resolve(__dirname, '../index.html');
const htmlPath = path.resolve(__dirname, '../html');

let html = '';
scanHtmlFiles(htmlPath);
fs.writeFileSync(idxPath, html, { encoding: 'utf8' });

function scanHtmlFiles(dir) {
  fs.readdirSync(dir).sort((a, b) => {
    const fullA = path.join(dir, a);
    const fullB = path.join(dir, b);
    return fs.statSync(fullA).isDirectory() - fs.statSync(fullB).isDirectory();

  }).
    forEach(name => {
      const fullName = path.join(dir, name);
      if (fs.statSync(fullName).isFile() && fullName.endsWith('.html')) {
        const indent = fullName.match(/\\/g)?.length || 0;
        html += `<div style="padding-left:${indent}em;"><a href="${fullName}">${fullName}</a></div>`;
      }
      else if (fs.statSync(fullName).isDirectory()) {
        scanHtmlFiles(fullName);
      }
    });
}
