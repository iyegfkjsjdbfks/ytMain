#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const IGNORE_DIRS = new Set(['node_modules','dist','build','coverage','.next','.git','.turbo','.cache']);

function walk(dir){
  const out=[]; const entries=fs.readdirSync(dir,{withFileTypes:true});
  for(const e of entries){
    const full=path.join(dir,e.name);
    if(e.isDirectory()){
      if(!IGNORE_DIRS.has(e.name)) out.push(...walk(full));
    } else if(e.isFile() && /\.(ts|tsx)$/.test(e.name) && !/\.d\.ts$/.test(e.name)){
      out.push(full);
    }
  }
  return out;
}

function cleanContent(s){
  let changed=false; let out=s;
  out=out.replace(/^[\t ]*\/\/\/\s*<reference\s+types=["']react\/jsx-runtime["']\s*\/>\s*\n/gm, m=>{changed=true; return ''});
  // Best-effort remove declare global JSX blocks
  const rx=/declare\s+global\s*{[\s\S]*?namespace\s+JSX[\s\S]*?interface\s+IntrinsicElements[\s\S]*?}[\s\S]*?}\s*}/g;
  out=out.replace(rx, m=>{changed=true; return ''});
  return {out,changed};
}

function main(){
  const files=walk(ROOT); let mod=0;
  for(const f of files){
    const s=fs.readFileSync(f,'utf8');
    const {out,changed}=cleanContent(s);
    if(changed){ fs.writeFileSync(f,out,'utf8'); mod++; console.log('Cleaned JSX global in', path.relative(ROOT,f)); }
  }
  console.log('Done. Modified', mod, 'files.');
}

if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('clean-jsx-global.mjs')) main();
