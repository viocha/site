import fs from 'fs';

let html='';
fs.readdirSync('.').
    filter(n => n.endsWith('.html') && n !== 'index.html').forEach(n=>{
        html+=`<li><a href="${n}">${n.slice(0,-5)}</a></li>`;
    });
html=`<ul>${html}</ul>`;
fs.writeFileSync('index.html', html, { encoding: 'utf8' });