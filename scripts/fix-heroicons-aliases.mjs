#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const IGNORES = new Set(['node_modules','dist','build','.next','.git','coverage']);

function walk(dir){
  const out=[];
  for(const entry of fs.readdirSync(dir,{withFileTypes:true})){
    const full=path.join(dir,entry.name);
    if(entry.isDirectory()){
      if(!IGNORES.has(entry.name)) out.push(...walk(full));
    } else if(entry.isFile() && /\.(tsx?|mts|cts)$/.test(entry.name)){
      out.push(full);
    }
  }
  return out;
}

const solidRe = /import\s*\{([^}]+)\}\s*from\s*['"]@heroicons\/react\/24\/solid['"];?/g;
const outlineRe = /import\s*\{([^}]+)\}\s*from\s*['"]@heroicons\/react\/24\/outline['"];?/g;

function normalizeSpecList(specList){
  // returns array of {orig, name, alias}
  return specList
    .split(',')
    .map(s=>s.trim())
    .filter(Boolean)
    .map(s=>{
      // handle existing alias: Name as Alias
      const m = s.match(/^(\w+)\s+as\s+(\w+)$/);
      if(m) return { orig: s, name: m[1], alias: m[2] };
      return { orig: s, name: s, alias: null };
    });
}

function applyFix(file){
  let src = fs.readFileSync(file,'utf8');
  let changed = false;

  // Rewrite solid imports to alias as NameSolidIcon
  src = src.replace(solidRe, (_full, inside) => {
    const specs = normalizeSpecList(inside);
    const rewritten = specs.map(({name, alias}) => {
      const base = /Icon$/.test(name) ? name.replace(/Icon$/, '') : name; // e.g., HeartIcon -> Heart
      const newAlias = `${base}SolidIcon`;
      if(alias === newAlias) return `${name} as ${alias}`;
      changed = true;
      return `${name} as ${newAlias}`;
    }).join(', ');
    return `import { ${rewritten} } from '@heroicons/react/24/solid';`;
  });

  // Ensure outline imports don't collide; keep names as-is
  // but compress whitespace for consistency
  src = src.replace(outlineRe, (_full, inside) => {
    const specs = normalizeSpecList(inside).map(({name, alias}) => alias ? `${name} as ${alias}` : name).join(', ');
    return `import { ${specs} } from '@heroicons/react/24/outline';`;
  });

  // Add compatibility aliases for IconSolid variant when SolidIcon exists
  // e.g. const BellIconSolid = BellSolidIcon;
  // Only add once per file right after the first heroicons import block
  if(changed){
    const lines = src.split(/\r?\n/);
    let insertIdx = -1;
    const importedSolidAliases = new Set();
    for(let i=0;i<lines.length;i++){
      if(lines[i].includes("@heroicons/react/24/solid")){
        insertIdx = i+1;
        // Parse that import line to collect alias names
        const m = lines[i].match(/\{([^}]+)\}/);
        if(m){
          const items = m[1].split(',').map(s=>s.trim()).filter(Boolean);
          for(const it of items){
            const mm = it.match(/^(\w+)\s+as\s+(\w+)$/);
            if(mm){
              importedSolidAliases.add(mm[2]);
            }
          }
        }
        break;
      }
    }
    if(insertIdx !== -1 && importedSolidAliases.size){
      const extra = [];
      for(const a of importedSolidAliases){
        // a is like PlaySolidIcon -> derive IconSolid variant
        if(a.endsWith('SolidIcon')){
          const base = a.slice(0, -'SolidIcon'.length); // Play
          const variant = `${base}IconSolid`;
          extra.push(`const ${variant} = ${a};`);
        }
      }
      if(extra.length){
        lines.splice(insertIdx, 0, ...extra);
        src = lines.join('\n');
      }
    }
  }

  if(changed){
    fs.writeFileSync(file, src, 'utf8');
    return true;
  }
  return false;
}

let count=0;
for(const f of walk(ROOT)){
  try{
    if(applyFix(f)){
      console.log('Fixed heroicons imports in', path.relative(ROOT,f));
      count++;
    }
  }catch(e){/* ignore */}
}
console.log('Done. Modified', count, 'files.');
