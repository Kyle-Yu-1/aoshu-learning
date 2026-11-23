/* 题库扩充：630-666，来源标注学而思秘籍9级（五上）与10级（五下）逐讲 */
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const QFILE = path.join(ROOT, 'js', 'data-questions.js');

const NEW = [
{id:630,mod:'geo',topic:'geo-model',diff:4,type:'填空',q:'三角形 ABC 中，BD:DC = 1:2，AE:EC = 1:1，AD 与 BE 交于 O，三角形 ABC 面积是 1，求三角形 AOC 的面积。',ans:'1/2',explain:'燕尾：S△AOB:S△AOC = BD:DC = 1:2；S△AOB:S△BOC = AE:EC = 1:1。设 S△AOB = x，则 S△AOC = 2x、S△BOC = x，总面积 4x = 1 ⇒ S△AOC = 1/2。',hint:'燕尾两次连用，设份数。'},
{id:631,mod:'geo',topic:'geo-model',diff:3,type:'填空',q:'三角形 ABC 中，D、E 分别是 BC、AC 的中点，AD、BE 交于 O，三角形 BOD 面积是 2，求三角形 ABC 的面积。',ans:'12',explain:'BD=DC ⇒ S△BOD=S△COD=2 ⇒ S△BOC=4；燕尾：S△AOB:S△AOC = BD:DC = 1:1，S△AOB:S△COB = AE:CE = 1:1 ⇒ S△AOB=S△AOC=4，总面积 12。',hint:'燕尾+中点对称。'},
{id:632,mod:'geo',topic:'geo-model',diff:4,type:'填空',q:'三角形 ABC 中，AD 是 BC 边上的中线，E 是 AD 的中点，连接 BE 并延长交 AC 于 F，求 AF:FC。',ans:'1:2',explain:'设 S△BDE=S△CDE=x；AE=ED ⇒ S△ABE=x、S△ACE=x。沿 BE 看，AF:FC = S△ABF:S△BCF = S△ABE:S△BCE = x:2x = 1:2。',hint:'设最小块为 1 份。'},
{id:633,mod:'geo',topic:'geo-curve',diff:3,type:'填空',q:'羊被绳子拴在边长 6 米的正方形草地一角（绳子系在顶点木桩上），绳长 6 米，羊最多能吃到多少平方米的草？（π 取 3.14）',ans:'28.26',explain:'吃草区域是以木桩为圆心、半径 6 的 1/4 圆：3.14×36÷4 = 28.26。',hint:'1/4 圆。'},
{id:634,mod:'geo',topic:'geo-curve',diff:3,type:'填空',q:'一个圆的半径增加 10%，它的面积增加百分之几？',ans:'21',explain:'新面积 = π(1.1r)² = 1.21πr²，增加 21%。',hint:'面积与半径平方成正比。'},
{id:635,mod:'geo',topic:'geo-curve',diff:3,type:'填空',q:'一个钟表的分针长 5 厘米，从 3 时走到 3 时 30 分，分针针尖走过的路程是多少厘米？（π 取 3.14）',ans:'15.7',explain:'30 分钟分针转半圈，路程 = π×5 = 15.7 厘米。',hint:'半圈 = πr。'},
{id:636,mod:'geo',topic:'geo-curve',diff:4,type:'填空',q:'一个半径为 4 厘米的半圆内，画一个最大的等腰直角三角形（斜边与直径重合），半圆中剩余部分的面积是多少平方厘米？（π 取 3.14）',ans:'9.12',explain:'半圆面积 = 3.14×16÷2 = 25.12；三角形（斜边 8）面积 = 8×4÷2 = 16；剩余 9.12。',hint:'半圆减三角形。'},
{id:637,mod:'calc',topic:'calc-new',diff:3,type:'填空',q:'规定 a※b = (a+b)÷2，若 x※5 = 9，求 x。',ans:'13',explain:'(x+5)÷2 = 9 ⇒ x+5 = 18 ⇒ x = 13。',hint:'把定义翻译成方程。'},
{id:638,mod:'calc',topic:'calc-new',diff:4,type:'填空',q:'规定 a△b = a²−b²，若 x△3 = 55（x 为正整数），求 x。',ans:'8',explain:'x²−9 = 55 ⇒ x² = 64 ⇒ x = 8。',hint:'平方差反解。'},
{id:639,mod:'trip',topic:'trip-meet',diff:2,type:'填空',q:'甲乙从相距 120 千米的两地相向而行，甲每小时行 35 千米，乙每小时行 25 千米，几小时相遇？',ans:'2',explain:'120÷(35+25) = 2 小时。',hint:'相遇：路程和÷速度和。'},
{id:640,mod:'trip',topic:'trip-hard',diff:4,type:'填空',q:'小明和小红从同一地点同时同向出发，小明速度是小红的 2 倍，5 分钟后两人相距 300 米，小明每分钟走多少米？',ans:'120',explain:'速度差 = 小红速度 = 300÷5 = 60 米/分，小明 = 120 米/分。',hint:'路程差÷时间 = 速度差。'},
{id:641,mod:'calc',topic:'calc-seq',diff:3,type:'填空',q:'杨辉三角中，第 6 行（首行记作 1、1）的各数之和是多少？',ans:'32',explain:'第 6 行为 1、5、10、10、5、1，和 = 32 = 2⁵。',hint:'每行和翻倍。'},
{id:642,mod:'calc',topic:'calc-seq',diff:2,type:'选择',q:'杨辉三角中，除两边的 1 以外，每个数等于什么？',opts:['上方两数之和','下方两数之和','同行两数之和','对角线两数之和'],ans:'上方两数之和',explain:'杨辉三角规律：每个数 = 两肩之和。',hint:'两肩之和。'},
{id:643,mod:'trip',topic:'trip-special',diff:3,type:'填空',q:'3 时整，时针与分针的夹角是多少度？',ans:'90',explain:'3 时整分针指 12、时针指 3，相差 3 大格 ×30° = 90°。',hint:'每大格 30°。'},
{id:644,mod:'trip',topic:'trip-special',diff:4,type:'填空',q:'7 时多少分，时针与分针第一次成直角？',ans:'240/11',explain:'7 时角度差 210°，追到 90° 需追 120°；120÷5.5 = 240/11 分钟。',hint:'角度差÷5.5。'},
{id:645,mod:'count',topic:'cnt-adv',diff:3,type:'填空',q:'同一平面内 6 个点（任意三点不共线），能连成多少条线段？',ans:'15',explain:'每两点一条线段：C(6,2) = 6×5÷2 = 15。',hint:'两两相连。'},
{id:646,mod:'count',topic:'cnt-adv',diff:4,type:'填空',q:'凸八边形的所有对角线，最多有多少个交点（顶点处不算）？',ans:'70',explain:'每个交点由 4 个顶点唯一决定：C(8,4) = 70。',hint:'一个交点对应 4 个顶点。'},
{id:647,mod:'num',topic:'num-rem',diff:3,type:'填空',q:'一个数除以 12 余 6，除以 18 余 12，这个数最小是多少？',ans:'66',explain:'逐步满足：÷12 余 6 的数 6、18、30、42、54、66…；66÷18 = 3 余 12 ✓，最小 66。',hint:'逐步满足法。'},
{id:648,mod:'num',topic:'num-prime',diff:2,type:'填空',q:'甲每 4 天去一次图书馆，乙每 6 天去一次，两人今天同时去了，再过多少天两人又同时去？',ans:'12',explain:'4 和 6 的最小公倍数是 12。',hint:'最小公倍数。'},
{id:649,mod:'num',topic:'num-prime',diff:3,type:'填空',q:'一个三位数是完全平方数，百位数字与个位数字相同，十位数字比百位数字大 4，这个数是多少？',ans:'484',explain:'11 的倍数平方数三位只有 121 和 484；484 的十位 8 比百位 4 大 4 ✓，484 = 22²。',hint:'枚举三位平方数。'},
{id:650,mod:'num',topic:'num-prime',diff:2,type:'填空',q:'在 1~100 中，完全平方数有多少个？',ans:'10',explain:'1²~10² = 1、4、9、…、100，共 10 个。',hint:'数到 10²。'},
{id:651,mod:'num',topic:'num-rem',diff:4,type:'填空',q:'一个数除以 6 余 2，除以 7 余 3，除以 8 余 4，这个数最小是多少？',ans:'164',explain:'除数都比余数大 4（差同）：数 = [6,7,8] − 4 = 168−4 = 164。',hint:'差同减差。'},
{id:652,mod:'geo',topic:'geo-solid',diff:3,type:'填空',q:'用 1×1×1 的小正方体搭一个立体图形：从上面看是一排 3 个小正方形，从正面看三个位置的高度分别是 2、1、1。搭这个图形最少需要几个小正方体？',ans:'4',explain:'一排 3 列，高度 2、1、1，共 2+1+1 = 4 个。',hint:'三视图最少块数。'},
{id:653,mod:'geo',topic:'geo-solid',diff:4,type:'填空',q:'一根长 12 厘米的长方体木条（底面是边长 1 厘米的正方形）截成 3 段，表面积增加了多少平方厘米？',ans:'4',explain:'截 2 刀增加 4 个截面，每个 1×1 = 1，共增加 4 平方厘米。',hint:'每截一刀多两个截面。'},
{id:654,mod:'calc',topic:'calc-quick',diff:3,type:'填空',q:'计算：5/6 + 5/12 + 5/20 + 5/30 + 5/42。',ans:'25/14',explain:'= 5×[1/(2×3)+1/(3×4)+…+1/(6×7)] = 5×(1/2−1/7) = 25/14。',hint:'提 5 后裂项。'},
{id:655,mod:'num',topic:'num-pos',diff:4,type:'填空',q:'一个两位数，个位数字比十位数字大 3，且这个两位数能被 3 整除，这样的两位数共有几个？',ans:'2',explain:'枚举：14、25、36、47、58、69 中，36 与 69 是 3 的倍数，共 2 个。',hint:'先枚举再筛整除。'},
{id:656,mod:'app',topic:'app-frac',diff:3,type:'填空',q:'甲、乙、丙三人分 120 元，按 2:3:5 的比例分，丙分得多少元？',ans:'60',explain:'总份数 10，丙占 5 份：120÷10×5 = 60。',hint:'先求 1 份。'},
{id:657,mod:'app',topic:'app-frac',diff:4,type:'填空',q:'某厂男工与女工人数比是 5:3，男工比女工多 24 人，全厂共有多少人？',ans:'96',explain:'差 2 份 = 24 ⇒ 1 份 = 12，总 8 份 = 96 人。',hint:'按份数。'},
{id:658,mod:'trip',topic:'trip-special',diff:1,type:'填空',q:'分针走一圈（60 分钟），时针转了多少度？',ans:'30',explain:'时针每分钟 0.5°，60 分钟转 30°。',hint:'时针每小时一大格。'},
{id:659,mod:'calc',topic:'calc-seq',diff:3,type:'填空',q:'把 1/7 化成小数，小数点后第 100 位数字是几？',ans:'8',explain:'1/7 = 0.142857142857…，循环节 142857 长 6；100÷6 余 4，第 4 位是 8。',hint:'循环节 142857。'},
{id:660,mod:'count',topic:'cnt-pc',diff:2,type:'填空',q:'某班 50 人，会游泳的 28 人，会骑车的 25 人，两样都会的 10 人，两样都不会的有几人？',ans:'7',explain:'至少会一样：28+25−10 = 43 人；两样都不会：50−43 = 7 人。',hint:'容斥原理。'},
{id:661,mod:'comb',topic:'cmb-opt',diff:4,type:'选择',q:'三堆火柴分别有 1、2、3 根，两人轮流取，每次可从一堆中取任意多根，取到最后一根者胜。先手有必胜策略吗？',opts:['没有，后手必胜','有，先手必胜','先手后手都可能','无法判断'],ans:'没有，后手必胜',explain:'1⊕2⊕3 = 0 是“必败局”：先手无论怎么取，后手都能把局面恢复到异或和为 0（或两堆相等、一空）的对称局面，最终后手取完最后一根。',hint:'三堆不相等时，后手先“拉平”再模仿。'},
{id:662,mod:'calc',topic:'calc-quick',diff:3,type:'填空',q:'计算 999999×999999 的积中，有几个数字是 9？',ans:'6',explain:'(1000000−1)² = 1000000000000 − 2000000 + 1 = 999998000001，共 6 个 9。',hint:'平方差/凑整展开。'},
{id:663,mod:'comb',topic:'cmb-puzzle',diff:3,type:'选择',q:'判断：把 1~9 填入 T 形数阵（横线 5 格、竖线 5 格，中间一格共用），要使横、竖两条线上的数之和相等，交叉处不能填偶数。',opts:['对','错'],ans:'对',explain:'总和 45 = 横 4 数 + 竖 4 数 + 交叉数；横竖相等 ⇒ 45−交叉数 = 2×每边 4 数和为偶数 ⇒ 交叉数必为奇数。',hint:'总和减去交叉数要能被 2 整除。'},
{id:664,mod:'comb',topic:'cmb-opt',diff:4,type:'选择',q:'8×8 国际象棋棋盘（黑白相间）上，任意剪去一个黑格和一个白格，剩下的 62 格能否用 31 块 1×2 骨牌铺满？',opts:['能','不能'],ans:'能',explain:'经典结论：去掉一黑一白必可铺满——把剩余棋盘沿一条“蛇形通路”染色配对，黑白相间处骨牌逐一覆盖。',hint:'黑白格数相同且一黑一白。'},
{id:665,mod:'geo',topic:'geo-model',diff:3,type:'填空',q:'三角形 ABC 中，DE 平行于 BC，D、E 分别在 AB、AC 上，AD:AB = 1:3，三角形 ADE 面积是 2，求三角形 ABC 的面积。',ans:'18',explain:'DE∥BC ⇒ 三角形 ADE 与 ABC 相似，面积比 = 1²:3² = 1:9，S△ABC = 18。',hint:'相似面积比 = 边比的平方。'},
{id:666,mod:'trip',topic:'trip-hard',diff:3,type:'填空',q:'某人沿自动扶梯从下往上走，20 秒到达；若扶梯自动运行，他站在上面 30 秒到达。若扶梯停运，他走上去需要多少秒？',ans:'60',explain:'设扶梯长度为 1：人走+梯行效率 = 1/20，梯行效率 = 1/30，人走效率 = 1/20−1/30 = 1/60，需 60 秒。',hint:'效率相减。'}
];

