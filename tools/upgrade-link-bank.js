/* 知识页真题链接 → 直达题库对应题目 */
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
let app = fs.readFileSync(path.join(ROOT, 'js', 'app.js'), 'utf8');

/* 1) renderSection：真题链接章节后追加配套真题块 */
const a1 = '    return s.html;\n  }';
const b1 = "    if(s.title && s.title.indexOf('真题链接') >= 0) return s.html + relatedBankHtml(topicId);\n    return s.html;\n  }";
if (app.indexOf(a1) < 0) throw new Error('锚点1未找到');
app = app.split(a1).join(b1);

/* 2) 在 renderExample 结束后插入 relatedBankHtml 与跳转函数 */
const a2 = "      ${s.sum?`<div class=\"sumbox\">🌟 <b>规律总结：</b>${esc(s.sum)}</div>`:''}</div>`;\n  }";
if (app.indexOf(a2) < 0) throw new Error('锚点2未找到');
const newFuncs = [
'',
"  function relatedBankHtml(topicId){",
"    const qs = QUESTIONS.filter(q => q.topic === topicId);",
"    if(!qs.length) return '';",
"    const real = qs.filter(q => /真题|面测|面谈|分班考|杯赛|竞赛|迎春|希望杯|华罗庚|华杯|名校/.test(srcOf(q)));",
"    const list = (real.length ? real : qs).slice(0, 6);",
'    return `<div class="relatedbox"><div class="rel-head">📌 本讲配套真题（题库共 ${qs.length} 题，点击题号直达题库）</div>',
'      <div class="rel-list">${list.map(q => `<button class="rel-item" data-qid="${q.id}" title="${esc(srcOf(q))}"><b>#${q.id}</b> ${esc(q.q.slice(0,30))}${q.q.length>30?"…":""}</button>`).join("")}</div>',
'      <button class="btn sm rel-all" data-topic="${topicId}">查看本讲全部 ${qs.length} 道题 →</button></div>`;',
"  }",
"  function goToBankTopic(topicId){",
"    switchPage('bank');",
"    const sel = $('#bankTopic'); if(sel) sel.value = topicId;",
"    const kw = $('#bankSearch'); if(kw) kw.value = '';",
"    const st = $('#bankStatus'); if(st) st.value = '';",
"    const df = $('#bankDiff'); if(df) df.value = '';",
"    renderBank();",
"  }",
"  function goToBankQuestion(qid, topicId){",
"    goToBankTopic(topicId);",
"    const el = document.querySelector('#bankList .q-item[data-qid=\"' + qid + '\"]');",
"    if(el){ el.classList.add('hl-item'); el.scrollIntoView({behavior:'smooth', block:'center'}); }",
"  }"
].join('\n');
app = app.replace(a2, a2 + '\n' + newFuncs);

/* 3) selectTopic 中绑定真题链接点击事件 */
const a3 = "    $$('#studyContent .show-sol').forEach(b => b.addEventListener('click', () => b.nextElementSibling.classList.toggle('open')));";
const b3 = a3 + "\n" + [
"    $$('#studyContent .rel-item').forEach(b => b.addEventListener('click', () => goToBankQuestion(+b.dataset.qid, id)));",
"    $$('#studyContent .rel-all').forEach(b => b.addEventListener('click', () => goToBankTopic(b.dataset.topic)));"
].join('\n');
if (app.indexOf(a3) < 0) throw new Error('锚点3未找到');
app = app.split(a3).join(b3);
fs.writeFileSync(path.join(ROOT, 'js', 'app.js'), app, 'utf8');
console.log('app.js 真题链接已接通');

const css = fs.readFileSync(path.join(ROOT, 'css', 'style.css'), 'utf8');
if (css.indexOf('.relatedbox') >= 0) throw new Error('CSS 已存在');
const addCss = '\n/* ---- 真题链接直达题库 ---- */\n' +
'.relatedbox{background:#f0f9ff;border:1px dashed #7dd3fc;border-radius:10px;padding:10px 12px;margin-top:8px}\n' +
'.rel-head{font-size:13px;color:#0369a1;margin-bottom:6px}\n' +
'.rel-list{display:flex;flex-wrap:wrap;gap:6px}\n' +
'.rel-item{background:#fff;border:1px solid #bae6fd;border-radius:8px;padding:4px 10px;font-size:13px;cursor:pointer;color:#0c4a6e;text-align:left;max-width:320px}\n' +
'.rel-item:hover{background:#e0f2fe}\n' +
'.rel-all{margin-top:8px}\n' +
'.hl-item{outline:3px solid #f59e0b;background:#fffbeb}\n';
fs.writeFileSync(path.join(ROOT, 'css', 'style.css'), css + addCss, 'utf8');
console.log('style.css 已升级');