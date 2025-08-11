#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const ROOT=process.cwd();
const REACT_VALUES=['memo','lazy','Suspense','forwardRef','Fragment','StrictMode','createContext','useContext'];

function walk(dir){
  const out=[]; for(const e of fs.readdirSync(dir,{withFileTypes:true})){
    const full=path.join(dir,e.name);
    if(e.isDirectory()){
      if(!['node_modules','dist','build','.next','.git','coverage'].includes(e.name)) out.push(...walk(full));
    } else if(e.isFile() && /\.(ts|tsx)$/.test(e.name)) out.push(full);
  } return out;
}

function ensureReactValues(file){
  let src=fs.readFileSync(file,'utf8');
  let changed=false;
  const needs=REACT_VALUES.filter(v=>src.includes(v));
  if(!needs.length) return false;
  const importRx=/import\s+\{([^}]+)\}\s+from\s+['"]react['"];?/;
  const hasDefaultRx=/import\s+React(\s*,\s*\{[^}]*\})?\s+from\s+['"]react['"];?/;
  if(importRx.test(src)){
    src=src.replace(importRx,(full, inside)=>{
      const names=new Set(inside.split(',').map(s=>s.trim()).filter(Boolean).map(s=>s.split(/\s+as\s+/)[0]));
      let added=false; for(const v of needs){ if(!names.has(v)){ names.add(v); added=true; } }
      if(!added) return full;
      changed=true;
      return `import { ${Array.from(names).join(', ')} } from 'react';`;
    });
  } else if(hasDefaultRx.test(src)){
    src=src.replace(hasDefaultRx,(full, grp)=>{
      // Ensure we have a named import block appended
      changed=true;
      return `${full}\nimport { ${needs.join(', ')} } from 'react';`;
    });
  } else {
    // No react import lines at all
    src=`import React, { ${needs.join(', ')} } from 'react';\n`+src;
    changed=true;
  }
  if(changed){ fs.writeFileSync(file,src,'utf8'); console.log('Ensured React values in', path.relative(ROOT,file)); }
  return changed;
}

let count=0; for(const f of walk(ROOT)){ try{ if(ensureReactValues(f)) count++; }catch(e){} }
console.log('Done. Modified', count, 'files.');
