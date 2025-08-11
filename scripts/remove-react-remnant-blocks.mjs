#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const ROOT=process.cwd();

function walk(dir){
  const out=[]; for(const e of fs.readdirSync(dir,{withFileTypes:true})){
    const full=path.join(dir,e.name);
    if(e.isDirectory()){
      if(!['node_modules','dist','build','.git','.next','coverage'].includes(e.name)) out.push(...walk(full));
    } else if(e.isFile() && /\.(ts|tsx)$/.test(e.name)) out.push(full);
  } return out;
}

const REMNANT_RX=/,\s*S\s*=\s*\{\}\>\s*\{[\s\S]*?interface\s+FC<[^>]*>\s*\{[\s\S]*?\}[\s\S]*?\}\s*/g;

function processFile(file){
  const src=fs.readFileSync(file,'utf8');
  if(!REMNANT_RX.test(src)) return false;
  const out=src.replace(REMNANT_RX,'');
  if(out!==src){ fs.writeFileSync(file,out,'utf8'); console.log('Removed React remnant block in', path.relative(ROOT,file)); return true; }
  return false;
}

let count=0; for(const f of walk(ROOT)){ try{ if(processFile(f)) count++; }catch(e){} }
console.log('Done. Modified', count, 'files.');
