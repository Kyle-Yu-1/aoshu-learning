/* ===== 图表模块（ECharts） ===== */
(function(){
  const charts = {};
  function ensure(id){
    const el = document.getElementById(id);
    if(!el) return null;
    if(!window.echarts){ el.innerHTML = '<p class="muted" style="padding:20px">图表库加载失败（需联网加载 ECharts CDN）。数据仍可正常学习与刷题。</p>'; return null; }
    if(!charts[id]) charts[id] = echarts.init(el);
    return charts[id];
  }
  function renderDaily(){
    const c = ensure('chartDaily'); if(!c) return;
    const series = Store.dailySeries(30);
    c.setOption({
      tooltip:{trigger:'axis'},
      legend:{data:['刷题量','正确率(%)'],top:0},
      grid:{left:40,right:40,top:40,bottom:28},
      xAxis:{type:'category',data:series.map(s=>s.date),axisLabel:{interval:4,fontSize:10}},
      yAxis:[{type:'value',name:'题数',minInterval:1},
             {type:'value',name:'%',max:100}],
      series:[
        {name:'刷题量',type:'line',smooth:true,data:series.map(s=>s.cnt),areaStyle:{opacity:.15},itemStyle:{color:'#6366f1'}},
        {name:'正确率(%)',type:'line',smooth:true,yAxisIndex:1,data:series.map(s=>s.rate),itemStyle:{color:'#10b981'}}
      ]
    });
  }
  function renderRadar(){
    const c = ensure('chartRadar'); if(!c) return;
    const rows = Store.moduleStats();
    const value = rows.map(r => {
      // 能力值 0-100：正确率60% + 进度30% + 刷题量10%
      const vol = Math.min(1, r.done / 20);
      return Math.round((r.rate||0)*0.6 + r.learn*0.3 + vol*100*0.1);
    });
    c.setOption({
      tooltip:{},
      radar:{indicator:rows.map(r=>({name:r.name,max:100})),radius:'62%'},
      series:[{type:'radar',data:[{value,name:'能力值',areaStyle:{opacity:.25},itemStyle:{color:'#4f46e5'},lineStyle:{color:'#4f46e5'}}]}]
    });
  }
  function renderProgress(){
    const c = ensure('chartProgress'); if(!c) return;
    const rows = Store.moduleStats();
    c.setOption({
      tooltip:{trigger:'axis'},
      legend:{data:['学习进度(%)','已做题数'],top:0},
      grid:{left:40,right:40,top:40,bottom:28},
      xAxis:{type:'category',data:rows.map(r=>r.name)},
      yAxis:[{type:'value',name:'%',max:100},{type:'value',name:'题数',minInterval:1}],
      series:[
        {name:'学习进度(%)',type:'bar',data:rows.map(r=>r.learn),barWidth:18,itemStyle:{color:'#8b5cf6'}},
        {name:'已做题数',type:'bar',yAxisIndex:1,data:rows.map(r=>r.done),barWidth:18,itemStyle:{color:'#f59e0b'}}
      ]
    });
  }
  function renderError(){
    const c = ensure('chartError'); if(!c) return;
    const rows = Store.moduleStats().filter(r => r.done > 0);
    c.setOption({
      tooltip:{trigger:'axis',formatter:(p)=> p[0].name + '<br>错误率：' + p[0].value + '%'},
      grid:{left:44,right:20,top:20,bottom:28},
      xAxis:{type:'category',data:rows.map(r=>r.name)},
      yAxis:{type:'value',name:'错误率(%)',max:100},
      series:[{type:'bar',data:rows.map(r=>100-r.rate),barWidth:22,
        itemStyle:{color:(p)=> 100-p.value <= 30 ? '#10b981' : 100-p.value <= 60 ? '#f59e0b' : '#ef4444'},
        label:{show:true,position:'top',formatter:'{c}%'}}]
    });
  }
  function renderAll(){ renderDaily(); renderRadar(); renderProgress(); renderError(); }
  function resizeAll(){ Object.values(charts).forEach(c => c && c.resize()); }
  window.addEventListener('resize', resizeAll);
  window.Charts = { renderAll, resizeAll };
})();