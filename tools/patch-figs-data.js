/* 为知识例题与题库题目注入 fig 配图（行尾 } 前插入，不重建整行） */
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');

const P = {
 triIso:{t:'poly',p:[[40,150,'A'],[200,150,'B'],[120,40,'C']],s:[[120,40,120,150]],pt:[{x:120,y:150,t:'D'}]},
 butterfly:{t:'poly',p:[[80,40,'A'],[160,40,'B'],[210,150,'C'],[30,150,'D']],s:[[80,40,210,150],[160,40,30,150]],pt:[{x:120,y:95,t:'O'}],f:[{i:[[120,95],[80,40],[160,40]],c:'#fde68a'},{i:[[120,95],[210,150],[30,150]],c:'#bfdbfe'}]},
 yanwei:{t:'poly',p:[[120,30,'A'],[30,150,'B'],[210,150,'C']],s:[[120,30,90,150],[30,150,165,90]],pt:[{x:90,y:150,t:'D'},{x:165,y:90,t:'E'},{x:132,y:104,t:'O'}],f:[{i:[[120,30],[132,104],[30,150]],c:'#fde68a'},{i:[[120,30],[132,104],[210,150]],c:'#bfdbfe'}]},
 ceva:{t:'poly',p:[[120,30,'A'],[30,150,'B'],[210,150,'C']],s:[[120,30,90,150],[30,150,180,110],[210,150,48,126]],pt:[{x:90,y:150,t:'D'},{x:180,y:110,t:'E'},{x:48,y:126,t:'F'},{x:115,y:100,t:'O'}]},
 sector:{t:'poly',c:[{x:120,y:100,r:62}],s:[[120,100,120,38],[120,100,182,100]],a:[{x:120,y:100,r:62,a0:-90,a1:0}],pt:[{x:120,y:100,t:'O'}]},
 parallel:{t:'poly',p:[[120,25,'A'],[30,150,'B'],[210,150,'C']],s:[[90,66,150,66]],pt:[{x:90,y:66,t:'D'},{x:150,y:66,t:'E'}],f:[{i:[[120,25],[90,66],[150,66]],c:'#fde68a'}]},
 meet:{t:'line',x1:24,x2:216,y:90,marks:[[72,90,'#f87171','P1'],[144,90,'#3b82f6','P2']],tags:[[18,78,'A'],[214,78,'B']]}
};
function ser(f){ return JSON.stringify(f).replace(/"([a-zA-Z_]+)":/g, "$1:"); }

