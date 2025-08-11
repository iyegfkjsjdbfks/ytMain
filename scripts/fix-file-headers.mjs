#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const ROOT=process.cwd();
const BAD_HEADER_RX=/(?:^|\A)[\s\S]*?(?=^import\s|^export\s|^\/\/|^\/\*)/m;
const BAD_TOKENS_RX=/(?:^|\n)\s*(,\s*S\s*=\s*\{\}\>\s*\{[\s\S]*?\n\})/m; // specific fragment seen

function walk(dir){
  const out=[]; for(const e of fs.readdirSync(dir,{withFileTypes:true})){
    const full=path.join(dir,e.name);
    if(e.isDirectory()){
      if(!['node_modules','dist','build','.next','.git','coverage'].includes(e.name)) out.push(...walk(full));
    } else if(e.isFile() && /\.(ts|tsx)$/.test(e.name)) out.push(full);
  } return out;
}

function hasCorruptedHeader(s){
  const preImport = s.split(/\n(?=import\s|export\s|\/\/|\/\*)/,1)[0];
  return /interface\s+(JSX|Component|FC)\b|\bIntrinsicElements\b|^,\s*S\s*=/.test(preImport);
}

function fixFile(file){
  let src=fs.readFileSync(file,'utf8');
  if(!hasCorruptedHeader(src)) return false;
  // Remove everything before first import/export/comment
  const m=src.match(/^[\s\S]*?(?=^import\s|^export\s|^\/\/|^\/\*)/m);
  if(m){ src=src.slice(m[0].length); }
  // Remove any lingering bad tokens at start
  src=src.replace(/^\s*}\s*/,'');
  src=src.replace(BAD_TOKENS_RX,'');
  fs.writeFileSync(file,src,'utf8');
  return true;
}

let count=0; for(const f of walk(ROOT)){
  try{ if(fixFile(f)){ count++; console.log('Fixed header in', path.relative(ROOT,f)); } }catch(e){}
}
console.log('Done. Modified', count, 'files.');
