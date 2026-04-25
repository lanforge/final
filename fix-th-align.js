const fs = require('fs');
const glob = require('glob');

const files = glob.sync('ui/src/pages/Admin*.tsx');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;

  content = content.replace(/<th className="([^"]*)">/g, (match, classes) => {
    if (!classes.includes('text-center') && !classes.includes('text-right') && !classes.includes('text-left')) {
      return `<th className="${classes} text-left">`;
    }
    return match;
  });

  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Fixed TH ' + file);
  }
});