/* ===== 知识例题（tools/kb/modX.js，按 topic 范围 + title 定位） ===== */
const KFIG = [
['mod3.js','geo-base','例题 1 · 基础变式',P.triIso],
['mod3.js','geo-base','例题 2 · 经典母题',{t:'poly',p:[[30,50],[170,50],[170,160],[30,160]],s:[[90,50,90,160]]}],
['mod3.js','geo-base','例题 3 · 挑战变式',{t:'poly',p:[[50,40],[170,40],[170,160],[50,160]],c:[{x:110,y:100,r:60}]}],
['mod3.js','geo-base','例：减法分拆',{t:'poly',p:[[40,30],[200,30],[200,160],[40,160]],p2:[[80,70],[160,70],[160,120],[80,120]]}],
['mod3.js','geo-base','例：按比分配角度',{t:'poly',p:[[120,30,'A'],[30,150,'B'],[210,150,'C']],f:[{i:[[120,30],[30,150],[210,150]],c:'#bfdbfe'}]}],
['mod3.js','geo-model','例题 1 · 基础变式',P.butterfly],
['mod3.js','geo-model','例题 2 · 经典母题',P.yanwei],
['mod3.js','geo-model','例题 3 · 挑战变式',P.ceva],
['mod3.js','geo-model','例：斜边上的高',{t:'poly',p:[[40,150,'A'],[190,150,'B'],[40,40,'C']],s:[[40,40,40,150]],pt:[{x:40,y:150,t:'D'}]}],
['mod3.js','geo-curve','例题 1 · 基础变式',P.sector],
['mod3.js','geo-curve','例题 2 · 经典母题',{t:'poly',c:[{x:85,y:85,r:46},{x:168,y:85,r:20}],pt:[{x:168,y:85,t:'r'},{x:85,y:85,t:'R'}]}],
['mod3.js','geo-curve','例题 3 · 挑战变式',{t:'poly',p:[[30,50],[190,50],[190,155],[30,155]],c:[{x:30,y:50,r:13},{x:190,y:50,r:13},{x:190,y:155,r:13},{x:30,y:155,r:13}]}],
['mod3.js','geo-curve','例：旋转成体',{t:'poly',p:[[70,140],[70,55],[160,140]],dl:[[70,55,70,140]],e:[{x:70,y:140,rx:60,ry:14}],pt:[{x:70,y:140,t:'O'}]}],
['mod3.js','geo-solid','例题 1 · 基础变式',{t:'cube',corner:true}],
['mod3.js','geo-solid','例题 2 · 经典母题',{t:'cuboid',a:6,b:5,c:4,face:true}],
['mod3.js','geo-solid','例题 3 · 挑战变式',{t:'cube',hole:true}],
['mod3.js','geo-solid','例：柱锥体积差',{t:'cylcone',kind:'cone',tag:'圆锥 1 份'}],
['mod5.js','trip-special','例题 3 · 挑战变式',{t:'clock',hh:4,mm:0}],
['mod5.js','trip-meet','例题 3 · 挑战变式',P.meet],
['mod6.js','cnt-adv','例题 1 · 基础变式',{t:'steps',n:6,tag:'10 级台阶'}],
['mod6.js','cnt-adv','例题 2 · 经典母题',{t:'line',x1:30,x2:210,y:85,marks:[[30,85],[50,85],[70,85],[90,85],[110,85],[130,85],[150,85],[170,85],[190,85],[210,85]]}],
['mod7.js','cmb-puzzle','例题 2 · 经典母题',{t:'magic',g:[[2,7,6],[9,5,1],[4,3,8]],hl:[1,1]}],
['mod7.js','cmb-opt','例题 3 · 挑战变式',{t:'chess',cut:['tl','br']}]
];
let kDone = 0;
const kbCache = {};
for (const [file, topic, title, fig] of KFIG) {
  const fp = path.join(ROOT, 'tools', 'kb', file);
  if (!kbCache[file]) kbCache[file] = fs.readFileSync(fp, 'utf8');
  let txt = kbCache[file];
  const tStart = txt.indexOf("id:'" + topic + "'");
  if (tStart < 0) throw new Error('topic 未找到: ' + file + '/' + topic);
  const tEnd = txt.indexOf("id:'", tStart + 5);
  const seg = txt.slice(tStart, tEnd < 0 ? undefined : tEnd);
  const ti = seg.indexOf("title:'" + title + "'");
  if (ti < 0) { console.log('跳过(未找到标题): ' + file + '/' + topic + '/' + title); continue; }
  const absTi = tStart + ti;
  const lineEnd = txt.indexOf('\n', absTi);
  const insertAt = txt.lastIndexOf('}', lineEnd);
  if (txt.slice(absTi, lineEnd).indexOf('fig:') >= 0) { console.log('已存在跳过: ' + title); continue; }
  txt = txt.slice(0, insertAt) + ',fig:' + ser(fig) + txt.slice(insertAt);
  kbCache[file] = txt;
  kDone++;
}
for (const file of Object.keys(kbCache)) fs.writeFileSync(path.join(ROOT, 'tools', 'kb', file), kbCache[file], 'utf8');
console.log('知识例题配图: ' + kDone + ' 个');

