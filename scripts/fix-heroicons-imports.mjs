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

const heroRx=/import\s+([^;]+)\s+from\s+['"]@heroicons\/react\/24\/(outline|solid)['"];?/g;

function fixImport(spec,group){
  // Remove default identifiers: e.g., PauseIcon, { PlayIcon } -> { PauseIcon, PlayIcon }
  let m=spec.trim();
  // Cases: Default only, default + named, only named (ok)
  if(m.startsWith('{')) return null; // already named-only
  // Could be: Name, { A, B }
  const parts=m.split(',');
  const defaultName=parts[0].trim();
  const named=parts.slice(1).join(',');
  let names=[];
  if(named.includes('{')){
    const inside=named.substring(named.indexOf('{')+1,named.lastIndexOf('}')).trim();
    if(inside) names=inside.split(',').map(s=>s.trim()).filter(Boolean);
  }
  if(defaultName){ names.unshift(defaultName); }
  const uniq=[...new Set(names)];
  return `import { ${uniq.join(', ')} } from '@heroicons/react/24/${group}';`;
}

function processFile(file){
  let src=fs.readFileSync(file,'utf8');
  let changed=false;
  src=src.replace(heroRx,(full,spec,group)=>{ const fixed=fixImport(spec,group); if(fixed){ changed=true; return fixed; } return full; });
  if(changed){ fs.writeFileSync(file,src,'utf8'); console.log('Fixed heroicons import in', path.relative(ROOT,file)); }
  return changed;
}

const files=walk(ROOT); let count=0; for(const f of files){ if(processFile(f)) count++; }
console.log('Done. Modified', count, 'files.');
