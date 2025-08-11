#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const ROOT=process.cwd();

function walk(dir){
  const out=[]; for(const e of fs.readdirSync(dir,{withFileTypes:true})){
    const full=path.join(dir,e.name);
    if(e.isDirectory()){
      if(!['node_modules','dist','build','.next','.git','coverage'].includes(e.name)) out.push(...walk(full));
    } else if(e.isFile() && /\.(ts|tsx)$/.test(e.name)) out.push(full);
  } return out;
}

function processFile(file){
  let src=fs.readFileSync(file,'utf8');
  if(!/NodeJS\.Timeout/.test(src)) return false;
  const out=src.replace(/NodeJS\.Timeout/g,'ReturnType<typeof setTimeout>');
  if(out!==src){ fs.writeFileSync(file,out,'utf8'); console.log('Replaced NodeJS.Timeout in', path.relative(ROOT,file)); return true; }
  return false;
}

let count=0; for(const f of walk(ROOT)){ if(processFile(f)) count++; }
console.log('Done. Modified', count, 'files.');
