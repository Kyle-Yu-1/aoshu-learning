/* ===== 主应用 ===== */
(function(){
  const $ = s => document.querySelector(s);
  const $$ = s => Array.from(document.querySelectorAll(s));
  function esc(s){ return String(s??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
  function stars(n){ return '★'.repeat(n) + '☆'.repeat(5-n); }
  function toast(msg){
    let t = $('#toast');
    if(!t){ t = document.createElement('div'); t.className='toast'; t.id='toast'; document.body.appendChild(t); }
    t.textContent = msg; t.classList.add('show');
    clearTimeout(t._h); t._h = setTimeout(()=>t.classList.remove('show'), 2200);
  }

  /* ========== 导航 ========== */
  function switchPage(name){
    $$('.nav-item').forEach(a => a.classList.toggle('active', a.dataset.page === name));
    $$('.page').forEach(p => p.classList.remove('active'));
    $('#page-' + name).classList.add('active');
    if(name === 'overview') renderOverview();
    if(name === 'study') renderStudy();
    if(name === 'practice') renderPractice();
    if(name === 'bank') renderBank();
    if(name === 'wrong') renderWrong();
    if(name === 'paper') renderPaper();
    if(name === 'analytics') renderAnalytics();
    if(name === 'settings') renderSettings();
    refreshBadges();
  }
  $$('.nav-item').forEach(a => a.addEventListener('click', () => switchPage(a.dataset.page)));

  function refreshBadges(){
    const st = Store.stats();
    $('#wrongBadge').textContent = st.wrong;
    const paperBadge = $('#paperBadge');
    if(paperBadge) paperBadge.textContent = (Store.state.paper||[]).length;
    $('#dueCount').textContent = st.due;
  }

  /* ========== 概览 ========== */
  function renderOverview(){
    const st = Store.stats();
    $('#statCards').innerHTML = `
      <div class="stat-card"><div class="v">${st.total}</div><div class="k">题库总题数</div></div>
      <div class="stat-card"><div class="v">${st.done}</div><div class="k">已做题数</div></div>
      <div class="stat-card"><div class="v ${st.rate>=80?'ok':st.rate>=60?'warn':'bad'}">${st.done?st.rate+'%':'—'}</div><div class="k">总正确率</div></div>
      <div class="stat-card"><div class="v">${st.streak}</div><div class="k">连续学习天数</div></div>
      <div class="stat-card"><div class="v ${st.due?'warn':''}">${st.due}</div><div class="k">今日待复习</div></div>
      <div class="stat-card"><div class="v ${st.wrong?'bad':''}">${st.wrong}</div><div class="k">错题数</div></div>`;
    // 知识树
    $('#overviewTree').innerHTML = KNOWLEDGE.map(m => {
      const ms = Store.moduleStats().find(x => x.id === m.id);
      return `<div class="mod" data-mod="${m.id}">
        <div class="mod-head"><span class="dot" style="background:${m.color}"></span>${m.icon} ${m.name}
          <span class="badge">${ms.done}/${ms.total} 题 · 进度 ${ms.learn}% · 正确率 ${ms.done?ms.rate+'%':'—'}</span></div>
        <div class="mod-body">
          <p class="muted small" style="margin:8px 0 4px">${esc(m.desc)}</p>
          ${m.topics.map(t => {
            const ts = Store.topicStats().find(x => x.id === t.id);
            const weak = Store.isWeak(t.id);
            return `<span class="topic ${weak?'weak':''}" data-topic="${t.id}">${esc(t.name)}
              ${ts.done?' · 已做'+ts.done:''}${ts.rate!=null?' · 对'+ts.rate+'%':''}${weak?' ⚡':''}</span>`;
          }).join('')}
        </div></div>`;
    }).join('');
    $$('#overviewTree .mod-head').forEach(h => h.addEventListener('click', () => h.parentElement.classList.toggle('open')));
    $$('#overviewTree .topic').forEach(t => t.addEventListener('click', () => { switchPage('study'); setTimeout(()=>selectTopic(t.dataset.topic), 50); }));
    // 今日推荐
    const n = Store.state.settings.daily || 10;
    $('#todaySuggest').innerHTML = `
      <p style="margin-bottom:10px">📅 今天计划刷 <b>${n}</b> 题。${esc(Algo.explain(n))}</p>
      <button class="btn primary" id="goPractice">开始今日练习 →</button>`;
    $('#goPractice').onclick = () => { switchPage('practice'); setTimeout(startAlgo, 50); };
  }

  /* ========== 学习 ========== */
  let curTopicId = null;
  function renderStudy(){
    $('#studyTree').innerHTML = KNOWLEDGE.map(m => `
      <div class="mod-t" data-mod="${m.id}"><span>${m.icon}</span>${esc(m.name)}<span class="muted" style="margin-left:auto;font-size:11px">${m.topics.length}讲</span></div>
      <div class="topics">
        ${m.topics.map(t => {
          const st = Store.topicStats().find(x => x.id === t.id);
          const weak = Store.isWeak(t.id);
          const doneClass = st && st.progress >= 100 ? 'done' : '';
          return `<div class="topic-t ${weak?'weak':''} ${doneClass}" data-topic="${t.id}">${esc(t.name)}</div>`;
        }).join('')}
      </div>`).join('');
    $$('#studyTree .mod-t').forEach(h => h.addEventListener('click', () => h.classList.toggle('open')));
    $$('#studyTree .topic-t').forEach(t => t.addEventListener('click', () => selectTopic(t.dataset.topic)));
    if(!curTopicId){ const first = KNOWLEDGE[0].topics[0]; curTopicId = first.id; }
    selectTopic(curTopicId);
  }
  function selectTopic(id){
    curTopicId = id;
    $$('#studyTree .topic-t').forEach(t => t.classList.toggle('active', t.dataset.topic === id));
    $$('#studyTree .mod-t').forEach(m => {
      const has = m.nextElementSibling && m.nextElementSibling.querySelector(`[data-topic="${id}"]`);
      if(has) m.classList.add('open');
    });
    const topic = Store.findTopic(id);
    const mod = Store.findModule(topic ? topic.modId : '');
    const st = Store.state.topic[id] || { read:[], weak:false };
    const weak = Store.isWeak(id);
    $('#studyContent').innerHTML = `
      <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:10px">
        <h2 style="font-size:18px">${mod?mod.icon:''} ${esc(topic.name)}</h2>
        <span class="muted small">${esc(mod?mod.name:'')}模块</span>
        <button class="btn sm ${weak?'danger':''}" id="btnWeak">${weak?'⚡ 已标记薄弱（点击取消）':'标记薄弱章节'}</button>
      </div>
      ${topic.sections.map((s, i) => `
        <div class="section-item ${(st.read||[]).includes(i)?'open':''}" data-sec="${i}">
          <div class="sec-head"><span class="arrow">▶</span>${esc(s.title)}</div>
          <div class="sec-body">${s.type==='ex' ? renderExample(s, id, i) : s.html}</div>
        </div>`).join('')}
      <div class="keybox"><b>💡 本章要点</b><br>${topic.key.map(k=>'• '+esc(k)).join('<br>')}</div>
      <div class="warnbox"><b>⚠️ 易错点</b><br>${topic.trap.map(k=>'• '+esc(k)).join('<br>')}</div>
      <div class="formula" style="margin-top:10px"><b>🧠 核心思维：</b>${esc(topic.think)}</div>
      <p class="muted small" style="margin-top:10px">阅读进度：展开章节即视为已读；读完标记后，刷题算法会优先巩固该知识点。</p>`;
    $$('#studyContent .sec-head').forEach(h => h.addEventListener('click', () => {
      const box = h.parentElement, idx = +box.dataset.sec;
      const open = box.classList.toggle('open');
      Store.markSection(id, idx, open);
    }));
    $('#btnWeak').onclick = () => { const w = Store.toggleWeak(id); toast(w ? '已标记薄弱，智能刷题将强化该章节' : '已取消薄弱标记'); selectTopic(id); refreshBadges(); };
    $$('#studyContent .show-sol').forEach(b => b.addEventListener('click', () => b.nextElementSibling.classList.toggle('open')));
  }
  function renderExample(s, topicId, secIdx){
    return `<div class="exbox"><b>📝 ${esc(s.q)}</b>
      <div><button class="btn sm show-sol">显示答案与解析</button></div>
      <div class="sol"><b>答案：</b>${esc(s.a)}<br><b>解析：</b>${esc(s.sol)}</div></div>`;
  }

  /* ========== 题库 ========== */
  function fillSelects(){
    const modSel = $('#selModule'), tSel = $('#selTopic'), bm = $('#bankModule'), bt = $('#bankTopic');
    const opts = '<option value="">全部模块</option>' + KNOWLEDGE.map(m=>`<option value="${m.id}">${esc(m.name)}</option>`).join('');
    modSel.innerHTML = opts; bm.innerHTML = opts;
    updateTopicSelect('');
    modSel.onchange = () => updateTopicSelect(modSel.value);
    bm.onchange = () => updateTopicSelect(bm.value, true);
  }
  function updateTopicSelect(modId, forBank){
    const tSel = forBank ? $('#bankTopic') : $('#selTopic');
    const list = modId ? Store.findModule(modId).topics : KNOWLEDGE.flatMap(m=>m.topics);
    tSel.innerHTML = '<option value="">全部知识点</option>' + list.map(t=>`<option value="${t.id}">${esc(t.name)}</option>`).join('');
  }
  function bankFiltered(){
    const kw = $('#bankSearch').value.trim();
    const mod = $('#bankModule').value, topic = $('#bankTopic').value,
          diff = +$('#bankDiff').value, status = $('#bankStatus').value;
    return QUESTIONS.filter(q => {
      if(mod && q.mod !== mod) return false;
      if(topic && q.topic !== topic) return false;
      if(diff && q.diff !== diff) return false;
      if(kw && !q.q.includes(kw)) return false;
      const done = Store.state.records.some(r => r.qid === q.id);
      if(status === 'done' && !done) return false;
      if(status === 'undone' && done) return false;
      if(status === 'wrong' && !Store.state.wrong[q.id]) return false;
      return true;
    });
  }
  function renderBank(){
    const list = bankFiltered();
    $('#bankCount').textContent = '共 ' + QUESTIONS.length + ' 题';
    $('#bankList').innerHTML = list.length ? list.map(q => {
      const mod = Store.findModule(q.mod), topic = Store.findTopic(q.topic);
      const wrong = Store.state.wrong[q.id];
      const done = Store.state.records.some(r => r.qid === q.id);
      return `<div class="q-item" data-qid="${q.id}">
        <div class="q-head">
          <span class="tag">${esc(mod.name)}</span><span class="tag">${esc(topic.name)}</span>
          <span class="tag diff">难度 ${stars(q.diff)}</span>
          ${done?'<span class="tag">已做</span>':''}${wrong?'<span class="tag wrong">错题×'+wrong.cnt+'</span>':''}
          <span class="tag src">📖 ${esc(srcOf(q))}</span>
          <span class="muted" style="margin-left:auto;font-size:12px">#${q.id}</span>
        </div>
        <div class="q-text">${esc(q.q)}</div>
        ${q.opts ? `<div class="q-options">${q.opts.map((o,i)=>`<label><input type="radio" name="bq${q.id}" disabled>${esc(String.fromCharCode(65+i))}. ${esc(o)}</label>`).join('')}</div>` : ''}
        <div style="display:flex;gap:8px">
          <button class="btn sm toggle-ans">查看答案与解析</button>
          <button class="btn sm add-practice">加入今日练习</button>
          <button class="btn sm add-paper">加入试卷</button>
        </div>
        <div class="q-ans"><b>答案：</b>${esc(q.ans.replace(/\|/g,' / '))}<div class="explain"><b>解析：</b>${esc(q.explain)}</div>${q.hint?`<div class="muted"><b>提示：</b>${esc(q.hint)}</div>`:''}</div>
      </div>`;
    }).join('') : '<p class="muted">没有符合条件的题目。</p>';
    $$('#bankList .toggle-ans').forEach(b => b.addEventListener('click', () => b.closest('.q-item').querySelector('.q-ans').classList.toggle('open')));
    $$('#bankList .add-practice').forEach(b => b.addEventListener('click', () => { addToToday(+b.closest('.q-item').dataset.qid); }));
    $$('#bankList .add-paper').forEach(b => b.addEventListener('click', () => { addToPaper(+b.closest('.q-item').dataset.qid); }));
  }
  function addToToday(qid){
    if(!window._todayExtra) window._todayExtra = [];
    if(!window._todayExtra.includes(qid)) window._todayExtra.push(qid);
    toast('已加入今日练习（' + (window._todayExtra.length) + ' 题）');
  }
  ['bankSearch','bankModule','bankTopic','bankDiff','bankStatus'].forEach(id => {
    const el = document.getElementById(id);
    if(el) el.addEventListener('input', renderBank);
    if(el && el.tagName === 'SELECT') el.addEventListener('change', renderBank);
  });
  /* ========== 刷题 ========== */
  let session = null; // {list, idx, mode}
  function renderPractice(){
    $('#selCount').value = Store.state.settings.daily || 10;
    $('#algoCount').value = Store.state.settings.daily || 10;
    $('#algoExplain').innerHTML = '<div class="muted small" style="margin-top:10px">' + esc(Algo.explain(Store.state.settings.daily)) + '</div>';
    $('#btnAlgoStart').onclick = startAlgo;
    $('#btnSelfStart').onclick = startSelf;
    if(session) renderQuestion();
  }
  function startAlgo(){
    const n = Math.max(1, Math.min(50, +$('#algoCount').value || 10));
    const base = Algo.recommend(n);
    const extra = (window._todayExtra || []).map(id => Store.findQuestion(id)).filter(Boolean).filter(q => !base.some(b => b.id === q.id));
    session = { list: base.concat(extra).slice(0, n + extra.length), idx: 0, mode: 'algo', answers: [] };
    window._todayExtra = [];
    $('#practiceArea').style.display = 'block';
    renderQuestion();
    toast('已生成 ' + session.list.length + ' 道推荐题');
  }
  function startSelf(){
    const mod = $('#selModule').value, topic = $('#selTopic').value, diff = +$('#selDiff').value;
    const n = Math.max(1, Math.min(50, +$('#selCount').value || 10));
    let list = Algo.recommend(n, { mod, topic, diff, wrongOnly: $('#selWrongOnly').checked });
    if(!list.length){ toast('没有符合条件的题目'); return; }
    session = { list, idx: 0, mode: 'self', answers: [] };
    $('#practiceArea').style.display = 'block';
    renderQuestion();
  }
  function renderQuestion(){
    if(!session){ return; }
    if(session.idx >= session.list.length){
      finishSession(); return;
    }
    const q = session.list[session.idx];
    const mod = Store.findModule(q.mod), topic = Store.findTopic(q.topic);
    const html = `
      <div class="card">
        <div class="practice-top">
          <b>第 ${session.idx+1} / ${session.list.length} 题</b>
          <span class="muted small">${esc(mod.name)} · ${esc(topic.name)} · ${stars(q.diff)}${session.mode==='algo'?' · 🤖智能推荐':' · 🔍自主选题'}</span>
          <button class="btn sm" id="btnQuit">退出本次练习</button>
        </div>
        <div class="practice-progress"><i style="width:${session.idx/session.list.length*100}%"></i></div>
        <div class="q-text" style="font-size:16px;font-weight:600;margin:10px 0">${esc(q.q)}</div>
        <div id="answerZone"></div>
        <div id="feedbackZone"></div>
      </div>`;
    $('#practiceArea').innerHTML = html;
    $('#btnQuit').onclick = () => { session = null; $('#practiceArea').style.display='none'; $('#practiceArea').innerHTML=''; };
    const zone = $('#answerZone');
    if(q.opts){
      zone.innerHTML = `<div class="q-options">${q.opts.map((o,i)=>`<label data-i="${i}"><input type="radio" name="ans" value="${i}">${esc(String.fromCharCode(65+i))}. ${esc(o)}</label>`).join('')}</div>
        <button class="btn primary" id="btnSubmit">提交答案</button>`;
      $$('#answerZone label').forEach(l => l.addEventListener('click', () => { $$('#answerZone label').forEach(x=>x.classList.remove('picked')); l.classList.add('picked'); l.querySelector('input').checked = true; }));
      $('#btnSubmit').onclick = () => submitAnswer();
    } else {
      zone.innerHTML = `<input type="text" id="fillAns" placeholder="输入答案（如 5050、99/100、17）" style="max-width:340px">
        <button class="btn primary" id="btnSubmit" style="margin-left:8px">提交答案</button>`;
      $('#fillAns').addEventListener('keydown', e => { if(e.key === 'Enter') submitAnswer(); });
      $('#btnSubmit').onclick = submitAnswer;
    }
  }
  function norm(s){
    return String(s??'').replace(/\s+/g,'').replace(/，/g,',').replace(/（/g,'(').replace(/）/g,')')
      .replace(/×/g,'*').replace(/÷/g,'/').replace(/－/g,'-').toLowerCase();
  }
  function submitAnswer(){
    const q = session.list[session.idx];
    let user = '', ok = false;
    if(q.opts){
      const picked = document.querySelector('#answerZone input[name="ans"]:checked');
      if(!picked){ toast('请先选择一个答案'); return; }
      user = q.opts[+picked.value];
      ok = norm(user) === norm(q.ans);
      // 选项高亮
      $$('#answerZone label').forEach(l => {
        const i = +l.dataset.i;
        if(norm(q.opts[i]) === norm(q.ans)) l.classList.add('correct');
        if(i === +picked.value && !ok) l.classList.add('incorrect');
      });
    } else {
      const inp = $('#fillAns');
      if(!inp.value.trim()){ toast('请输入答案'); return; }
      user = inp.value;
      ok = q.ans.split('|').some(a => norm(a) === norm(user));
      if(!ok && /^[\d\.\/\*\+\-]+$/.test(norm(user)) && /^[\d\.\/\*\+\-]+$/.test(norm(q.ans.split('|')[0]))){
        // 数值宽容比较
        try{ if(Math.abs(eval(norm(user)) - eval(norm(q.ans.split('|')[0]))) < 1e-9) ok = true; }catch(e){}
      }
    }
    // 记录
    const ms = 0;
    Store.addRecord(q.id, ok, ms, session.mode);
    Store.updateReview(q.id, ok);
    renderFeedback(q, ok, user);
    refreshBadges();
  }
  function renderFeedback(q, ok, user){
    const fb = $('#feedbackZone');
    fb.innerHTML = `
      <div class="result-box ${ok?'':'wrong'}">
        <b>${ok?'✅ 回答正确！':'❌ 回答错误'}</b>
        <div class="muted small" style="margin-top:6px">📖 来源：${esc(srcOf(q))}</div>
        <div style="margin-top:6px"><b>你的答案：</b>${esc(user)}　<b>正确答案：</b>${esc(q.ans.replace(/\|/g,' / '))}</div>
        <div class="explain" style="margin-top:8px"><b>解析：</b>${esc(q.explain)}</div>
        ${q.hint?`<div class="muted small" style="margin-top:4px"><b>提示：</b>${esc(q.hint)}</div>`:''}
        <div class="feedback-btns">
          <button class="btn primary" id="btnNext">下一题 →</button>
          ${!ok?`<button class="btn" id="btnWeak2">⚡ 强化该知识点</button>`:''}
        </div>
      </div>`;
    document.querySelector('#answerZone input, #btnSubmit') && ($('#btnSubmit').disabled = true);
    $('#btnNext').onclick = () => { session.idx++; renderQuestion(); };
    const w2 = $('#btnWeak2');
    if(w2) w2.onclick = () => { Store.toggleWeak(q.topic); toast('已标记薄弱：' + Store.findTopic(q.topic).name); };
  }
  function finishSession(){
    const total = session.list.length;
    const okCnt = Store.state.records.filter(r => r.ts === Store.today() && r.mode === session.mode).length;
    $('#practiceArea').innerHTML = `
      <div class="card" style="text-align:center;padding:30px">
        <div style="font-size:40px">🎉</div>
        <h2 style="margin:10px 0">本次练习完成！</h2>
        <p>共完成 <b>${total}</b> 题。记忆曲线已更新，错题已收入错题本。</p>
        <div class="feedback-btns" style="justify-content:center">
          <button class="btn primary" id="btnAgain">再来一组</button>
          <button class="btn" id="btnSeeAna">查看学情分析</button>
        </div>
      </div>`;
    $('#btnAgain').onclick = () => (session.mode === 'algo' ? startAlgo() : startSelf());
    $('#btnSeeAna').onclick = () => switchPage('analytics');
    session = null;
  }

  /* ========== 错题本 ========== */
  function renderWrong(){
    const ids = Object.keys(Store.state.wrong).map(Number).sort((a,b) => Store.state.wrong[b].cnt - Store.state.wrong[a].cnt);
    $('#wrongStat').textContent = '共 ' + ids.length + ' 题';
    $('#wrongList').innerHTML = ids.length ? ids.map(id => {
      const q = Store.findQuestion(id); if(!q) return '';
      const w = Store.state.wrong[id];
      const topic = Store.findTopic(q.topic);
      return `<div class="wrong-item" data-qid="${id}">
        <div class="cnt">${w.cnt}</div>
        <div class="body">
          <div class="q-head"><span class="tag">${esc(topic.name)}</span><span class="tag diff">${stars(q.diff)}</span><span class="muted small">错 ${w.cnt} 次 · 最近 ${esc(w.last)}</span></div>
          <div class="q-text">${esc(q.q)}</div>
          <div style="display:flex;gap:8px">
            <button class="btn sm redo-one">重做此题</button>
            <button class="btn sm show-one">查看解析</button>
          </div>
          <div class="q-ans"><b>答案：</b>${esc(q.ans.replace(/\|/g,' / '))}<div class="explain">${esc(q.explain)}</div></div>
        </div>
      </div>`;
    }).join('') : '<p class="muted">🎉 错题本是空的，继续保持！</p>';
    $$('#wrongList .redo-one').forEach(b => b.addEventListener('click', () => { openSingle(+b.closest('.wrong-item').dataset.qid); }));
    $$('#wrongList .show-one').forEach(b => b.addEventListener('click', () => b.closest('.wrong-item').querySelector('.q-ans').classList.toggle('open')));
    $('#btnWrongRedo').onclick = () => {
      if(!ids.length){ toast('没有错题'); return; }
      session = { list: ids.map(id => Store.findQuestion(id)).filter(Boolean), idx: 0, mode: 'wrong' };
      switchPage('practice');
      $('#practiceArea').style.display = 'block';
      renderQuestion();
    };
  }
  function openSingle(qid){
    session = { list: [Store.findQuestion(qid)], idx: 0, mode: 'wrong' };
    switchPage('practice');
    $('#practiceArea').style.display = 'block';
    renderQuestion();
  }
  /* ========== 学情分析 ========== */
  function renderAnalytics(){
    Charts.renderAll();
    const rows = Store.topicStats().filter(r => r.total > 0);
    // 强弱明细表
    $('#strengthTable').innerHTML = `
      <table class="strength">
        <tr><th>知识点</th><th>所属模块</th><th>学习进度</th><th>已做/总题</th><th>错误数</th><th>正确率</th><th>掌握度</th><th>薄弱</th></tr>
        ${rows.map(r => {
          const lvl = r.rate==null ? 0 : r.rate;
          const cls = lvl >= 80 ? 'good' : lvl >= 60 ? 'mid' : 'low';
          return `<tr><td>${esc(r.name)}</td><td>${esc(r.modName)}</td><td>${r.progress}%</td><td>${r.done}/${r.total}</td>
            <td style="color:${r.err?'#ef4444':'#9ca3af'}">${r.err}</td>
            <td>${r.rate==null?'—':r.rate+'%'}</td>
            <td><span class="pill ${r.done?cls:'mid'}">${r.done?(lvl>=80?'优秀':lvl>=60?'中等':'薄弱'):'未练'}</span></td>
            <td>${r.weak?'⚡ 已标记':'—'}</td></tr>`;
        }).join('')}
      </table>`;
    renderArchimedes(rows);
  }
  /* 阿基米德提问法：以"杠杆点"撬动整体优化 */
  function renderArchimedes(rows){
    const errRows = rows.filter(r => r.err >= 1).sort((a,b) => b.err - a.err);
    const box = $('#archimedes');
    if(!errRows.length){
      box.innerHTML = `<p class="muted">还没有错题数据。先刷一些题，我会用阿基米德提问法帮你定位"杠杆点"——用最小的力气撬动最大的提升。</p>`;
      return;
    }
    const top = errRows[0];
    const totalErr = errRows.reduce((a,b)=>a+b.err,0);
    const share = Math.round(top.err/totalErr*100);
    const weakCount = rows.filter(r=>r.weak).length;
    const plan = Store.state.plan;
    const arch = Store.state.arch || [];
    box.innerHTML = `
      <p>阿基米德说：<i>"给我一个支点，我能撬动地球。"</i> 学习同理——先找到<b>杠杆点</b>，再集中力量。</p>
      <div class="arch-question"><span class="q-num">Q1 · 杠杆在哪里？</span><br>
        你的错题共 <b>${totalErr}</b> 道。其中 <b>「${esc(top.name)}」</b> 错 <b>${top.err}</b> 道，占全部错误的 <b>${share}%</b>。
        它就是你当前的杠杆点：把力量放在这里，收益最大。<br>
        <button class="btn sm arch-a" data-a="Q1: ${esc(top.name)}">我知道了</button></div>
      <div class="arch-question"><span class="q-num">Q2 · 为什么是这个支点？</span><br>
        是因为「${esc(top.name)}」错得最多（${top.err} 道），还是因为它是其他章节的前置知识，牵一发而动全身？<br>
        <button class="btn sm arch-a" data-a="Q2: 错题最多">错题最多</button>
        <button class="btn sm arch-a" data-a="Q2: 前置知识重要">前置知识重要</button>
        <button class="btn sm arch-a" data-a="Q2: 两者都是">两者都是</button></div>
      <div class="arch-question"><span class="q-num">Q3 · 怎么撬动？</span><br>
        建议：把「${esc(top.name)}」标记为薄弱章节（刷题算法会自动强化），并生成未来 7 天优化计划——算法会按杠杆值分配每日题数。是否执行？<br>
        <button class="btn primary sm" id="btnMakePlan">📋 生成 7 天优化计划</button></div>
      ${plan ? `<div class="plan-card"><b>📋 当前优化计划</b>（创建于 ${esc(plan.created)}）<br>
        ${plan.items.map(i=>`• ${esc(i.name)}：每天 ${i.perDay} 题`).join('<br>')}
        <br><span class="muted small">智能刷题将优先按配额选题，直到取消计划。</span>
        <br><button class="btn sm danger" id="btnCancelPlan">取消计划</button></div>` : ''}
      ${arch.length ? `<p class="muted small" style="margin-top:8px">已完成的提问：${arch.slice(-3).map(a=>esc(a.a)).join('；')}</p>` : ''}`;
    $$('#archimedes .arch-a').forEach(b => b.addEventListener('click', () => {
      Store.state.arch.push({ q:'', a:b.dataset.a, ts:Store.today() }); Store.save();
      toast('已记录你的思考：' + b.dataset.a);
    }));
    const mp = $('#btnMakePlan');
    if(mp) mp.onclick = () => {
      const items = Algo.makePlan(7);
      toast('优化计划已生成');
      renderAnalytics();
      if(items.length) renderOverview();
    };
    const cp = $('#btnCancelPlan');
    if(cp) cp.onclick = () => { Store.state.plan = null; Store.save(); toast('已取消计划'); renderAnalytics(); };
  }

  /* ========== 组卷与导出 ========== */
  function addToPaper(qid){
    const list = Store.state.paper || (Store.state.paper = []);
    if(list.includes(qid)){ toast('该题已在试卷中'); return; }
    list.push(qid); Store.save();
    toast('已加入试卷（' + list.length + ' 题）'); refreshBadges();
  }
  function removeFromPaper(qid){
    Store.state.paper = (Store.state.paper||[]).filter(x => x !== qid);
    Store.save(); renderPaper(); refreshBadges();
  }
  function renderPaper(){
    const list = Store.state.paper || [];
    $('#paperStat').textContent = '共 ' + list.length + ' 题';
    $('#paperTitle').value = Store.state.paperTitle || '小升初奥数测试卷';
    $('#paperWithAns').checked = Store.state.paperWithAns !== false;
    $('#paperWithSrc').checked = Store.state.paperWithSrc !== false;
    $('#paperList').innerHTML = list.length ? list.map((qid, i) => {
      const q = Store.findQuestion(qid); if(!q) return '';
      return `<div class="paper-item">
        <div class="idx">${i+1}</div>
        <div class="body">
          <b>${esc(q.q)}</b>
          ${q.opts ? `<div class="opts">${q.opts.map((o,j)=>String.fromCharCode(65+j)+'. '+esc(o)).join('　')}</div>` : ''}
          <div class="src">📖 ${esc(srcOf(q))}</div>
          <button class="btn sm danger" data-rm="${qid}">移除</button>
        </div>
      </div>`;
    }).join('') : '<p class="muted">试卷为空：可以点题库页"加入试卷"，或用上方一键组卷。</p>';
    $$('#paperList [data-rm]').forEach(b => b.addEventListener('click', () => removeFromPaper(+b.dataset.rm)));
    // 填充组卷筛选
    $('#paperModule').innerHTML = '<option value="">全部模块</option>' + KNOWLEDGE.map(m=>`<option value="${m.id}">${esc(m.name)}</option>`).join('');
    const updPaperTopic = () => {
      const mod = $('#paperModule').value;
      const list2 = mod ? Store.findModule(mod).topics : KNOWLEDGE.flatMap(m=>m.topics);
      $('#paperTopic').innerHTML = '<option value="">全部知识点</option>' + list2.map(t=>`<option value="${t.id}">${esc(t.name)}</option>`).join('');
    };
    updPaperTopic();
    $('#paperModule').onchange = updPaperTopic;
    $('#btnGenPaper').onclick = () => {
      const mod = $('#paperModule').value, topic = $('#paperTopic').value,
            diff = +$('#paperDiff').value, n = Math.max(1, Math.min(60, +$('#paperCount').value || 10));
      let pool = QUESTIONS.filter(q => {
        if(mod && q.mod !== mod) return false;
        if(topic && q.topic !== topic) return false;
        if(diff && q.diff !== diff) return false;
        return true;
      });
      if(pool.length < n){ toast('符合条件的题目只有 ' + pool.length + ' 道'); return; }
      // 洗牌
      for(let i=pool.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [pool[i],pool[j]]=[pool[j],pool[i]]; }
      const picked = pool.slice(0, n);
      Store.state.paper = (Store.state.paper||[]).concat(picked.map(q=>q.id)).filter((v,i,a)=>a.indexOf(v)===i);
      Store.save(); renderPaper(); refreshBadges();
      toast('已抽取 ' + picked.length + ' 题加入试卷');
    };
    $('#btnClearPaper').onclick = () => {
      if(!(Store.state.paper||[]).length){ toast('试卷已为空'); return; }
      if(confirm('确定清空试卷？')){ Store.state.paper = []; Store.save(); renderPaper(); refreshBadges(); }
    };
    $('#btnExportWord').onclick = exportWord;
    $('#btnExportPdf').onclick = exportPdf;
  }
  function buildPaperHTML(){
    const list = Store.state.paper || [];
    const title = $('#paperTitle').value || Store.state.paperTitle || '小升初奥数测试卷';
    const withAns = $('#paperWithAns').checked;
    const withSrc = $('#paperWithSrc').checked;
    Store.state.paperTitle = title;
    Store.state.paperWithAns = withAns;
    Store.state.paperWithSrc = withSrc;
    Store.save();
    let html = `<html><head><meta charset="utf-8"><title>${esc(title)}</title></head><body class="print-doc">
      <h1>${esc(title)}</h1>
      <div class="sub">姓名：________　班级：________　得分：________</div>`;
    list.forEach((qid, i) => {
      const q = Store.findQuestion(qid); if(!q) return;
      html += `<div class="q"><div class="t">${i+1}. ${esc(q.q)}</div>`;
      if(q.opts) html += q.opts.map((o,j)=>`<div class="o">${String.fromCharCode(65+j)}. ${esc(o)}</div>`).join('');
      if(withSrc) html += `<div class="src">📖 来源：${esc(srcOf(q))}</div>`;
      if(withAns){
        html += `<div class="ans">【答案】${esc(q.ans.replace(/\|/g,' / '))}</div>`;
        html += `<div class="ans exp">【解析】${esc(q.explain)}</div>`;
      }
      html += `</div><hr>`;
    });
    html += `</body></html>`;
    return html;
  }
  function exportWord(){
    if(!(Store.state.paper||[]).length){ toast('试卷为空，请先选题'); return; }
    const html = buildPaperHTML();
    const blob = new Blob(['\ufeff', html], { type: 'application/msword;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = (Store.state.paperTitle || '小升初奥数测试卷') + '.doc';
    a.click();
    URL.revokeObjectURL(a.href);
    toast('Word 试卷已下载');
  }
  function exportPdf(){
    if(!(Store.state.paper||[]).length){ toast('试卷为空，请先选题'); return; }
    const html = buildPaperHTML();
    const w = window.open('', '_blank', 'width=900,height=700');
    if(!w){ toast('请允许弹出窗口以导出 PDF'); return; }
    w.document.write(html);
    w.document.close();
    setTimeout(() => { w.focus(); w.print(); }, 500);
  }

  /* ========== 设置 ========== */
  function renderSettings(){
    $('#setDaily').value = Store.state.settings.daily;
    $('#setExplore').value = Store.state.settings.explore;
    $('#setExploreVal').textContent = Store.state.settings.explore;
    $('#setExplore').oninput = () => $('#setExploreVal').textContent = $('#setExplore').value;
    $('#btnSaveSettings').onclick = () => {
      Store.state.settings.daily = Math.max(1, Math.min(100, +$('#setDaily').value || 10));
      Store.state.settings.explore = +$('#setExplore').value;
      Store.save();
      toast('设置已保存');
    };
    $('#btnExport').onclick = () => {
      const blob = new Blob([Store.exportJSON()], { type:'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'aoshu-data-' + Store.today() + '.json';
      a.click();
    };
    $('#btnImport').onclick = () => $('#fileImport').click();
    $('#fileImport').onchange = e => {
      const f = e.target.files[0]; if(!f) return;
      const reader = new FileReader();
      reader.onload = () => {
        if(Store.importJSON(reader.result)){ toast('导入成功'); location.reload(); }
        else toast('导入失败：文件格式不正确');
      };
      reader.readAsText(f);
    };
    $('#btnReset').onclick = () => {
      if(confirm('确定清空所有学习数据？此操作不可恢复。')){ Store.reset(); location.reload(); }
    };
  }

  /* ========== 初始化 ========== */
  function init(){
    fillSelects();
    refreshBadges();
    switchPage('overview');
  }
  document.addEventListener('DOMContentLoaded', init);
})();