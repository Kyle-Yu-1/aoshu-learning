/* ===== 题目配图渲染库（纯内联 SVG，无外部依赖） ===== */
/* 用法：题目的 fig 字段描述图形，页面调用 window.FIG(fig) 得到 SVG 字符串 */
window.FIG = (function () {
  function esc(t){ return String(t).replace(/&/g,'&amp;').replace(/</g,'&lt;'); }
  function wrap(inner, w, h){ return '<svg viewBox="0 0 '+w+' '+h+'" xmlns="http://www.w3.org/2000/svg" style="max-width:300px;height:auto;background:#fbfdff;border:1px solid #dbe4ef;border-radius:10px;display:block;margin:8px 0">'+inner+'</svg>'; }
  function pth(d, o){ return '<path d="'+d+'" fill="none" stroke="#334155" stroke-width="1.6" '+(o||'')+'/>'; }
  function seg(x1,y1,x2,y2,o){ return pth('M '+x1+' '+y1+' L '+x2+' '+y2, o); }
  function dot(x,y){ return '<circle cx="'+x+'" cy="'+y+'" r="3.2" fill="#fff" stroke="#2563eb" stroke-width="1.6"/>'; }
  function lbl(x,y,t){ return '<text x="'+(x+5)+'" y="'+(y-5)+'" font-size="12" fill="#1e293b" font-family="Arial,sans-serif">'+esc(t)+'</text>'; }
  function fillPoly(pts, color, op){ return '<polygon points="'+pts.map(function(p){return p[0]+','+p[1];}).join(' ')+'" fill="'+color+'" fill-opacity="'+(op||0.35)+'"/>'; }
  function arcPath(cx,cy,r,a0,a1){
    var x0=cx+r*Math.cos(a0*Math.PI/180), y0=cy+r*Math.sin(a0*Math.PI/180);
    var x1=cx+r*Math.cos(a1*Math.PI/180), y1=cy+r*Math.sin(a1*Math.PI/180);
    var large=((a1-a0)>180)?1:0;
    return 'M '+x0.toFixed(1)+' '+y0.toFixed(1)+' A '+r+' '+r+' 0 '+large+' 1 '+x1.toFixed(1)+' '+y1.toFixed(1);
  }
  function arc(cx,cy,r,a0,a1,o){ return pth(arcPath(cx,cy,r,a0,a1), o); }
  function fanFill(f){ var d=arcPath(f.x,f.y,f.r,f.a0,f.a1)+' L '+f.x+' '+f.y+' Z'; return '<path d="'+d+'" fill="'+f.c+'" fill-opacity="'+(f.op||0.35)+'" stroke="none"/>'; }

  /* 通用多边形：p 闭合多边形(带标签) / p2 附加闭合多边形 / s 线段(坐标) / dl 虚线 / f 填充(坐标) / fa 扇形填充 / c 圆 / e 椭圆 / a 弧 / pt 独立点标签 */
  function poly(fig){
    var i, inner='';
    (fig.fa||[]).forEach(function(f){ inner+=fanFill(f); });
    (fig.f||[]).forEach(function(b){ inner+=fillPoly(b.i,b.c,b.op); });
    (fig.a||[]).forEach(function(b){ inner+=arc(b.x,b.y,b.r,b.a0,b.a1,b.dash?'stroke-dasharray="4 4"':''); });
    if((fig.p||[]).length>1) inner+=pth('M '+fig.p.map(function(pt){return pt[0]+' '+pt[1];}).join(' L ')+' Z');
    (fig.p2||[]).forEach(function(q){ if(q.length>1) inner+=pth('M '+q.map(function(pt){return pt[0]+' '+pt[1];}).join(' L ')+' Z'); });
    (fig.s||[]).forEach(function(b){ inner+=seg(b[0],b[1],b[2],b[3]); });
    (fig.dl||[]).forEach(function(b){ inner+=seg(b[0],b[1],b[2],b[3],'stroke-dasharray="4 4"'); });
    (fig.c||[]).forEach(function(b){ inner+='<circle cx="'+b.x+'" cy="'+b.y+'" r="'+b.r+'" fill="none" stroke="#334155" stroke-width="1.6"'+(b.dash?' stroke-dasharray="4 4"':'')+(b.fill?' fill="'+b.fill+'" fill-opacity="' + (b.op||0.9) + '"':'')+'/>'; });
    (fig.e||[]).forEach(function(b){ inner+='<ellipse cx="'+b.x+'" cy="'+b.y+'" rx="'+b.rx+'" ry="'+b.ry+'" fill="none" stroke="#334155" stroke-width="1.6"/>'; });
    (fig.p||[]).forEach(function(pt){ if(pt.length>2){ inner+=dot(pt[0],pt[1]); inner+=lbl(pt[0],pt[1],pt[2]); } });
    (fig.pt||[]).forEach(function(b){ inner+=dot(b.x,b.y); inner+=lbl(b.x,b.y,b.t); });
    return wrap(inner, fig.w||240, fig.h||170);
  }

  /* 方格图 m×n，可选着色格 rows/cols */
  function grid(fig){
    var m=fig.m||4, n=fig.n||4, size=Math.min(36,Math.floor(220/n),Math.floor(150/m)), x0=(240-n*size)/2, y0=(170-m*size)/2, i, j, inner='';
    for(i=0;i<=n;i++) inner+=seg(x0+i*size,y0,x0+i*size,y0+m*size);
    for(j=0;j<=m;j++) inner+=seg(x0,y0+j*size,x0+n*size,y0+j*size);
    if(fig.hl){ fig.hl.forEach(function(cell){ inner+='<rect x="'+(x0+cell[1]*size+2)+'" y="'+(y0+cell[0]*size+2)+'" width="'+(size-4)+'" height="'+(size-4)+'" fill="#fde68a" fill-opacity="0.6"/>'; }); }
    if(fig.note) inner+='<text x="'+x0+'" y="'+(y0+m*size+16)+'" font-size="11" fill="#64748b">'+esc(fig.note)+'</text>';
    return wrap(inner,240,170);
  }

  /* 三阶幻方/数字宫格 */
  function magic(fig){
    var g=fig.g||[[2,7,6],[9,5,1],[4,3,8]], size=50, x0=45, y0=20, i, j, inner='';
    for(i=0;i<=3;i++){ inner+=seg(x0+i*size,y0,x0+i*size,y0+size*3); inner+=seg(x0,y0+i*size,x0+size*3,y0+i*size); }
    for(i=0;i<3;i++) for(j=0;j<3;j++){
      var hl=(fig.hl&&fig.hl[0]===i&&fig.hl[1]===j);
      if(hl) inner+='<rect x="'+(x0+j*size+2)+'" y="'+(y0+i*size+2)+'" width="'+(size-4)+'" height="'+(size-4)+'" fill="#fde68a"/>';
      inner+='<text x="'+(x0+j*size+size/2)+'" y="'+(y0+i*size+size/2+5)+'" font-size="20" text-anchor="middle" fill="#1e293b">'+g[i][j]+'</text>';
    }
    return wrap(inner,240,170);
  }

  /* 钟表 */
  function clock(fig){
    var cx=120, cy=88, r=68, hh=fig.hh||0, mm=fig.mm||0, k, inner='';
    inner+='<circle cx="'+cx+'" cy="'+cy+'" r="'+r+'" fill="#fff" stroke="#334155" stroke-width="1.6"/>';
    for(k=0;k<12;k++){ var a=k*30*Math.PI/180; inner+=seg(cx+(r-10)*Math.sin(a), cy-(r-10)*Math.cos(a), cx+(r-4)*Math.sin(a), cy-(r-4)*Math.cos(a)); }
    var ha=(hh%12+mm/60)*30*Math.PI/180, ma=mm*6*Math.PI/180;
    inner+=seg(cx,cy,cx+(r-26)*Math.sin(ha),cy-(r-26)*Math.cos(ha),'stroke-width="2.6"');
    inner+=seg(cx,cy,cx+(r-12)*Math.sin(ma),cy-(r-12)*Math.cos(ma),'stroke-width="2"');
    if(fig.ang) inner+='<text x="'+(cx-20)+'" y="'+(cy+r+18)+'" font-size="12" fill="#2563eb">夹角 '+fig.ang+'°</text>';
    return wrap(inner,240,170);
  }

  /* 正方体线框（可高亮三面/角点） */
  function cube(fig){
    var F=[90,52,150,112], B=[58,20,118,80], inner='';
    inner+=seg(F[0],F[1],F[2],F[1]); inner+=seg(F[2],F[1],F[2],F[3]); inner+=seg(F[2],F[3],F[0],F[3]); inner+=seg(F[0],F[3],F[0],F[1]);
    inner+=seg(B[0],B[1],B[2],B[1]); inner+=seg(B[2],B[1],B[2],B[3]); inner+=seg(B[2],B[3],B[0],B[3]); inner+=seg(B[0],B[3],B[0],B[1]);
    inner+=seg(F[0],F[1],B[0],B[1]); inner+=seg(F[2],F[1],B[2],B[1]); inner+=seg(F[2],F[3],B[2],B[3]); inner+=seg(F[0],F[3],B[0],B[3]);
    if(fig.corner){ inner+='<circle cx="'+(F[2])+'" cy="'+(F[1])+'" r="5" fill="#f87171"/>'; }
    if(fig.hole){ inner+='<rect x="105" y="68" width="30" height="30" fill="#fff" stroke="#334155" stroke-width="1.6"/>'; inner+='<rect x="111" y="62" width="30" height="30" fill="none" stroke="#334155" stroke-width="1.4" stroke-dasharray="4 4"/>'; }
    return wrap(inner,240,170);
  }

  /* 长方体线框（a 长 b 高 c 深，按比例） */
  function cuboid(fig){
    var a=fig.a||5, b=fig.b||4, c=fig.c||3, k=18;
    var W=a*k, H=b*k, D=c*k*0.55, x0=(240-W-D)/2+10, y0=170-30-H;
    var F=[x0,y0,x0+W,y0+H], B=[x0+D,y0-D*0.7,x0+W+D,y0+H-D*0.7], inner='';
    inner+=seg(F[0],F[1],F[2],F[1]); inner+=seg(F[2],F[1],F[2],F[3]); inner+=seg(F[2],F[3],F[0],F[3]); inner+=seg(F[0],F[3],F[0],F[1]);
    inner+=seg(B[0],B[1],B[2],B[1]); inner+=seg(B[2],B[1],B[2],B[3]); inner+=seg(B[2],B[3],B[0],B[3]); inner+=seg(B[0],B[3],B[0],B[1]);
    inner+=seg(F[0],F[1],B[0],B[1]); inner+=seg(F[2],F[1],B[2],B[1]); inner+=seg(F[2],F[3],B[2],B[3]); inner+=seg(F[0],F[3],B[0],B[3]);
    if(fig.face){ inner+='<rect x="'+(F[0]+4)+'" y="'+(F[1]+4)+'" width="'+(W-8)+'" height="'+(H-8)+'" fill="#bfdbfe" fill-opacity="0.5"/>'; }
    return wrap(inner,240,170);
  }

  /* 圆柱 / 圆锥（含等高示意） */
  function cylcone(fig){
    var cx=90, top=38, bot=128, r=52, inner='';
    if(fig.kind==='cyl'){
      inner+='<ellipse cx="'+cx+'" cy="'+top+'" rx="'+r+'" ry="14" fill="none" stroke="#334155" stroke-width="1.6"/>';
      inner+=seg(cx-r,top,cx-r,bot); inner+=seg(cx+r,top,cx+r,bot);
      inner+='<ellipse cx="'+cx+'" cy="'+bot+'" rx="'+r+'" ry="14" fill="none" stroke="#334155" stroke-width="1.6"/>';
      if(fig.tag) inner+='<text x="'+(cx+r+8)+'" y="'+(top+40)+'" font-size="12" fill="#1e293b">'+esc(fig.tag)+'</text>';
    } else {
      inner+='<ellipse cx="'+cx+'" cy="'+bot+'" rx="'+r+'" ry="14" fill="none" stroke="#334155" stroke-width="1.6"/>';
      inner+=seg(cx-r,bot,cx,top); inner+=seg(cx+r,bot,cx,top);
      if(fig.tag) inner+='<text x="'+(cx+8)+'" y="'+(top-8)+'" font-size="12" fill="#1e293b">'+esc(fig.tag)+'</text>';
    }
    return wrap(inner,240,170);
  }

  /* 国际象棋棋盘（可标剪角） */
  function chess(fig){
    var size=17, x0=36, y0=17, i, j, inner='';
    for(i=0;i<8;i++) for(j=0;j<8;j++){
      var dark=(i+j)%2===1;
      inner+='<rect x="'+(x0+j*size)+'" y="'+(y0+i*size)+'" width="'+size+'" height="'+size+'" fill="'+(dark?'#475569':'#f1f5f9')+'"/>';
    }
    inner+='<rect x="'+(x0-0.6)+'" y="'+(y0-0.6)+'" width="'+(8*size+1.2)+'" height="'+(8*size+1.2)+'" fill="none" stroke="#334155" stroke-width="1.6"/>';
    (fig.cut||[]).forEach(function(c){ var px=c==='tl'?x0+size/2:c==='tr'?x0+7.5*size:c==='bl'?x0+size/2:x0+7.5*size; var py=c==='tl'?y0+size/2:c==='tr'?y0+size/2:c==='bl'?y0+7.5*size:y0+7.5*size; inner+=seg(px-5,py-5,px+5,py+5,'stroke="#ef4444" stroke-width="2.4"'); inner+=seg(px-5,py+5,px+5,py-5,'stroke="#ef4444" stroke-width="2.4"'); });
    return wrap(inner,240,170);
  }

  /* 台阶（斐波那契上楼梯） */
  function steps(fig){
    var n=fig.n||5, w=160/n, x0=30, y0=150, i, inner='';
    for(i=0;i<n;i++){ inner+=seg(x0+i*w,y0-i*18,x0+(i+1)*w,y0-i*18); inner+=seg(x0+(i+1)*w,y0-i*18,x0+(i+1)*w,y0-(i+1)*18); }
    if(fig.tag) inner+='<text x="'+(x0+n*w+8)+'" y="'+(y0-(n-1)*18)+'" font-size="12" fill="#1e293b">'+esc(fig.tag)+'</text>';
    return wrap(inner,240,170);
  }

  /* 杨辉三角 */
  function pascal(fig){
    var rows=fig.r||[[1],[1,1],[1,2,1],[1,3,3,1],[1,4,6,4,1],[1,5,10,10,5,1]], y0=24, dy=23, inner='';
    rows.forEach(function(r,i){
      var x0=120-(r.length-1)*17;
      r.forEach(function(v,j){ inner+='<text x="'+(x0+j*34)+'" y="'+(y0+i*dy)+'" font-size="13" text-anchor="middle" fill="#1e293b">'+v+'</text>'; });
    });
    return wrap(inner,240,170);
  }

  /* 行程线段图：seg 数组 [x1,y1,x2,y2]，pt 标记点 */
  function line(fig){
    var inner='';
    inner+=seg(fig.x1||24,fig.y||85,fig.x2||216,fig.y||85);
    (fig.marks||[]).forEach(function(m){ inner+='<circle cx="'+m[0]+'" cy="'+(fig.y||85)+'" r="5" fill="'+(m[2]||'#f87171')+'"/>'; if(m[3]) inner+=lbl(m[0],(fig.y||85),m[3]); });
    (fig.tags||[]).forEach(function(t){ inner+='<text x="'+t[0]+'" y="'+t[1]+'" font-size="12" fill="#1e293b">'+esc(t[2])+'</text>'; });
    return wrap(inner,240,170);
  }

  /* 环形跑道 */
  function ring(fig){
    var cx=120, cy=85, R=72, r=40, inner='';
    inner+='<circle cx="'+cx+'" cy="'+cy+'" r="'+R+'" fill="none" stroke="#334155" stroke-width="1.6"/>';
    inner+='<circle cx="'+cx+'" cy="'+cy+'" r="'+r+'" fill="none" stroke="#334155" stroke-width="1.6"/>';
    (fig.pts||[]).forEach(function(p){ inner+='<circle cx="'+p[0]+'" cy="'+p[1]+'" r="5" fill="'+(p[2]||'#f87171')+'"/>'; if(p[3]) inner+=lbl(p[0],p[1],p[3]); });
    return wrap(inner,240,170);
  }

  /* 半圆+内接三角形 */
  function semi(fig){
    var inner='';
    inner+=arc(120,100,66,180,360);
    inner+=seg(54,100,186,100);
    inner+=seg(54,100,120,34); inner+=seg(186,100,120,34);
    (fig.pt||[]).forEach(function(b){ inner+=dot(b.x,b.y); inner+=lbl(b.x,b.y,b.t); });
    return wrap(inner,240,170);
  }

  /* 月牙：直角三角形 + 三边半圆 */
  function moons(fig){
    var inner='';
    inner+=fillPoly([[60,120],[180,120],[60,40]],'#bfdbfe',0.3);
    inner+=seg(60,120,180,120); inner+=seg(60,120,60,40); inner+=seg(60,40,180,120);
    inner+=arc(120,120,60,180,360);
    inner+=arc(60,80,40,90,270);
    inner+=arc(120,80,72.1,123.7,303.7);
    return wrap(inner,240,170);
  }

  /* 羊吃草：矩形 + 角上扇形 */
  function sheep(fig){
    var inner='';
    inner+=seg(40,40,180,40); inner+=seg(180,40,180,150); inner+=seg(180,150,40,150); inner+=seg(40,150,40,40);
    inner+=fanFill({x:180,y:150,r:70,a0:180,a1:270,c:'#bbf7d0',op:0.55});
    inner+=arc(180,150,70,180,270);
    inner+='<circle cx="180" cy="150" r="4" fill="#166534"/>';
    if(fig.tag) inner+='<text x="20" y="25" font-size="12" fill="#1e293b">'+esc(fig.tag)+'</text>';
    return wrap(inner,240,170);
  }

  /* 辐射型数阵：中心 + 周围 n 个圆 + 过心线 */
  function radial(fig){
    var cx=120, cy=85, R=58, n=fig.n||6, inner='', i;
    (fig.lines||[]).forEach(function(k){ var a1=(-90+k*60)*Math.PI/180; inner+=seg(cx+R*Math.cos(a1),cy+R*Math.sin(a1),cx-R*Math.cos(a1),cy-R*Math.sin(a1)); });
    for(i=0;i<n;i++){ var a=(-90+i*60)*Math.PI/180; inner+='<circle cx="'+(cx+R*Math.cos(a)).toFixed(1)+'" cy="'+(cy+R*Math.sin(a)).toFixed(1)+'" r="15" fill="#fff" stroke="#334155" stroke-width="1.4"/>'; }
    inner+='<circle cx="'+cx+'" cy="'+cy+'" r="16" fill="#fde68a" stroke="#334155" stroke-width="1.6"/>';
    inner+='<text x="'+cx+'" y="'+(cy+5)+'" font-size="13" text-anchor="middle" fill="#1e293b">'+esc(fig.center||'?')+'</text>';
    return wrap(inner,240,170);
  }

  /* T 形数阵：横 5 圆 + 竖 5 圆（共用中间） */
  function tnum(fig){
    var cx=120, cy=85, inner='', i;
    for(i=0;i<5;i++){ inner+='<circle cx="'+(40+i*40)+'" cy="'+cy+'" r="16" fill="#fff" stroke="#334155" stroke-width="1.4"/>'; }
    for(i=0;i<5;i++){ inner+='<circle cx="'+cx+'" cy="'+(15+i*35)+'" r="16" fill="'+(i===2?'#fde68a':'#fff')+'" stroke="#334155" stroke-width="1.4"/>'; }
    return wrap(inner,240,170);
  }

  /* 三角形三边圆圈数阵 */
  function triRing(fig){
    var inner='', pos=[[120,26],[30,148],[210,148],[75,87],[165,87],[120,148]];
    inner+=seg(120,26,30,148); inner+=seg(30,148,210,148); inner+=seg(210,148,120,26);
    pos.forEach(function(p){ inner+='<circle cx="'+p[0]+'" cy="'+p[1]+'" r="15" fill="#fff" stroke="#334155" stroke-width="1.4"/>'; });
    (fig.vals||[]).forEach(function(v,i){ inner+='<text x="'+pos[i][0]+'" y="'+(pos[i][1]+5)+'" font-size="13" text-anchor="middle" fill="#1e293b">'+(v===null?'?':v)+'</text>'; });
    return wrap(inner,240,170);
  }

  /* 火车过桥 */
  function train(fig){
    var inner='';
    inner+=seg(10,105,230,105,'stroke-width="2.2"');
    inner+=seg(10,105,30,105,'stroke="#94a3b8" stroke-width="4"'); inner+=seg(210,105,230,105,'stroke="#94a3b8" stroke-width="4"');
    inner+='<rect x="70" y="70" width="90" height="35" rx="6" fill="#dbeafe" stroke="#334155" stroke-width="1.6"/>';
    inner+='<circle cx="92" cy="108" r="6" fill="#334155"/>'; inner+='<circle cx="138" cy="108" r="6" fill="#334155"/>';
    if(fig.tag) inner+='<text x="70" y="60" font-size="12" fill="#1e293b">'+esc(fig.tag)+'</text>';
    return wrap(inner,240,170);
  }

  var MAP = { poly:poly, grid:grid, magic:magic, clock:clock, cube:cube, cuboid:cuboid, cylcone:cylcone, chess:chess, steps:steps, pascal:pascal, line:line, ring:ring, semi:semi, moons:moons, sheep:sheep, radial:radial, tnum:tnum, triRing:triRing, train:train };
  function render(fig){ if(!fig) return ''; var fn = MAP[fig.t]; return fn ? fn(fig) : ''; }
  return render;
})();