function qs(v){ return JSON.stringify(v).replace(/"/g, "'"); }
function qo(q){
  const keys = ['id','mod','topic','diff','type','q','opts','ans','explain','hint'];
  const p = [];
  for (const k of keys) {
    if (q[k] === undefined) continue;
    if (Array.isArray(q[k])) p.push(k + ':[' + q[k].map(qs).join(',') + ']');
    else if (typeof q[k] === 'string') p.push(k + ':' + qs(q[k]));
    else p.push(k + ':' + q[k]);
  }
  return '{' + p.join(',') + '}';
}

let txt = fs.readFileSync(QFILE, 'utf8');
if (!/\];\s*$/.test(txt)) throw new Error('题库文件结尾异常');
txt = txt.replace(/\];\s*$/, ',\n' + NEW.map(qo).join(',\n') + '\n];');
fs.writeFileSync(QFILE, txt, 'utf8');
console.log('题目追加完成：' + NEW.length + ' 题（630-666）');

global.window = {};
eval(fs.readFileSync(QFILE, 'utf8'));
eval(fs.readFileSync(path.join(ROOT, 'js', 'data-knowledge.js'), 'utf8'));
const Q = window.QUESTIONS;
const ids = new Set(); let dup = 0;
Q.forEach(q => { if (ids.has(q.id)) { dup++; console.log('重复ID', q.id); } ids.add(q.id); });
const valid = new Set(); window.KNOWLEDGE.forEach(m => m.topics.forEach(t => valid.add(t.id)));
Q.forEach(q => { if (!valid.has(q.topic)) console.log('非法topic', q.id, q.topic); });
console.log('题库总数:', Q.length, '重复:', dup);

