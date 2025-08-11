#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const IGNORES = new Set(['node_modules','dist','build','.next','.git','coverage']);

const ROUTER_VALUES = [
  'Link','Outlet','Navigate','useNavigate','useLocation','useParams','useSearchParams','RouteObject'
];

function walk(dir){
  const out=[];
  for(const e of fs.readdirSync(dir,{withFileTypes:true})){
    const full=path.join(dir,e.name);
    if(e.isDirectory()){
      if(!IGNORES.has(e.name)) out.push(...walk(full));
    } else if(e.isFile() && /\.(tsx?|mts|cts)$/.test(e.name)){
      out.push(full);
    }
  }
  return out;
}

function ensureRouterImports(file){
  let src = fs.readFileSync(file,'utf8');
  // Skip if file clearly unrelated
  if(!/\b(Link|Outlet|useNavigate|useLocation|useParams|useSearchParams|RouteObject|Navigate)\b/.test(src)){
    return false;
  }

  let changed = false;
  const needed = new Set();
  for(const name of ROUTER_VALUES){
    if(new RegExp(`(^|[^\"])\\b${name}\\b`).test(src)) needed.add(name);
  }

  // remove ones already imported from react-router-dom
  const importRe = /import\s+\{([^}]+)\}\s+from\s+['"]react-router-dom['"];?/;
  const existing = new Set();
  if(importRe.test(src)){
    src = src.replace(importRe, (full, inside) => {
      inside.split(',').map(s=>s.trim()).filter(Boolean).forEach(spec => {
        const m = spec.match(/^(\w+)/);
        if(m) existing.add(m[1]);
      });
      // We'll rebuild later including new names
      return full;
    });
  }
  for(const ex of existing){ needed.delete(ex); }
  if(needed.size === 0) return false;

  if(importRe.test(src)){
    src = src.replace(importRe, (full, inside) => {
      const names = new Set(inside.split(',').map(s=>s.trim()).filter(Boolean).map(s=>s.split(/\s+as\s+/)[0]));
      let added = false;
      for(const n of needed){ if(!names.has(n)){ names.add(n); added=true; } }
      if(!added) return full;
      changed = true;
      return `import { ${Array.from(names).join(', ')} } from 'react-router-dom';`;
    });
  } else {
    // Insert after first import line or at top
    const lineIdx = src.indexOf('\n');
    const importLine = `import { ${Array.from(needed).join(', ')} } from 'react-router-dom';\n`;
    if(lineIdx !== -1){
      src = src.slice(0,0) + importLine + src;
    } else {
      src = importLine + src;
    }
    changed = true;
  }

  if(changed){ fs.writeFileSync(file, src, 'utf8'); return true; }
  return false;
}

let count=0;
for(const f of walk(ROOT)){
  try{ if(ensureRouterImports(f)){ console.log('Ensured router imports in', path.relative(ROOT,f)); count++; } }catch(e){}
}
console.log('Done. Modified', count, 'files.');
