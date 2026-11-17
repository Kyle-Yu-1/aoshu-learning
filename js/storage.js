/* ===== 数据层：localStorage 持久化 ===== */
(function(){
  const KEY = 'aoshu_state_v1';
  const DEFAULTS = {
    records: [],        // {qid, ts(日期YYYY-MM-DD), ok(bool), ms, mode}
    review: {},         // qid -> {n, ef, due(YYYY-MM-DD), last}
    wrong: {},          // qid -> {cnt, last, okStreak}
    topic: {},          // topicId -> {read:[sectionIndex...], weak:bool, progress:0-1}
    settings: { daily: 10, explore: 5 },
    plan: null,         // {targetDate, items:[{topicId, perDay}], created}
    arch: []            // 阿基米德问答记录 {q, a, ts}
  };
  let state = load();
  function load(){
    try{
      const s = JSON.parse(localStorage.getItem(KEY) || 'null');
      return Object.assign(JSON.parse(JSON.stringify(DEFAULTS)), s || {});
    }catch(e){ return JSON.parse(JSON.stringify(DEFAULTS)); }
  }
  function save(){ localStorage.setItem(KEY, JSON.stringify(state)); }
  function today(){ return new Date().toISOString().slice(0,10); }
  function addDays(dateStr, n){
    const d = new Date(dateStr + 'T00:00:00');
    d.setDate(d.getDate() + n);
    return d.toISOString().slice(0,10);
  }
  function dayDiff(a, b){ // a - b（天）
    const da = new Date(a + 'T00:00:00'), db = new Date(b + 'T00:00:00');
    return Math.round((da - db) / 86400000);
  }
  /* ---- 做题记录 ---- */
  function addRecord(qid, ok, ms, mode){
    state.records.push({ qid, ts: today(), ok: !!ok, ms: ms||0, mode: mode||'self' });
    save();
  }
  function updateReview(qid, ok){
    const r = state.review[qid] || { n:0, ef:2.5, due: today(), last: today() };
    if(ok){
      r.ef = Math.max(1.3, r.ef + (0.1 - (r.n+1)*0.01));
      const gaps = [1,3,7,16,35];
      const gap = r.n < gaps.length ? gaps[r.n] : Math.round(r.n >= 5 ? 35 * Math.pow(2.1, r.n-4) : 35);
      r.n += 1;
      r.due = addDays(today(), gap);
    } else {
      r.n = 0;
      r.ef = Math.max(1.3, r.ef - 0.2);
      r.due = addDays(today(), 1);
    }
    r.last = today();
    state.review[qid] = r;
    // 错题本
    const w = state.wrong[qid] || { cnt:0, last:today(), okStreak:0 };
    if(ok){ w.okStreak += 1; } else { w.cnt += 1; w.okStreak = 0; w.last = today(); }
    if(ok && w.okStreak >= 2){ delete state.wrong[qid]; } else { state.wrong[qid] = w; }
    save();
  }
  /* ---- 学习进度 ---- */
  function markSection(topicId, secIndex, read){
    const t = state.topic[topicId] || (state.topic[topicId] = { read:[], weak:false });
    const set = new Set(t.read || []);
    if(read) set.add(secIndex); else set.delete(secIndex);
    t.read = Array.from(set);
    const topic = findTopic(topicId);
    const total = topic ? topic.sections.length : 1;
    t.progress = total ? t.read.length / total : 0;
    save();
  }
  function toggleWeak(topicId){
    const t = state.topic[topicId] || (state.topic[topicId] = { read:[], weak:false });
    t.weak = !t.weak;
    save();
    return t.weak;
  }
  function isWeak(topicId){ return !!(state.topic[topicId] && state.topic[topicId].weak); }
  /* ---- 工具 ---- */
  function findModule(modId){ return KNOWLEDGE.find(m => m.id === modId); }
  function findTopic(topicId){
    for(const m of KNOWLEDGE) for(const t of m.topics) if(t.id === topicId) return t;
    return null;
  }
  function findQuestion(qid){ return QUESTIONS.find(q => q.id === qid); }
  function recordsOf(qid){ return state.records.filter(r => r.qid === qid); }
  function stats(){
    const recs = state.records;
    const done = recs.length;
    const ok = recs.filter(r => r.ok).length;
    const now = today();
    const days = new Set(recs.map(r => r.ts));
    let streak = 0;
    for(let i=0;i<365;i++){
      const d = addDays(now, -i);
      if(days.has(d)) streak++; else if(i>0) break;
    }
    const dueCount = Object.values(state.review).filter(r => r.due <= now).length;
    return { total: QUESTIONS.length, done, ok, rate: done ? Math.round(ok/done*100) : 0,
             streak, due: dueCount, wrong: Object.keys(state.wrong).length };
  }
  function dailySeries(days){
    const out = [];
    for(let i=days-1;i>=0;i--){
      const d = addDays(today(), -i);
      const rs = state.records.filter(r => r.ts === d);
      const ok = rs.filter(r => r.ok).length;
      out.push({ date: d.slice(5), cnt: rs.length, ok, rate: rs.length ? Math.round(ok/rs.length*100) : null });
    }
    return out;
  }
  function moduleStats(){
    const rows = KNOWLEDGE.map(m => {
      const qids = QUESTIONS.filter(q => q.mod === m.id).map(q => q.id);
      const recs = state.records.filter(r => qids.includes(r.qid));
      const ok = recs.filter(r => r.ok).length;
      const progress = m.topics.map(t => (state.topic[t.id] ? state.topic[t.id].progress || 0 : 0));
      const learn = progress.length ? Math.round(progress.reduce((a,b)=>a+b,0)/progress.length*100) : 0;
      return { id:m.id, name:m.name, color:m.color, total:qids.length, done:recs.length,
               ok, rate: recs.length ? Math.round(ok/recs.length*100) : 0, learn };
    });
    return rows;
  }
  function topicStats(){
    const rows = [];
    for(const m of KNOWLEDGE) for(const t of m.topics){
      const qids = QUESTIONS.filter(q => q.topic === t.id).map(q => q.id);
      const recs = state.records.filter(r => qids.includes(r.qid));
      const ok = recs.filter(r => r.ok).length;
      const st = state.topic[t.id] || { read:[], weak:false };
      rows.push({ id:t.id, name:t.name, mod:m.id, modName:m.name, total:qids.length,
                  done:recs.length, ok, err: recs.length - ok,
                  rate: recs.length ? Math.round(ok/recs.length*100) : null,
                  progress: Math.round((st.progress||0)*100), weak: !!st.weak });
    }
    return rows;
  }
  function reset(){
    state = JSON.parse(JSON.stringify(DEFAULTS));
    save();
  }
  function exportJSON(){ return JSON.stringify(state, null, 2); }
  function importJSON(text){
    try{
      const s = JSON.parse(text);
      if(!s || !Array.isArray(s.records)) throw new Error('格式不正确');
      state = Object.assign(JSON.parse(JSON.stringify(DEFAULTS)), s);
      save(); return true;
    }catch(e){ return false; }
  }
  window.Store = { get state(){ return state; }, save, today, addDays, dayDiff,
    addRecord, updateReview, markSection, toggleWeak, isWeak,
    findModule, findTopic, findQuestion, stats, dailySeries, moduleStats, topicStats,
    reset, exportJSON, importJSON };
})();