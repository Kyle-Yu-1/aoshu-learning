const fs = require('fs'), path = require('path');
const F = path.join(__dirname, '..', 'js', 'data-questions.js');
let txt = fs.readFileSync(F, 'utf8');
function qs(v){ return JSON.stringify(v).replace(/"/g, "'"); }
const FIX = {
 647:{ans:'30',explain:'逐步满足：÷12 余 6 的数 6、18、30、42…；30÷18 = 1 余 12 ✓，最小 30。',hint:'从 6 起每次加 12，试除 18。'},
 662:{ans:'5',explain:'999999×999999 = (1000000−1)² = 999998000001，其中数字 9 有 5 个。',hint:'凑整展开。'}
};
let n=0;
for (const idStr of Object.keys(FIX)) {
  const re = new RegExp('^\\{id:' + idStr + ',', 'm');
  const m = txt.match(re);
  if (!m) throw new Error('未找到 ' + idStr);
  const start = m.index, end = txt.indexOf('\n', start);
  const line = txt.slice(start, end);
  const q = {};
  for (const k of ['id','mod','topic','diff','type','q','opts','ans','explain','hint']) {
    if (k === 'opts') { const om = line.match(/opts:\[(.*?)\]/); if (om) q.opts = om[1].split(',').map(s=>s.replace(/^'|'$/g,'')); }
    else if (k === 'diff') { const dm = line.match(/diff:(\d)/); q.diff = +dm[1]; }
    else { const sm = line.match(new RegExp(k + ":'([^']*)'")); if (sm) q[k] = sm[1]; }
  }
  Object.assign(q, FIX[idStr]);
  const keys = ['id','mod','topic','diff','type','q','opts','ans','explain','hint'];
  const parts = [];
  for (const k of keys) {
    if (q[k] === undefined) continue;
    if (Array.isArray(q[k])) parts.push(k + ':[' + q[k].map(qs).join(',') + ']');
    else if (typeof q[k] === 'string') parts.push(k + ':' + qs(q[k]));
    else parts.push(k + ':' + q[k]);
  }
  txt = txt.slice(0, start) + '{' + parts.join(',') + '},' + txt.slice(end);
  n++;
}
fs.writeFileSync(F, txt, 'utf8');
console.log('修正 ' + n + ' 题');