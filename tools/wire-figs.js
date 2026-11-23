/* 接入配图：figs.js 引入 + app.js 三处题目区与知识例题渲染 fig */
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');

/* 1) index.html 引入 figs.js */
let html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
if (html.indexOf('js/figs.js') < 0) {
  html = html.replace('<script src="js/data-source.js"></script>', '<script src="js/data-source.js"></script>\n<script src="js/figs.js"></script>');
  fs.writeFileSync(path.join(ROOT, 'index.html'), html, 'utf8');
  console.log('index.html 已引入 figs.js');
}

/* 2) app.js：helper + 三处 q-text 渲染 fig + 例题渲染 */
let app = fs.readFileSync(path.join(ROOT, 'js', 'app.js'), 'utf8');
const helper = "  const figOf = q => (q && q.fig && window.FIG) ? window.FIG(q.fig) : '';";
if (app.indexOf('const figOf') < 0) {
  const escAnchor = "  function esc(s){ return String(s??'').replace(/&/g,'&amp;')";
  app = app.replace(escAnchor, helper + '\n' + escAnchor);
  console.log('helper 已插入');
}
const R1 = "<div class=\"q-text\">${esc(q.q)}</div>\n        ${q.opts ?";
if (app.indexOf(R1) < 0) throw new Error('锚点1 未找到');
app = app.split(R1).join("<div class=\"q-text\">${esc(q.q)}</div>\n        ${figOf(q)}\n        ${q.opts ?");
const R2 = "<div class=\"q-text\" style=\"font-size:16px;font-weight:600;margin:10px 0\">${esc(q.q)}</div>";
if (app.indexOf(R2) < 0) throw new Error('锚点2 未找到');
app = app.split(R2).join(R2 + "\n        ${figOf(q)}");
const R3 = "<div class=\"q-text\">${esc(q.q)}</div>\n          <div style=\"display:flex;gap:8px\">";
if (app.indexOf(R3) < 0) throw new Error('锚点3 未找到');
app = app.split(R3).join("<div class=\"q-text\">${esc(q.q)}</div>\n          ${figOf(q)}\n          <div style=\"display:flex;gap:8px\">");
const R4 = "<div class=\"ex-q\">📝 ${esc(s.q)}</div>";
if (app.indexOf(R4) < 0) throw new Error('锚点4 未找到');
app = app.split(R4).join(R4 + "\n      ${s.fig ? window.FIG(s.fig) : ''}");
fs.writeFileSync(path.join(ROOT, 'js', 'app.js'), app, 'utf8');
console.log('app.js 配图接入完成');
