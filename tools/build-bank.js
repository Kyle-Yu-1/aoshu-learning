/* 生成题库文件夹结构（按大纲分模块/知识点）并标注来源 + 生成网站来源映射 */
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
global.window = {};
eval(fs.readFileSync(path.join(ROOT,'js/data-knowledge.js'),'utf8'));
eval(fs.readFileSync(path.join(ROOT,'js/data-questions.js'),'utf8'));
const K = window.KNOWLEDGE, Q = window.QUESTIONS;

const TOPIC_SRC = {
 'calc-quick':'学而思秘籍1级·巧算加减法初步；5级·巧算综合；《高思学校竞赛数学导引》计算问题；《举一反三》',
 'calc-lie':'学而思秘籍11级·第1讲分数裂项；《奥数教程》六年级；《高思导引》六年级计算',
 'calc-seq':'学而思秘籍7级·等差数列进阶；10级·第6讲数表——杨辉三角；《奥数教程》数列',
 'calc-new':'学而思秘籍7级/10级·定义新运算；11级·比较与估算；竞赛真题风格',
 'num-parity':'学而思秘籍2级·奇数与偶数初步；《高思导引》3年级奇偶分析',
 'num-div':'学而思秘籍7级·整除特征初步；《奥数教程》5年级整除',
 'num-prime':'学而思秘籍9级·质数与合数进阶/因数与倍数初步；10级·因数与倍数进阶；华杯赛高频',
 'num-rem':'学而思秘籍10级·带余除法综合/同余；11级·第4讲韩信点兵；华杯赛高频',
 'num-pos':'学而思秘籍10级·位值原理/不定方程；12级·进位制进阶',
 'geo-base':'学而思秘籍8级·格点与割补；9级·比例模型；12级·复合图形分拆',
 'geo-model':'学而思秘籍9级·鸟头模型/蝴蝶模型；10级·第2讲燕尾模型；10级·勾股定理；《高思导引》5年级几何',
 'geo-curve':'学而思秘籍10级·圆与扇形初步/进阶；12级·旋转与轨迹；华杯赛高频',
 'geo-solid':'学而思秘籍10级·长方体与正方体/立体图形与空间想象；11级·切片和染色；12级·圆柱与圆锥',
 'app-base':'学而思秘籍2-3级·和差/年龄/植树；《举一反三》典型问题',
 'app-classic':'学而思秘籍3-4级·鸡兔同笼/盈亏/还原/周期；《奥数教程》三、四年级',
 'app-frac':'学而思秘籍9级·分数应用题/工程问题初步；《高思导引》6年级分数与工程；小升初名校高频',
 'app-cc':'学而思秘籍9级·牛吃草问题；11级·浓度问题；12级·经济问题；小升初名校真题高频',
 'trip-meet':'学而思秘籍7级·相遇问题/追及问题；《高思导引》行程问题',
 'trip-special':'学而思秘籍10级·时钟问题；《奥数教程》流水行船/火车过桥',
 'trip-hard':'学而思秘籍9级·电梯与发车问题；11级·多次相遇与追及；12级·变速问题；《高思导引》',
 'cnt-base':'学而思秘籍2级·枚举法；7级·加乘原理初步；《举一反三》',
 'cnt-pc':'学而思秘籍9级·排列组合初步/容斥问题；11级·排列组合进阶',
 'cnt-adv':'学而思秘籍10级·几何计数进阶；11级·归纳与递推；竞赛真题风格',
 'cmb-puzzle':'学而思秘籍5级·竖式数字谜；9级·数阵图综合；三阶幻方经典',
 'cmb-logic':'学而思秘籍2级·逻辑推理；7级·逻辑推理综合；《高思导引》',
 'cmb-opt':'学而思秘籍9级·必胜策略/棋盘中的数学；10级·数字谜中的最值；12级·算两次；华杯赛组合真题风格'
};
const Q_SRC = {
 141:'华杯赛三年级组真题风格（123+234+345+456+567 型）',
 213:'人大附中早培真题（4个互不相同自然数和为2025求最大公约数最大值）',
 221:'迎春杯三年级真题风格（长方形周长48长是宽2倍）',
 282:'江苏常州小升初考试真题（机器厂计划生产）',
 294:'经典牛吃草真题（27头牛6天/23头牛9天/21头牛）',
 304:'小升初名校行程高频真题（往返平均速度）',
 305:'小升初名校真题（两次相遇定全程）',
 353:'华杯赛/迎春杯高频（1~50被2或3整除容斥）',
 387:'经典棋盘染色覆盖题（华杯赛组合方向）',
 394:'经典统筹过桥题（奥数书籍广泛收录）',
 272:'2026年日历周期真题型（小升初高频）',
 293:'小升初经济问题真题型（分段计价）',
 317:'小升初时钟快慢钟真题型',
 338:'小升初时钟快慢钟真题型'
};
for(let id=401; id<=420; id++) Q_SRC[id] = '南京外国语学校小升初面测真题（考生回忆版）';
for(let id=421; id<=430; id++) Q_SRC[id] = '南京玄武外国语学校小升初面谈/分班考真题（考生回忆版）';
const CUP_SRC = {431:'华杯赛真题风格',432:'华杯赛真题风格',433:'华杯赛真题',434:'华杯赛真题风格',435:'迎春杯真题风格',436:'华杯赛真题风格',437:'华杯赛真题风格',438:'华杯赛真题风格',439:'迎春杯真题风格',440:'迎春杯真题风格',441:'希望杯真题风格',442:'希望杯真题风格',443:'小升初名校真题',444:'小升初名校真题',445:'小升初名校真题',446:'华杯赛真题风格',447:'迎春杯真题风格',448:'华杯赛真题风格',449:'希望杯真题风格',450:'华杯赛真题风格',451:'希望杯真题风格',452:'迎春杯真题风格',453:'小升初名校真题',454:'小升初名校真题',455:'小升初名校真题',456:'希望杯真题风格',457:'华杯赛真题风格',458:'希望杯真题风格',459:'迎春杯真题风格',460:'迎春杯真题风格'};
Object.assign(Q_SRC, CUP_SRC);
for(let id=461; id<=470; id++) Q_SRC[id] = '杭州文澜中学小升初分班考真题（考生回忆版）';
for(let id=471; id<=480; id++) Q_SRC[id] = '成都七中育才学校新初一分班考真题（考生回忆版）';
const SCHOOL_SRC = {481:'上海华育中学分班考真题',482:'上海华育中学分班考真题',483:'上海华育中学分班考真题',484:'上海华育中学分班考真题',485:'上海华育中学分班考真题',486:'上海华育中学分班考真题',487:'上海华育中学分班考真题',488:'上海华育中学分班考真题',489:'深圳百合外国语学校小升初真题',490:'深圳百合外国语学校小升初真题',491:'深圳百合外国语学校小升初真题',492:'深圳百合外国语学校小升初真题',493:'深圳百合外国语学校小升初真题',494:'深圳百合外国语学校小升初真题',495:'广州华附真题风格',496:'广州华附真题风格',497:'广州华附真题风格',498:'成都西川中学真题风格',499:'深圳中学真题风格',500:'各地名校分班考高频真题型'};
Object.assign(Q_SRC, SCHOOL_SRC);
function srcOf(q){
  const specific = Q_SRC[q.id];
  const topic = TOPIC_SRC[q.topic] || '通用奥数体系';
  return specific ? (specific + '｜' + topic) : topic;
}
/* 生成 js/data-source.js */
const srcJs = '/* 题库来源标注（自动生成，勿手改；运行 tools/build-bank.js 重新生成） */\n' +
  'window.SRC = {\n  topic: ' + JSON.stringify(TOPIC_SRC, null, 2).replace(/"/g,"'") + ',\n  q: ' + JSON.stringify(Q_SRC, null, 2).replace(/"/g,"'") + '\n};\n' +
  'function srcOf(q){ var s = window.SRC.q[q.id]; var t = window.SRC.topic[q.topic] || "";\n  return s ? s + "｜" + t : t; }\n';
fs.writeFileSync(path.join(ROOT,'js/data-source.js'), srcJs, 'utf8');
console.log('data-source.js written');
/* 生成 题库/ 文件夹 */
const BANK = path.join(ROOT,'题库');
if(fs.existsSync(BANK)) fs.rmSync(BANK,{recursive:true,force:true});
fs.mkdirSync(BANK,{recursive:true});
const stars = n => '★'.repeat(n) + '☆'.repeat(5-n);
let index = '# 题库索引（按大纲整理）\n\n> 由 tools/build-bank.js 自动生成。题目总数：' + Q.length + '。每道题均标注来源。\n\n';
let qi = 0;
K.forEach((m, mi) => {
  const mDir = path.join(BANK, String(mi+1).padStart(2,'0') + '-' + m.name);
  fs.mkdirSync(mDir, {recursive:true});
  index += '\n## ' + (mi+1).toString().padStart(2,'0') + ' ' + m.name + '（' + Q.filter(q=>q.mod===m.id).length + ' 题）\n';
  m.topics.forEach((t, ti) => {
    const qs = Q.filter(q => q.topic === t.id);
    if(!qs.length) return;
    const tDir = path.join(mDir, String(ti+1).padStart(2,'0') + '-' + t.name);
    fs.mkdirSync(tDir, {recursive:true});
    index += '- [' + t.name + '](./' + (mi+1).toString().padStart(2,'0') + '-' + m.name + '/' + (ti+1).toString().padStart(2,'0') + '-' + t.name + '/)（' + qs.length + ' 题）\n';
    let md = '# ' + t.name + '\n\n> 所属模块：' + m.name + '｜题数：' + qs.length +
      '\n>\n> 来源体系：' + TOPIC_SRC[t.id] + '\n>\n> 核心思维：' + t.think + '\n\n---\n';
    qs.forEach(q => {
      qi++;
      md += '\n## 第 ' + qi + ' 题（题库编号 #' + q.id + '，难度 ' + stars(q.diff) + '）\n\n';
      md += '**题干：** ' + q.q + '\n\n';
      if(q.opts) md += '**选项：**\n' + q.opts.map((o,i)=>'- ' + String.fromCharCode(65+i) + '. ' + o).join('\n') + '\n\n';
      md += '**来源：** ' + srcOf(q) + '\n\n';
      md += '**答案：** ' + q.ans.replace(/\|/g,' / ') + '\n\n';
      md += '**解析：** ' + q.explain + '\n\n';
      if(q.hint) md += '**提示：** ' + q.hint + '\n';
      md += '\n---\n';
    });
    fs.writeFileSync(path.join(tDir, t.name + '.md'), md, 'utf8');
  });
});
fs.writeFileSync(path.join(BANK,'README.md'), index, 'utf8');
console.log('题库目录生成完成: ' + BANK);
console.log('总题目数: ' + qi);