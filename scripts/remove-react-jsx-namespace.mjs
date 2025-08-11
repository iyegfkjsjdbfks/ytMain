#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const IGNORE = new Set(['node_modules','dist','build','.next','.git','coverage']);

function walk(dir){
  const ents=fs.readdirSync(dir,{withFileTypes:true});
  const out=[];
  for(const e of ents){
    const full=path.join(dir,e.name);
    if(e.isDirectory()){ if(!IGNORE.has(e.name)) out.push(...walk(full)); }
    else if(e.isFile() && /\.(ts|tsx)$/.test(e.name)) out.push(full);
  }
  return out;
}

const patterns=[
  // declare namespace React { interface JSX { IntrinsicElements; } }
  { re:/declare\s+namespace\s+React\s*\{[\s\S]*?interface\s+JSX\s*\{\s*IntrinsicElements\s*;?\s*\}[\s\S]*?\}/g, desc:'remove React JSX namespace stub' },
  // Minimal variants like declare namespace React { interface JSX { IntrinsicElements } }
  { re:/declare\s+namespace\s+React\s*\{[\s\S]*?interface\s+JSX\s*\{\s*IntrinsicElements\s*\}[\s\S]*?\}/g, desc:'remove minimal React JSX namespace' }
];

function processFile(f){
  const src=fs.readFileSync(f,'utf8');
  let out=src; let changed=false;
  for(const {re} of patterns){ out=out.replace(re,()=>{changed=true; return ''}); }
  if(changed){ fs.writeFileSync(f,out,'utf8'); return true; }
  return false;
}

const files=walk(ROOT);
let count=0;
for(const f of files){ if(processFile(f)) { count++; console.log('Removed React JSX namespace in', path.relative(ROOT,f)); } }
console.log('Done. Modified', count, 'files.');
