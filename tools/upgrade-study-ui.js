/* 知识页 UI 升级：支持 intro/tip/trap/formula/ex(think+sum) 新章节类型（避免模板串嵌套） */
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');

let app = fs.readFileSync(path.join(ROOT, 'js', 'app.js'), 'utf8');

/* 1) sec-body 渲染改走 renderSection */
const a1 = '<div class="sec-body">${s.type===' + "'ex'" + ' ? renderExample(s, id, i) : s.html}</div>';
const b1 = '<div class="sec-body">${renderSection(s, id, i)}</div>';
if (app.indexOf(a1) < 0) throw new Error('锚点1未找到');
app = app.split(a1).join(b1);

/* 2) 在章节列表前插入 本讲目标/地位 两行 */
const a2 = '${topic.sections.map((s, i) => `';
const b2 = '${topic.goal?`<div class="goalbox">🎯 <b>本讲目标：</b>${esc(topic.goal)}</div>`:' + "'" + "'}\n" +
  '      ${topic.pos?`<div class="posline">📌 ${esc(topic.pos)}</div>`:' + "'" + "'}\n      " + a2;
if (app.indexOf(a2) < 0) throw new Error('锚点2未找到');
app = app.split(a2).join(b2);

/* 3) 替换 renderExample 为 renderSection + 新 renderExample */
const s3 = app.indexOf('  function renderExample(s, topicId, secIdx){');
if (s3 < 0) throw new Error('锚点3未找到');
const e3 = app.indexOf('\n  }', s3);
if (e3 < 0) throw new Error('锚点3结束未找到');
const newFunc = '  function renderSection(s, topicId, secIdx){\n' +
  '    if(s.type===' + "'ex'" + ') return renderExample(s, topicId, secIdx);\n' +
  '    if(s.type===' + "'tip'" + ') return `<div class="tipbox">🧭 <b>名师锦囊</b>${s.html}</div>`;\n' +
  '    if(s.type===' + "'trap'" + ') return `<div class="warnbox" style="margin-top:0">⚠️ ${s.html}</div>`;\n' +
  '    if(s.type===' + "'formula'" + ') return `<div class="formulabox">${s.html}</div>`;\n' +
  '    if(s.type===' + "'intro'" + ') return `<div class="introbox">${s.html}</div>`;\n' +
  '    return s.html;\n' +
  '  }\n' +
  '  function renderExample(s, topicId, secIdx){\n' +
  '    return `<div class="exbox"><div class="ex-q">📝 ${esc(s.q)}</div>\n' +
  '      ${s.think?`<div class="thinkline">💭 <b>思路点拨：</b>${esc(s.think)}</div>`:' + "'" + "'}\n" +
  '      <div><button class="btn sm show-sol">显示答案与解析</button></div>\n' +
  '      <div class="sol"><b>答案：</b>${esc(s.a)}<br><b>解析：</b>${esc(s.sol)}</div>\n' +
  '      ${s.sum?`<div class="sumbox">🌟 <b>规律总结：</b>${esc(s.sum)}</div>`:' + "'" + "'}</div>`;\n" +
  '  }';
app = app.slice(0, s3) + newFunc + app.slice(e3 + 4);
fs.writeFileSync(path.join(ROOT, 'js', 'app.js'), app, 'utf8');
console.log('app.js 已升级');

const css = fs.readFileSync(path.join(ROOT, 'css', 'style.css'), 'utf8');
if (css.indexOf('.goalbox') >= 0) throw new Error('CSS 已存在，勿重复');
const addCss = '\n/* ---- 知识学习 v2：讲师式讲解样式 ---- */\n' +
'.goalbox{background:#eef2ff;border-left:4px solid #6366f1;padding:8px 12px;border-radius:8px;margin:6px 0 4px;font-size:14px;line-height:1.7}\n' +
'.posline{color:var(--muted);font-size:12px;margin:0 0 10px}\n' +
'.introbox{background:linear-gradient(135deg,#f8fafc,#eef2ff);border-left:4px solid #818cf8;padding:10px 14px;border-radius:10px;font-size:14px;line-height:1.9}\n' +
'.tipbox{background:#fffbeb;border-left:4px solid #f59e0b;padding:10px 14px;border-radius:10px;font-size:14px;line-height:1.9}\n' +
'.formulabox{background:#f5f3ff;border:1px dashed #a78bfa;padding:8px 14px;border-radius:10px;text-align:center;font-size:15px;line-height:1.9}\n' +
'.ex-q{font-size:15px;line-height:1.8;margin-bottom:8px}\n' +
'.thinkline{color:#0f766e;background:#f0fdfa;border-left:4px solid #14b8a6;padding:6px 10px;border-radius:6px;margin:6px 0;font-size:14px;line-height:1.8}\n' +
'.sumbox{background:#fff7ed;border-left:4px solid #f97316;padding:6px 10px;border-radius:6px;margin-top:8px;font-size:14px;line-height:1.8}\n' +
'.exbox .sol{line-height:1.9}\n' +
'.section-item .sec-head{font-size:15px}\n' +
'.section-item .sec-body p{line-height:1.9;margin:6px 0}\n';
fs.writeFileSync(path.join(ROOT, 'css', 'style.css'), css + addCss, 'utf8');
console.log('style.css 已升级');