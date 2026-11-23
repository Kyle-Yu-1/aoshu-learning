/* 按 docs/题库出题与审题提示词.md 审题修复：44/246/51/234/249/253 */
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
let txt = fs.readFileSync(path.join(ROOT, 'js', 'data-questions.js'), 'utf8');
function qs(v){ return JSON.stringify(v).replace(/"/g, "'"); }
const FIX = {
 44:{q:'求“凹”字形多边形（外框是长方形，缺口在一个角上）阴影面积最常用的方法是？',opts:['添补法','平移法','对称法','测量法'],ans:'添补法',explain:'凹字形面积最常用添补法：补上缺口变成长方形，用长方形面积减缺口面积。',hint:'补全再减。'},
 246:{q:'在棱长 3 的正方体一个面的正中央，挖去一个棱长 1 的小正方体（深 1，不贯穿），表面积如何变化？',opts:['增加 4','减少 4','不变','增加 6'],ans:'增加 4',explain:'少 1 个 1×1 的外露面，多 5 个 1×1 的新面，净增 4。',hint:'数增减的面。'},
 51:{q:'以直角三角形两直角边为直径向外作半圆，再以斜边为直径作半圆，两个“月牙形”（直角边半圆与斜边半圆之间的部分）面积之和等于什么？',ans:'三角形面积',explain:'由勾股定理，两直角边半圆面积之和 = 斜边半圆面积，故两个月牙面积之和 = 三角形面积。',hint:'勾股 + 面积和。'},
 234:{q:'由四个全等直角三角形拼成的赵爽弦图中，大正方形面积等于？',explain:'弦图既分割成 4 个三角形+中间小正方形，又等于斜边平方 c²=a²+b²。'},
 249:{q:'正方体的展开图中，与某个面相对的面，在展开图上通常与它隔几个格？',explain:'正方体展开图中对面“隔一格”，呈“日”字跳格。'},
 253:{q:'一个圆柱沿底面直径切成两个完全相同的半圆柱，表面积增加了 48 平方厘米。每个切面（直径×高）的面积是多少？',explain:'增加 2 个切面，每个切面面积 = 48÷2 = 24。',hint:'增加两个切面。'}
};
let fixed = 0;
for (const idStr of Object.keys(FIX)) {
  const re = new RegExp('^\\{id:' + idStr + ',', 'm');
  const m = txt.match(re);
  if (!m) throw new Error('题未找到: ' + idStr);
  const start = m.index;
  const end = txt.indexOf('\n', start);
  const line = txt.slice(start, end);
  const f = FIX[idStr];
  const keys = ['id','mod','topic','diff','type','q','opts','ans','explain','hint'];
  const q = {};
  for (const k of keys) {
    if (k === 'opts') { const om = line.match(/opts:\[(.*?)\]/); if (om) q.opts = om[1].split(',').map(s=>s.replace(/^'|'$/g,'')); }
    else if (k === 'diff') { const dm = line.match(/diff:(\d)/); q.diff = +dm[1]; }
    else { const sm = line.match(new RegExp(k + ":'([^']*)'")); if (sm) q[k] = sm[1]; }
  }
  Object.assign(q, f);
  const parts = [];
  for (const k of keys) {
    if (q[k] === undefined) continue;
    if (Array.isArray(q[k])) parts.push(k + ':[' + q[k].map(qs).join(',') + ']');
    else if (typeof q[k] === 'string') parts.push(k + ':' + qs(q[k]));
    else parts.push(k + ':' + q[k]);
  }
  txt = txt.slice(0, start) + '{' + parts.join(',') + '},' + txt.slice(end);
  fixed++;
  console.log('fixed #' + idStr);
}
fs.writeFileSync(path.join(ROOT, 'js', 'data-questions.js'), txt, 'utf8');
console.log('共修复 ' + fixed + ' 题');
