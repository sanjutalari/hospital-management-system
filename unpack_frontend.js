const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'frontend', 'src');
const appJsxContent = fs.readFileSync(path.join(__dirname, 'App.jsx'), 'utf8');

const blocks = appJsxContent.split('// ─────────────────────────────────────────────────────────────');

blocks.forEach(block => {
  // Look for something like "// file/path.js" or "// App.jsx - Root router"
  const lines = block.trim().split('\n');
  if (lines.length > 2) {
    let filenameMatch = lines[0].match(/\/\/\s*([a-zA-Z0-9_\-\.\/]+)/);
    if (filenameMatch) {
      let relativePath = filenameMatch[1];
      if (relativePath === 'App.jsx') relativePath = 'App.jsx'; // handle comment variations
      
      const fullPath = path.join(srcDir, relativePath);
      // Ensure directory exists
      fs.mkdirSync(path.dirname(fullPath), { recursive: true });
      // Write content skipping the first line (the file header comment)
      fs.writeFileSync(fullPath, lines.slice(2).join('\n').trim());
      console.log(`Created ${relativePath}`);
    }
  }
});
