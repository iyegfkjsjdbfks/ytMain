#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const ROOT=process.cwd();
const HOOKS=['useState','useEffect','useMemo','useCallback','useRef'];

function walk(dir){
  const out=[]; for(const e of fs.readdirSync(dir,{withFileTypes:true})){
    const full=path.join(dir,e.name);
    if(e.isDirectory()){
      if(!['node_modules','dist','build','.next','.git','coverage'].includes(e.name)) out.push(...walk(full));
    } else if(e.isFile() && /\.(ts|tsx)$/.test(e.name)) out.push(full);
  } return out;
}

function parseImports(src){
  const importLines=[...src.matchAll(/import\s+[^;]+from\s+['"]react['"];?/g)].map(m=>m[0]);
  const named=new Set(); let hasReactImport=false;
  for(const line of importLines){
    hasReactImport=true;
    const nm=line.match(/\{([^}]+)\}/);
    if(nm){ nm[1].split(',').map(s=>s.trim()).forEach(n=>named.add(n.split(/\s+as\s+/)[0])); }
  }
  return {hasReactImport,named,importLines};
}

function ensureImports(file){
  let src=fs.readFileSync(file,'utf8');
  if(!/\.(tsx)$/.test(file) && !/React\./.test(src) && !HOOKS.some(h=>src.includes(h))) return false;
  const {hasReactImport,named}=parseImports(src);
  const needed=HOOKS.filter(h=>src.includes(h) && !named.has(h));
  if(needed.length===0) return false;
  let newImport='';
  if(hasReactImport){
    // augment first react import
    src=src.replace(/import\s+([^;]+)from\s+['"]react['"];?/, (full, pre)=>{
      if(pre.includes('{')){
        return full.replace('{', `{ ${needed.join(', ')}, `);
      }
      return `import { ${needed.join(', ')} } from 'react';\n`+full;
    });
  } else {
    newImport=`import { ${needed.join(', ')} } from 'react';\n`;
    src=newImport+src;
  }
  fs.writeFileSync(file,src,'utf8');
  console.log('Added hooks', needed.join(','), 'in', path.relative(ROOT,file));
  return true;
}

let count=0; for(const f of walk(ROOT)){ try{ if(ensureImports(f)) count++; }catch(e){} }
console.log('Done. Modified', count, 'files.');
