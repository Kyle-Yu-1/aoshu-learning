const fs = require('fs'), path = require('path');
const F = path.join(__dirname, '..', 'js', 'data-questions.js');
let txt = fs.readFileSync(F, 'utf8');
const FIXID = {
 44:'求“凹”字形多边形', 51:'以直角三角形两直角边为直径向外作半圆，再以斜边为直径作半圆',
 234:'由四个全等直角三角形拼成的赵爽弦图中', 246:'在棱长 3 的正方体一个面的正中央',
 249:'正方体的展开图中，与某个面相对的面', 253:'一个圆柱沿底面直径切成两个完全相同的半圆柱'
};
let n = 0;
for (const idStr of Object.keys(FIXID)) {
  const mark = FIXID[idStr];
  const mi = txt.indexOf(mark);
  if (mi < 0) throw new Error('未找到: ' + idStr);
  const lineStart = txt.lastIndexOf('\n', mi);
  if (txt.slice(lineStart + 1, lineStart + 3) !== '{m') {
    // 该行若已含 id:N 则跳过
    if (new RegExp('^\\{id:' + idStr + ',').test(txt.slice(lineStart + 1))) continue;
  }
  txt = txt.slice(0, lineStart + 1) + '{id:' + idStr + ',' + txt.slice(lineStart + 2);
  n++;
}
fs.writeFileSync(F, txt, 'utf8');
console.log('补回 id：' + n + ' 行');