/* 汇总 tools/kb/ 各模块，生成 js/data-knowledge.js 并校验结构 */
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const KB = path.join(__dirname, 'kb');
const head = fs.readFileSync(path.join(KB, 'header.js'), 'utf8');
const mods = ['mod1','mod2','mod3','mod4','mod5','mod6','mod7'].map(f => fs.readFileSync(path.join(KB, f + '.js'), 'utf8'));
const foot = fs.readFileSync(path.join(KB, 'footer.js'), 'utf8');
const out = head + mods.join(',\n') + foot;
fs.writeFileSync(path.join(ROOT, 'js', 'data-knowledge.js'), out, 'utf8');
global.window = {};
eval(out);
const K = window.KNOWLEDGE;
let errs = 0;
const ids = new Set();
let secCount = 0, exCount = 0;
K.forEach(m => {
  if (!m.id || !m.name || !m.color || !m.icon || !m.desc || !Array.isArray(m.topics)) { console.log('模块缺字段:', m.name); errs++; }
  m.topics.forEach(t => {
    if (ids.has(t.id)) { console.log('重复知识点:', t.id); errs++; }
    ids.add(t.id);
    ['id','name','goal','pos','sections','key','trap','think'].forEach(k => {
      if (t[k] === undefined) { console.log(t.id, '缺字段', k); errs++; }
    });
    t.sections.forEach((s, i) => {
      secCount++;
      if (s.type === 'ex') {
        exCount++;
        ['q','a','sol'].forEach(k => { if (!s[k]) { console.log(t.id, '例题' + i, '缺' + k); errs++; } });
      } else {
        if (!s.html) { console.log(t.id, '章节' + i, '缺 html'); errs++; }
      }
    });
  });
});
console.log('模块数:', K.length, '知识点数:', ids.size, '章节总数:', secCount, '例题数:', exCount, '结构错误:', errs);
if (errs > 0) process.exit(1);