const fs = require('fs'), path = require('path');
const F = path.join(__dirname, '..', 'js', 'data-questions.js');
let txt = fs.readFileSync(F, 'utf8');
const MAP = { 647:'一个数除以 12 余 6', 662:'计算 999999×999999 的积中' };
let n = 0;
for (const idStr of Object.keys(MAP)) {
  const mi = txt.indexOf(MAP[idStr]);
  if (mi < 0) throw new Error('未找到 ' + idStr);
  const lineStart = txt.lastIndexOf('\n', mi);
  const head = txt.slice(lineStart + 1, lineStart + 5);
  if (head.startsWith('{id:')) { console.log('已修复 跳过 ' + idStr); continue; }
  txt = txt.slice(0, lineStart + 1) + '{id:' + idStr + ',' + txt.slice(lineStart + 2);
  n++;
}
fs.writeFileSync(F, txt, 'utf8');
console.log('补回 id：' + n);