const fs = require('fs');
const path = require('path');

const target = process.argv[2] || path.join('dist', 'index.html');

if (!fs.existsSync(target)) {
  console.error(`File not found: ${target}`);
  process.exit(2);
}

let html = fs.readFileSync(target, 'utf8');

const styleTag = '<style>body { overflow: auto !important; }</style>';

if (html.includes(styleTag)) {
  console.log('Overflow style already injected.');
  process.exit(0);
}

if (/<head[^>]*>/i.test(html)) {
  html = html.replace(/(<head[^>]*>)/i, `$1\n    ${styleTag}`);
} else if (/<html[^>]*>/i.test(html)) {
  html = html.replace(/(<html[^>]*>)/i, `$1\n  <head>\n    ${styleTag}\n  </head>`);
} else {
  // fallback: prepend style at the top
  html = `${styleTag}\n${html}`;
}

fs.writeFileSync(target, html, 'utf8');
console.log(`Injected overflow style into: ${target}`);
