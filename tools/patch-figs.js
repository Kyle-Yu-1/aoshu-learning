const fs = require('fs'), path = require('path');
const F = path.join(__dirname, '..', 'js', 'figs.js');
let f = fs.readFileSync(F, 'utf8');
f = f.split('fill-opacity="0.35"').join('fill-opacity="' + "' + (b.op||0.9) + '" + '"');
f = f.split('size=36, x0=(240-n*size)/2').join('size=Math.min(36,Math.floor(220/n),Math.floor(150/m)), x0=(240-n*size)/2');
f = f.split("if(fig.t==='cyl'){").join("if(fig.kind==='cyl'){");
fs.writeFileSync(F, f, 'utf8');
console.log('figs patched');