/* ===== 题库题目（js/data-questions.js，按 id 定位行） ===== */
const BFIG = {
 45:P.butterfly, 46:P.parallel,
 60:{t:'poly',p:[[40,30,'A'],[200,30,'B'],[200,160,'D'],[40,160,'C']],s:[[40,30,120,30],[40,30,200,95],[120,30,200,95]],pt:[{x:120,y:30,t:'E'},{x:200,y:95,t:'F'}],f:[{i:[[40,30],[120,30],[200,95]],c:'#fde68a'}]},
 115:{t:'grid',m:4,n:4,note:'4×4 方格'},
 123:{t:'magic',hl:[1,1]}, 124:{t:'magic'},
 138:{t:'radial',n:6,center:'?'}, 229:P.parallel,
 232:{t:'poly',p:[[40,30],[200,30],[200,160],[40,160]],p2:[[40,30],[80,30],[80,70],[40,70]],f:[{i:[[40,30],[80,30],[80,70],[40,70]],c:'#fecaca'}]},
 237:{t:'poly',c:[{x:120,y:85,r:70,fill:'#bfdbfe'},{x:120,y:85,r:38,fill:'#ffffff',op:1}]},
 244:{t:'poly',s:[[120,85,190,85]],a:[{x:120,y:85,r:70,a0:0,a1:180}],pt:[{x:120,y:85,t:'O'},{x:190,y:85,t:'A'}]},
 251:{t:'cylcone',kind:'cyl'}, 254:{t:'cylcone',kind:'cone'},
 359:{t:'grid',m:3,n:3,note:'3×3 方格'}, 360:{t:'grid',m:3,n:4,note:'3×4 方格'},
 374:{t:'radial',n:6,center:'?'}, 376:{t:'magic'}, 377:{t:'magic',hl:[1,1]},
 387:{t:'chess',cut:['tl','br']}, 405:{t:'magic',hl:[1,1]},
 460:{t:'triRing',vals:[null,null,null,null,null,null]},
 496:P.meet, 497:P.butterfly,
 531:{t:'ring',pts:[[120,13,'#f87171','甲'],[120,157,'#3b82f6','乙']]},
 532:{t:'steps',n:6,tag:'10 级台阶'}, 534:{t:'grid',m:2,n:8,note:'2×8 棋盘'},
 537:{t:'magic',hl:[1,1]}, 540:{t:'chess',cut:['tl','br']},
 543:{t:'poly',c:[{x:85,y:85,r:46},{x:168,y:85,r:20}],pt:[{x:168,y:85,t:'r'},{x:85,y:85,t:'R'}]},
 544:{t:'poly',p:[[30,50],[190,50],[190,155],[30,155]],c:[{x:30,y:50,r:13},{x:190,y:50,r:13},{x:190,y:155,r:13},{x:30,y:155,r:13}]},
 545:P.yanwei, 546:P.ceva, 547:P.triIso,
 548:{t:'cube',corner:true}, 549:{t:'cuboid',a:6,b:5,c:4,face:true}, 550:{t:'cube',hole:true},
 559:{t:'poly',p:[[50,40],[170,40],[170,160],[50,160]],c:[{x:110,y:100,r:60}]},
 560:P.sector, 586:{t:'moons'}, 587:P.sector,
 589:{t:'clock',hh:12,mm:15}, 590:{t:'cylcone',kind:'cone'}, 591:{t:'cylcone',kind:'cyl'},
 614:P.meet, 619:P.parallel,
 620:{t:'poly',c:[{x:150,y:130,r:70},{x:173,y:89,r:23}],s:[[150,130,150,60],[150,130,211,95]],a:[{x:150,y:130,r:70,a0:-90,a1:-30}],pt:[{x:150,y:130,t:'O'}]},
 630:P.yanwei,
 631:{t:'poly',p:[[120,30,'A'],[30,150,'B'],[210,150,'C']],s:[[120,30,120,150],[30,150,165,90]],pt:[{x:120,y:150,t:'D'},{x:165,y:90,t:'E'},{x:123,y:108,t:'O'}],f:[{i:[[120,150],[123,108],[30,150]],c:'#fde68a'}]},
 632:{t:'poly',p:[[120,30,'A'],[30,150,'B'],[210,150,'C']],s:[[120,30,120,150],[120,150,90,110],[30,150,150,70]],pt:[{x:120,y:150,t:'D'},{x:90,y:110,t:'E'},{x:150,y:70,t:'F'}],f:[{i:[[120,30],[90,110],[150,70]],c:'#fde68a'}]},
 633:{t:'sheep',tag:'6×6 草地 · 绳长 6'},
 636:{t:'semi'}, 641:{t:'pascal'},
 643:{t:'clock',hh:3,mm:0,ang:90}, 644:{t:'clock',hh:7,mm:0},
 652:{t:'grid',m:2,n:3,hl:[[0,0],[0,1],[1,0]],note:'上面看一排 3 列，正面高度 2、1、1'},
 663:{t:'tnum'}, 664:{t:'chess',cut:['tl','br']}, 665:P.parallel
};
const qfile = path.join(ROOT, 'js', 'data-questions.js');
let qtxt = fs.readFileSync(qfile, 'utf8');
let qDone = 0, miss = 0;
for (const idStr of Object.keys(BFIG)) {
  const re = new RegExp('^\\{id:' + idStr + ',', 'm');
  const m = qtxt.match(re);
  if (!m) { console.log('题未找到: ' + idStr); miss++; continue; }
  const lineEnd = qtxt.indexOf('\n', m.index);
  const line = qtxt.slice(m.index, lineEnd);
  if (line.indexOf('fig:') >= 0) { console.log('已有图跳过: ' + idStr); continue; }
  const insertAt = qtxt.lastIndexOf('}', lineEnd);
  qtxt = qtxt.slice(0, insertAt) + ',fig:' + ser(BFIG[idStr]) + qtxt.slice(insertAt);
  qDone++;
}
fs.writeFileSync(qfile, qtxt, 'utf8');
console.log('题库配图: ' + qDone + ' 题，未找到: ' + miss);