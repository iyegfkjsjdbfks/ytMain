const fs = require('fs');
const path = require('path');

// Helper function to fix file
function fixFile(filePath, fixFunction) {
    try {
        if (!fs.existsSync(filePath)) {
            console.log(`File not found: ${filePath}`);
            return false;
        }
        
        const content = fs.readFileSync(filePath, 'utf-8');
        const fixed = fixFunction(content);
        
        if (fixed !== content) {
            fs.writeFileSync(filePath, fixed, 'utf-8');
            console.log(`✅ Fixed: ${path.basename(filePath)}`);
            return true;
        } else {
            console.log(`ℹ️ No changes needed: ${path.basename(filePath)}`);
            return false;
        }
    } catch (error) {
        console.error(`❌ Error fixing ${filePath}:`, error.message);
        return false;
    }
}

// Fix Layout.tsx - remove extra closing tag
function fixLayout(content) {
    // Remove the orphaned /> on line 112
    const lines = content.split('\n');
    
    // Find and remove the orphaned /> tag around line 112
    for (let i = 110; i < Math.min(115, lines.length); i++) {
        if (lines[i].trim() === '/>') {
            lines[i] = ''; // Remove the orphaned tag
            break;
        }
    }
    
    // Also uncomment any FIXED comments
    return lines.map(line => {
        if (line.includes('// FIXED:')) {
            return line.replace('// FIXED:', '').trim();
        }
        return line;
    }).join('\n');
}

// Fix ProtectedRoute.tsx - remove duplicate imports
function fixProtectedRoute(content) {
    // Fix duplicate useLocation import
    const fixed = content.replace(
        /import\s*{\s*useLocation\s*,\s*Navigate\s*,\s*useLocation\s*}\s*from\s*['"]react-router-dom['"]/,
        "import { useLocation, Navigate } from 'react-router-dom'"
    );
    
    // Also remove duplicate type React import if present
    return fixed.replace(
        /import\s+React\s*,\s*{\s*FC\s*,\s*ReactNode\s*,\s*type\s+React\s*}/,
        "import React, { FC, ReactNode }"
    );
}

// Fix StudioLayout.tsx - fix JSX structure
function fixStudioLayout(content) {
    // Replace commented closing tags with actual tags
    let fixed = content;
    
    // Look for the pattern where we have comments instead of actual JSX
    fixed = fixed.replace(/\/\/\s*FIXED:\s*<\/main>/g, '</main>');
    fixed = fixed.replace(/\/\/\s*FIXED:\s*<\/div>/g, '</div>');
    
    // If the file has structural issues, try to rebuild the component
    if (fixed.includes('// FIXED:')) {
        const lines = fixed.split('\n');
        const fixedLines = [];
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            
            // Skip lines that are just comments with FIXED:
            if (line.trim().startsWith('// FIXED:')) {
                // Extract the actual JSX from the comment
                const jsxPart = line.replace('// FIXED:', '').trim();
                fixedLines.push(jsxPart);
            } else {
                fixedLines.push(line);
            }
        }
        
        fixed = fixedLines.join('\n');
    }
    
    return fixed;
}

// Fix HomePage.tsx - fix invalid JSX
function fixHomePage(content) {
    const lines = content.split('\n');
    const fixedLines = [];
    
    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
        
        // Check for orphaned > character around line 79
        if (i >= 75 && i <= 85) {
            // Remove standalone > characters that aren't part of JSX tags
            if (line.trim() === '>') {
                continue; // Skip this line
            }
            // Fix lines with orphaned closing brackets
            line = line.replace(/^\s*>\s*$/, '');
        }
        
        // Also uncomment any FIXED comments
        if (line.includes('// FIXED:')) {
            line = line.replace('// FIXED:', '').trim();
        }
        
        fixedLines.push(line);
    }
    
    return fixedLines.filter(line => line !== undefined).join('\n');
}

// Main execution
console.log('🔧 Fixing dev server syntax errors...\n');

const fixes = [
    {
        path: path.join(process.cwd(), 'components', 'Layout.tsx'),
        fix: fixLayout
    },
    {
        path: path.join(process.cwd(), 'components', 'ProtectedRoute.tsx'),
        fix: fixProtectedRoute
    },
    {
        path: path.join(process.cwd(), 'components', 'StudioLayout.tsx'),
        fix: fixStudioLayout
    },
    {
        path: path.join(process.cwd(), 'pages', 'HomePage.tsx'),
        fix: fixHomePage
    }
];

let totalFixed = 0;

fixes.forEach(({ path: filePath, fix }) => {
    if (fixFile(filePath, fix)) {
        totalFixed++;
    }
});

console.log(`\n✨ Fixed ${totalFixed} files`);
console.log('\n💡 Next steps:');
console.log('1. The dev server should automatically reload with these fixes');
console.log('2. Check the browser console for any remaining errors');
console.log('3. If errors persist, we can fix them iteratively');
