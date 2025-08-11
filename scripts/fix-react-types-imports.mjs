#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const IGNORES = new Set(['node_modules','dist','build','.next','.git','coverage']);

const TYPES = ['FC','ReactNode','ReactElement','ChangeEvent','KeyboardEvent','MouseEvent','InputHTMLAttributes','TextareaHTMLAttributes'];

function walk(dir){
  const out=[];
  for(const e of fs.readdirSync(dir,{withFileTypes:true})){
    const full=path.join(dir,e.name);
    if(e.isDirectory()){
      if(!IGNORES.has(e.name)) out.push(...walk(full));
    } else if(e.isFile() && /\.(tsx?)$/.test(e.name)){
      out.push(full);
    }
  }
  return out;
}

function ensureReactTypeImports(file){
  let src = fs.readFileSync(file,'utf8');
  if(!TYPES.some(t=>new RegExp(`\\b${t}\\b`).test(src))) return false;

  const hasReactImport = /import\s+React(\s*,\s*\{[^}]*\})?\s+from\s+['"]react['"];?/.test(src);
  const namedRe = /import\s+\{([^}]+)\}\s+from\s+['"]react['"];?/;

  let changed=false;

  if(namedRe.test(src)){
    src = src.replace(namedRe, (full, inside) => {
      const names = new Set(inside.split(',').map(s=>s.trim()).filter(Boolean));
      let add=false; for(const t of TYPES){ if(src.includes(t) && !names.has(t)){ names.add(t); add=true; } }
      if(!add) return full;
      changed=true;
      return `import { ${Array.from(names).join(', ')} } from 'react';`;
    });
  } else if(hasReactImport){
    const lines = src.split(/\r?\n/);
    let insertAt = 0;
    for(let i=0;i<Math.min(20,lines.length);i++){
      if(/import\s+React/.test(lines[i])){ insertAt = i+1; break; }
    }
    const need = TYPES.filter(t=>src.includes(t)).join(', ');
    if(need){
      lines.splice(insertAt,0,`import { ${need} } from 'react';`);
      src = lines.join('\n');
      changed=true;
    }
  } else {
    const need = TYPES.filter(t=>src.includes(t)).join(', ');
    src = `import React, { ${need} } from 'react';\n` + src;
    changed=true;
  }

  if(changed){ fs.writeFileSync(file, src, 'utf8'); return true; }
  return false;
}

let count=0; for(const f of walk(ROOT)){ try{ if(ensureReactTypeImports(f)){ console.log('Ensured React type imports in', path.relative(ROOT,f)); count++; } }catch(e){} }
console.log('Done. Modified', count, 'files.');
