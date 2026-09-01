const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir('c:/Tienda_Ropa/frontend/src', function(filePath) {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    
    // Replace double quote literal URLs
    content = content.replace(/"http:\/\/localhost:3000([^"]*)"/g, '`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}$1`');
    // Replace single quote literal URLs
    content = content.replace(/'http:\/\/localhost:3000([^']*)'/g, '`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}$1`');
    // Replace template literal URLs
    content = content.replace(/`http:\/\/localhost:3000([^`]*)`/g, '`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}$1`');
    
    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('Updated: ' + filePath);
    }
  }
});
