const fs = require('fs');
const glob = require('glob');

const files = glob.sync('ui/src/pages/Admin*.tsx');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;

  // Thead Backgrounds
  content = content.replace(/className="border-b border-white\/5 bg-\[#050505\][^"]*"/g, 'className="bg-[#11141d] border-b border-[#1f2233]"');
  content = content.replace(/className="bg-\[#050505\] border-b border-white\/5[^"]*"/g, 'className="bg-[#11141d] border-b border-[#1f2233]"');
  content = content.replace(/className="border-b border-white\/5 bg-\[#0a0a0a\][^"]*"/g, 'className="bg-[#11141d] border-b border-[#1f2233]"');
  content = content.replace(/className="border-b border-gray-800 bg-gray-900\/50"/g, 'className="bg-[#11141d] border-b border-[#1f2233]"');
  content = content.replace(/className="bg-\[#11141d\] border-b border-gray-800"/g, 'className="bg-[#11141d] border-b border-[#1f2233]"');

  // TH
  content = content.replace(/<th className="[^"]*">/g, (match) => {
    // preserve text-right or text-center if it exists
    let extra = '';
    if (match.includes('text-right')) extra = ' text-right';
    if (match.includes('text-center')) extra = ' text-center';
    return `<th className="py-4 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider${extra}">`;
  });

  // Tbody
  content = content.replace(/<tbody className="divide-y divide-[^"]*">/g, '<tbody className="divide-y divide-[#1f2233]">');

  // TR hover
  content = content.replace(/<tr key={([^}]*)} className="hover:[^"]*">/g, '<tr key={$1} className="hover:bg-[#1f2233]/30 transition-colors">');
  content = content.replace(/<tr className="hover:[^"]*">/g, '<tr className="hover:bg-[#1f2233]/30 transition-colors">');

  // TD padding
  content = content.replace(/<td className="py-3 px-4/g, '<td className="py-4 px-6');
  content = content.replace(/<td className="px-6 py-4/g, '<td className="py-4 px-6');
  content = content.replace(/<td className="px-4 py-3/g, '<td className="py-4 px-6');

  // Any leftover pagination wrapper backgrounds (bg-[#050505] -> transparent or bg-[#0a0c13])
  content = content.replace(/bg-\[#050505\]/g, 'bg-transparent');

  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Fixed tables ' + file);
  }
});
