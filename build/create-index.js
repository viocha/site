import fs from 'fs';
import path from 'path';
const __dirname = import.meta.dirname;

const idxPath = path.join(__dirname, '../index.html');
const htmlPath = path.join(__dirname, '../html');
const rootPath = path.join(__dirname, '../');

let html = '';
scanHtmlFiles(htmlPath);
fs.writeFileSync(idxPath, html, {encoding:'utf8'});

function scanHtmlFiles(dir){
	fs.readdirSync(dir).sort((a, b)=>{
		const fullA = path.join(dir, a);
		const fullB = path.join(dir, b);
		return fs.statSync(fullA).isDirectory()-fs.statSync(fullB).isDirectory();
	}).forEach(name=>{
		const fullName = path.join(dir, name);
		const pathFromRoot=path.relative(rootPath, fullName)
		if (fs.statSync(fullName).isFile() && fullName.endsWith('.html')){
			const indent = fullName.match(/\\/g)?.length || 0;
			html += `<div style="padding-left:${indent}em;"><a href="${pathFromRoot}">${pathFromRoot}</a></div>`;
		} else if (fs.statSync(fullName).isDirectory()){
			scanHtmlFiles(fullName);
		}
	});
}