const BB = path.join(ROOT, 'tools', 'build-bank.js');
let bb = fs.readFileSync(BB, 'utf8');
const X910_SRC = {
 630:'学而思秘籍10级·第2讲燕尾模型',631:'学而思秘籍10级·第2讲燕尾模型',632:'学而思秘籍10级·第2讲燕尾模型',
 633:'学而思秘籍10级·第9讲圆与扇形初步',634:'学而思秘籍10级·第17讲圆与扇形进阶',635:'学而思秘籍10级·第17讲圆与扇形进阶',636:'学而思秘籍10级·第17讲圆与扇形进阶',
 637:'学而思秘籍10级·第3讲定义新运算进阶',638:'学而思秘籍10级·第3讲定义新运算进阶',
 639:'学而思秘籍10级·第4讲方程法解行程',640:'学而思秘籍10级·第4讲方程法解行程',
 641:'学而思秘籍10级·第6讲数表——杨辉三角',642:'学而思秘籍10级·第6讲数表——杨辉三角',
 643:'学而思秘籍10级·第8讲时钟问题',644:'学而思秘籍10级·第8讲时钟问题',
 645:'学而思秘籍10级·第10讲几何计数进阶',646:'学而思秘籍10级·第10讲几何计数进阶',
 647:'学而思秘籍10级·第14讲带余除法综合',648:'学而思秘籍10级·第11讲因数与倍数进阶',
 649:'学而思秘籍10级·第18讲完全平方数',650:'学而思秘籍10级·第18讲完全平方数',
 651:'学而思秘籍10级·第15讲同余',652:'学而思秘籍10级·第20讲立体图形与空间想象',653:'学而思秘籍10级·第20讲立体图形与空间想象',
 654:'学而思秘籍10级·第13讲分数四则混合运算',655:'学而思秘籍10级·第16讲不定方程',
 656:'学而思秘籍9级·第9讲比和比例',657:'学而思秘籍9级·第9讲比和比例',
 658:'学而思秘籍10级·第8讲时钟问题',659:'学而思秘籍9级·第14讲循环小数',
 660:'学而思秘籍9级·第11讲容斥问题',661:'学而思秘籍9级·第12讲必胜策略',
 662:'学而思秘籍9级·第18讲神奇的9',663:'学而思秘籍9级·第8讲数阵图综合',
 664:'学而思秘籍9级·第3讲棋盘中的数学',665:'学而思秘籍9级·第10讲比例模型',
 666:'学而思秘籍9级·第17讲电梯与发车问题'
};
const anchor = 'Object.assign(Q_SRC, XES_SRC);';
if (bb.indexOf(anchor) < 0) throw new Error('Q_SRC 锚点缺失');
const srcLines = Object.keys(X910_SRC).map(id => ' ' + id + ":'" + X910_SRC[id] + "'").join(',\n');
bb = bb.replace(anchor, anchor + '\nconst X910_SRC = {\n' + srcLines + '\n};\nObject.assign(Q_SRC, X910_SRC);\n');
fs.writeFileSync(BB, bb, 'utf8');
console.log('build-bank.js 来源映射已更新');