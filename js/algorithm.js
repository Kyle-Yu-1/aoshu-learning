/* ===== 推荐算法：SM-2 间隔重复 + 知识体系加权 =====
   每道题打一个综合分：
   - 到期复习：权重最高，逾期越久分越高（记忆曲线核心）
   - 错题加成：错得越多越优先
   - 薄弱知识点加成：标记薄弱或错误率高的知识点加权
   - 学习进度匹配：该知识点章节已读的比例越高，越适合引入（考虑知识体系前置）
   - 新题探索：没做过的题给予探索分（受设置探索度控制）
   - 难度适配：与用户当前能力接近的难度加权
   - 学习计划配额：若存在"优化计划"，按计划分配每个知识点的每日题数
   - 随机微扰：避免重复推荐
*/
(function(){
  const GAP = [1,3,7,16,35];

  function overdueScore(qid){
    const r = Store.state.review[qid];
    if(!r) return 0;
    const od = Store.dayDiff(Store.today(), r.due); // 正值=已到期
    if(od < 0) return 0;
    // 到期越久越急，封顶
    return Math.min(40, 25 + od * 8);
  }
  function wrongScore(qid){
    const w = Store.state.wrong[qid];
    if(!w) return 0;
    return Math.min(20, 6 + w.cnt * 4);
  }
  function weakScore(q){
    let s = 0;
    if(Store.isWeak(q.topic)) s += 8;
    const tq = QUESTIONS.filter(x => x.topic === q.topic).map(x => x.id);
    const recs = Store.state.records.filter(r => tq.includes(r.qid));
    if(recs.length){
      const ok = recs.filter(r => r.ok).length;
      const rate = ok / recs.length;
      if(recs.length >= 3 && rate < 0.6) s += 6;   // 高错误率知识点
      if(rate < 1) s += 3 * (1 - rate);            // 未掌握
    }
    return Math.min(15, s);
  }
  function progressScore(q){
    // 知识体系：章节读得越多的知识点越应巩固/推进
    const t = Store.state.topic[q.topic];
    const p = t && t.progress ? t.progress : 0;
    // 顺序推进：模块内按 topic 顺序，前一个 topic 进度高才推进下一个
    const topic = Store.findTopic(q.topic);
    if(!topic) return 0;
    const mod = Store.findModule(q.mod);
    const idx = mod.topics.findIndex(x => x.id === q.topic);
    if(idx > 0){
      const prev = Store.state.topic[mod.topics[idx-1].id];
      if(!prev || (prev.progress||0) < 0.3) return 0; // 前置未满足，不推荐
    }
    return Math.round(p * 10); // 0~10
  }
  function newScore(q){
    const done = Store.state.records.some(r => r.qid === q.id);
    if(done) return 0;
    const explore = (Store.state.settings.explore ?? 5) / 10; // 0~1
    return 6 + explore * 8; // 6~14
  }
  function diffScore(q){
    // 用户能力估算：近30条记录正确率 → 0~1
    const recent = Store.state.records.slice(-30);
    const ability = recent.length ? recent.filter(r=>r.ok).length / recent.length : 0.7;
    const wantDiff = 1 + Math.round(ability * 4); // 1~5
    const d = Math.abs(q.diff - wantDiff);
    return d === 0 ? 8 : d === 1 ? 5 : d === 2 ? 2 : 0;
  }
  function planScore(q, planQuota){
    if(!planQuota || !planQuota[q.topic]) return 0;
    const quota = planQuota[q.topic];
    const doneToday = Store.state.records.filter(r =>
      r.ts === Store.today() && QUESTIONS.find(x => x.id === r.qid)?.topic === q.topic).length;
    if(doneToday >= quota) return -1000; // 配额已满
    return 15; // 计划内知识点优先
  }
  function score(q, planQuota){
    let s = 0;
    const done = Store.state.records.some(r => r.qid === q.id);
    s += overdueScore(q.id);        // 0~40
    s += wrongScore(q.id);          // 0~20
    s += weakScore(q);              // 0~15
    if(done) s += progressScore(q); // 0~10
    else s += newScore(q);          // 0~14
    s += diffScore(q);              // 0~8
    s += planScore(q, planQuota);   // -1000 / 15
    s += Math.random() * 3;
    return s;
  }
  /* 当前学习计划每日配额：plan.items -> {topicId, perDay} */
  function activePlanQuota(){
    const p = Store.state.plan;
    if(!p) return null;
    const quota = {};
    for(const it of p.items){ quota[it.topicId] = it.perDay; }
    return quota;
  }
  /* 主入口：推荐 n 题 */
  function recommend(n, opts){
    opts = opts || {};
    let pool = QUESTIONS.slice();
    if(opts.mod) pool = pool.filter(q => q.mod === opts.mod);
    if(opts.topic) pool = pool.filter(q => q.topic === opts.topic);
    if(opts.diff) pool = pool.filter(q => q.diff === +opts.diff);
    if(opts.wrongOnly) pool = pool.filter(q => Store.state.wrong[q.id]);
    const quota = activePlanQuota();
    const scored = pool.map(q => ({ q, s: score(q, quota) }));
    scored.sort((a,b) => b.s - a.s);
    return scored.slice(0, n).map(x => x.q);
  }
  /* 生成今日推荐说明 */
  function explain(n){
    const parts = [];
    const due = Object.values(Store.state.review).filter(r => r.due <= Store.today()).length;
    const wrong = Object.keys(Store.state.wrong).length;
    const weakTopics = KNOWLEDGE.flatMap(m => m.topics).filter(t => Store.isWeak(t.id)).length;
    if(due) parts.push(due + ' 题到期复习');
    if(wrong) parts.push(wrong + ' 题在错题本');
    if(weakTopics) parts.push(weakTopics + ' 个薄弱知识点');
    const plan = Store.state.plan;
    if(plan){
      const names = plan.items.map(i => Store.findTopic(i.topicId)?.name).filter(Boolean);
      if(names.length) parts.push('执行优化计划（' + names.join('、') + '）');
    }
    return parts.length ? ('算法依据：' + parts.join('；')) : '算法依据：暂无历史记录，将以探索新题为主。';
  }
  /* 学习计划生成（阿基米德杠杆点法） */
  function makePlan(days){
    const rows = Store.topicStats().filter(r => r.total > 0 && r.done >= 1);
    // 杠杆值 = 错误数 × (1+薄弱加成) × 题目占比
    const totalErr = rows.reduce((a,b)=>a+b.err,0) || 1;
    rows.forEach(r => {
      r.lever = (r.err / totalErr) * 100 + (r.weak ? 10 : 0);
    });
    rows.sort((a,b) => b.lever - a.lever);
    const top = rows.filter(r => r.err >= 2).slice(0, 3);
    const perDay = Store.state.settings.daily || 10;
    // 按杠杆值分配每日题数：70% 给前2，30% 给第3
    const items = top.map((r,i) => {
      const share = i === 0 ? 0.45 : i === 1 ? 0.35 : 0.20;
      return { topicId: r.id, name: r.name, perDay: Math.max(1, Math.round(perDay * share)) };
    });
    Store.state.plan = { created: Store.today(), items };
    Store.save();
    return items;
  }
  window.Algo = { recommend, explain, makePlan, activePlanQuota };
})();