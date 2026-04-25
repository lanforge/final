const fs = require('fs');
const glob = require('glob');

const files = glob.sync('ui/src/pages/Admin*.tsx');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;

  // Replacements
  content = content.replace(/className="card /g, 'className="admin-card ');
  content = content.replace(/className="text-2xl font-bold text-white"/g, 'className="text-xl font-medium text-white"');
  content = content.replace(/className="text-gray-400 mt-1"/g, 'className="text-gray-500 text-sm mt-1"');
  content = content.replace(/className="input /g, 'className="admin-input ');

  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Updated ' + file);
  }
});
