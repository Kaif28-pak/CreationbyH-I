const fs = require('fs');
const files = ['index.html', 'about-us.html', 'contact.html', 'products.html', 'events.html', 'event-detail.html', 'product-view.html', '404.html'];

let hasError = false;

files.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  const titleMatch = content.match(/<title>([^<]+)<\/title>/);
  const descMatch = content.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i);
  
  const title = titleMatch ? titleMatch[1].trim() : 'NO TITLE';
  const desc = descMatch ? descMatch[1].trim() : 'NO DESC';
  
  console.log(f + ':');
  console.log('  Title (' + title.length + ' chars): ' + title);
  console.log('  Desc  (' + desc.length + ' chars): ' + desc);
  
  if (title.length > 60) {
    console.error('ERROR: TITLE OVER 60 CHARS:', f);
    hasError = true;
  }
  if (desc.length > 155) {
    console.error('ERROR: DESC OVER 155 CHARS:', f);
    hasError = true;
  }
});

// Also check dynamic meta titles in js/products.js
const code = fs.readFileSync('js/products.js', 'utf8');
const catMapMatch = code.match(/const categoryMap = ({[\s\S]*?});\s*if/);
const map = eval('(' + catMapMatch[1] + ')');
for (const [k, v] of Object.entries(map)) {
  const metaTitle = v.metaTitle;
  const metaDesc = v.metaDesc;
  console.log('Category ' + k + ':');
  console.log('  Title (' + metaTitle.length + ' chars): ' + metaTitle);
  console.log('  Desc  (' + metaDesc.length + ' chars): ' + metaDesc);
  if (metaTitle.length > 60) {
    console.error('ERROR: CATEGORY META TITLE OVER 60 CHARS:', k, metaTitle.length);
    hasError = true;
  }
  if (metaDesc.length > 155) {
    console.error('ERROR: CATEGORY META DESC OVER 155 CHARS:', k, metaDesc.length);
    hasError = true;
  }
}

if (hasError) {
  process.exit(1);
} else {
  console.log('SUCCESS: ALL TITLES <= 60 AND ALL DESCS <= 155!');
}
