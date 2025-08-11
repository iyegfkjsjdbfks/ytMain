#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const ROOT=process.cwd();
const VALUE_NAMES=new Set(['forwardRef','memo','lazy','Suspense','Fragment','StrictMode','createContext']);

function walk(dir){
  const out=[]; for(const e of fs.readdirSync(dir,{withFileTypes:true})){
    const full=path.join(dir,e.name);
    if(e.isDirectory()){
      if(!['node_modules','dist','build','.git','.next','coverage'].includes(e.name)) out.push(...walk(full));
    } else if(e.isFile() && /\.(ts|tsx)$/.test(e.name)) out.push(full);
  } return out;
}

function processFile(file){
  let src=fs.readFileSync(file,'utf8');
  let changed=false;
  // Find import type { ... } from 'react'
  const rx=/import\s+type\s*\{([^}]+)\}\s*from\s*['"]react['"];?/g;
  let m; let patches=[];
  while((m=rx.exec(src))){
    const names=m[1].split(',').map(s=>s.trim()).filter(Boolean);
    const valueNames=names.filter(n=>VALUE_NAMES.has(n.replace(/\sas\s+\w+$/,'')));
    if(valueNames.length){
      // Remove value names from type import
      const typeOnly=names.filter(n=>!valueNames.includes(n));
      let replacement='';
      if(typeOnly.length) replacement=`import type { ${typeOnly.join(', ')} } from 'react';`;
      const valueImport=`import { ${valueNames.join(', ')} } from 'react';`;
      patches.push({start:m.index,end:m.index+m[0].length, text: replacement ? valueImport+'\n'+replacement : valueImport});
    }
  }
  if(patches.length){
    let out=''; let idx=0;
    for(const p of patches){ out+=src.slice(idx,p.start)+p.text; idx=p.end; }
    out+=src.slice(idx); src=out; changed=true;
  }
  if(changed){ fs.writeFileSync(file,src,'utf8'); console.log('Fixed react type-only import in', path.relative(ROOT,file)); }
  return changed;
}

let count=0; for(const f of walk(ROOT)){ if(processFile(f)) count++; }
console.log('Done. Modified', count, 'files.');
