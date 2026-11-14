/* JUFA Hokkaido 共通グラフィック（背景5種類）  2026-11
 *
 * 使い方（HTML）：
 *   <section class="jbg" data-jbg="triple-strike" data-color="#86519C" data-color2="#F5F5F5"> …中身… </section>
 *   ページの最後で JUFABG.init() を呼ぶと、data-jbg の付いた要素に背景を入れる。
 * 使い方（JS）：
 *   JUFABG.apply(要素, {variant:'monolith', color:'#86519C', color2:'#F5F5F5', intensity:'normal', deco:true})
 *   色を渡さない（null）と JUFA の色（黒・白・赤）になる。
 *   大学の色は、各ページがすでに持っているチーム紹介（profile.color / color2）から渡す。ここに色を書かない。
 *
 * variant：triangle-ascent / triple-strike（標準）/ orbit / monolith / north-pulse
 * intensity：low / normal / high（装飾の強さ）
 * deco：false で装飾を消す（黒い地と質感だけ）
 * layout：center（中身がまん中。標準）/ left（中身が左寄せ。左側の図形を小さく・うすくし、左を暗くする）
 *
 * 重なりの順：1 黒い地と質感（CSS）→ 2 図形（SVG。四隅に置く部品）→ 3 大学カラー（--jbg-a）→ 4 中身（HTML）
 * 公式ロゴは使わない・描き直さない。図形はロゴの要素（Aの三角形・赤い3本線・ボールの軌道）から考えた別の形。
 */
(function(){
'use strict';
const JUFA_RED='#E60012';
const VARIANTS=['triangle-ascent','triple-strike','orbit','monolith','north-pulse'];

/* 部品：[置く場所, viewBox, PCの大きさ, スマホの大きさ, 中身]
 * 置く場所 tl/tr/bl/br＝四隅、full＝全体（縦横の比は箱に合わせて伸びる）
 * 大きさは「高さ％ / 横％」。片方だけ決めて、もう片方は viewBox の比で決まる（h=高さで決める、w=横で決める） */
const B='filter="url(#jbg-brush)"',R='filter="url(#jbg-rough)"';
/* 細長い三角（筆あと・鋭い線）。(x1,y1)から(x2,y2)へ、太さ w で先が細くなる */
function spike(x1,y1,x2,y2,w,cls,op){const dx=x2-x1,dy=y2-y1,L=Math.hypot(dx,dy),nx=-dy/L*w/2,ny=dx/L*w/2;
  return '<polygon class="'+cls+'"'+(op!=null?' opacity="'+op+'"':'')+' points="'+[x1+nx,y1+ny,x2,y2,x1-nx,y1-ny].map(v=>Math.round(v)).join(',')+'"/>';}
/* 平行な帯（3本線など）。始点、向き（度）、長さ、太さ */
function band(x,y,deg,len,w,cls,op){const r=deg*Math.PI/180,ux=Math.cos(r),uy=-Math.sin(r),nx=-uy,ny=ux;
  return '<polygon class="'+cls+'"'+(op!=null?' opacity="'+op+'"':'')+' points="'+[x,y,x+ux*len,y+uy*len,x+ux*len+nx*w,y+uy*len+ny*w,x+nx*w,y+ny*w].map(v=>Math.round(v)).join(',')+'"/>';}

const ART={
  /* 01 TRIANGLE ASCENT：四隅から中央へ向かう鋭い三角（Aの三角形）と斜めの線。上へ伸びる向き */
  'triangle-ascent':[
    ['full','0 0 1600 900',null,null,'<polygon class="w" opacity=".05" points="800,70 1330,900 270,900"/><polygon class="a" opacity=".08" points="800,70 860,160 740,160" /><line class="w" x1="800" y1="70" x2="1330" y2="900" stroke-width="2" opacity=".08"/>'],
    ['tl','0 0 700 560','h:62%','w:62%','<g '+B+'>'+spike(0,420,640,0,120,'w',.9)+spike(0,520,560,40,70,'g',.55)+spike(0,330,420,0,60,'w',.6)+spike(30,560,700,60,110,'a',.85)+spike(0,250,300,0,30,'w',.35)+'</g>'],
    ['tr','0 0 620 480','h:52%','w:50%','<g '+B+'>'+spike(620,120,80,480,90,'w',.85)+spike(620,30,260,300,40,'g',.6)+spike(620,220,200,480,40,'w',.4)+'</g>'],
    ['bl','0 0 600 420','h:46%','w:46%','<g '+B+'>'+spike(0,120,520,420,26,'g',.5)+spike(0,250,600,420,110,'w',.8)+spike(0,360,300,420,40,'w',.45)+'</g>'],
    ['br','0 0 760 560','h:62%','w:62%','<g '+B+'>'+spike(760,60,40,560,110,'a',.85)+spike(760,250,200,560,120,'w',.9)+spike(760,380,420,560,50,'w',.55)+spike(760,0,330,330,30,'g',.5)+'</g>']
  ],
  /* 02 TRIPLE STRIKE（標準）：右下から右上へ走る平行な3本線（ロゴの赤い3本線）。左下にグレーの帯 */
  'triple-strike':[
    ['br','0 0 1100 700','h:75%','w:96%','<g>'+band(-260,820,32,1700,100,'a')+band(-205,908,32,1700,88,'a',.92)+band(-155,990,32,1700,82,'a',.85)+'</g>'+
      '<g opacity=".55">'+band(-260,820,32,1700,100,'shade')+band(-205,908,32,1700,88,'shade')+band(-155,990,32,1700,82,'shade')+'</g>'+band(560,780,32,700,90,'g',.35)],
    ['bl','0 0 1000 340','h:36%','w:80%','<polygon class="w" opacity=".42" points="0,180 520,0 600,0 0,272"/><polygon class="g" opacity=".38" points="140,340 940,30 1000,30 330,340"/>'],
    ['tl','0 0 1000 560','h:60%','w:90%','<g opacity=".16" '+R+'>'+spike(0,300,700,0,90,'w')+spike(80,560,1000,90,60,'w',.6)+spike(0,460,500,140,40,'w',.7)+'</g>']
  ],
  /* 03 ORBIT：ボールの軌道。大きな楕円の白・赤・グレーの弧（中央は暗く空ける） */
  'orbit':[
    ['full','0 0 1600 900',null,null,
      '<g transform="rotate(-9 800 450)" fill="none" '+B+'>'+
      '<ellipse class="sg" cx="800" cy="450" rx="860" ry="440" stroke-width="40" opacity=".35" pathLength="100" stroke-dasharray="40 10 30 20"/>'+
      '<ellipse class="sw" cx="815" cy="442" rx="800" ry="378" stroke-width="22" pathLength="100" stroke-dasharray="48 52" stroke-dashoffset="-27"/>'+
      '<ellipse class="sw" cx="815" cy="442" rx="800" ry="378" stroke-width="46" pathLength="100" stroke-dasharray="38 62" stroke-dashoffset="-32"/>'+
      '<ellipse class="sw" cx="815" cy="442" rx="800" ry="378" stroke-width="72" pathLength="100" stroke-dasharray="25 75" stroke-dashoffset="-38"/>'+
      '<ellipse class="sa" cx="815" cy="442" rx="800" ry="378" stroke-width="18" pathLength="100" stroke-dasharray="55 45" stroke-dashoffset="-80"/>'+
      '<ellipse class="sa" cx="815" cy="442" rx="800" ry="378" stroke-width="38" pathLength="100" stroke-dasharray="37 63" stroke-dashoffset="-90"/>'+
      '<ellipse class="sa" cx="815" cy="442" rx="800" ry="378" stroke-width="58" pathLength="100" stroke-dasharray="20 80" stroke-dashoffset="-98"/>'+
      '<ellipse class="sw" cx="815" cy="450" rx="735" ry="330" stroke-width="4" opacity=".7" pathLength="100" stroke-dasharray="0 30 40 30"/>'+
      '<ellipse class="sg" cx="800" cy="455" rx="900" ry="480" stroke-width="6" opacity=".5" pathLength="100" stroke-dasharray="20 15 30 35"/>'+
      '</g>']
  ],
  /* 04 MONOLITH：ロゴの太い直線と形。左上に白い角丸の板、右下に白い三角と3本線 */
  'monolith':[
    ['full','0 0 1600 900',null,null,'<g opacity=".22">'+band(-120,820,40,900,90,'g')+band(900,1000,40,600,60,'g')+'</g>'],
    ['tl','0 0 260 410','h:44%','h:20%','<path class="w" d="M0,0H255V250A160,160 0 0 1 95,410H0Z"/>'],
    ['br','0 0 760 830','h:90%','h:40%','<defs><clipPath id="jbg-mtri"><polygon points="760,0 240,830 760,830"/></clipPath></defs>'+
      band(0,830,42,480,70,'g',.3)+'<polygon class="w" points="760,0 240,830 760,830"/>'+
      '<g clip-path="url(#jbg-mtri)">'+band(300,860,35,700,30,'a')+band(340,920,35,700,30,'a')+band(380,980,35,700,30,'a')+'</g>']
  ],
  /* 05 NORTH PULSE：北海道の山並み（右上）と、上へ向かう筆の線 */
  'north-pulse':[
    ['tr','0 0 1100 320','w:66%','w:92%',
      '<defs><linearGradient id="jbg-mt" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a3a3a"/><stop offset="1" stop-color="#0d0d0d" stop-opacity="0"/></linearGradient></defs>'+
      '<path fill="url(#jbg-mt)" d="M0,300L190,150L300,128L330,140L410,110L510,105L560,97L660,38L740,60L840,105L980,80L1100,95V320H0Z"/>'+
      '<g class="w" '+R+'><polygon opacity=".85" points="660,38 600,80 540,140 620,100"/><polygon opacity=".6" points="410,110 360,150 300,190 390,140"/><polygon opacity=".7" points="980,80 900,130 840,170 950,110"/><polygon opacity=".45" points="190,150 120,210 60,250 170,180"/></g>'+
      '<path class="sw" fill="none" stroke-width="2" opacity=".55" d="M190,150L300,128L330,140L410,110L510,105L560,97L660,38L740,60L840,105L980,80L1100,95"/>'],
    ['tl','0 0 620 300','h:32%','w:60%','<g '+B+'>'+spike(0,95,300,0,70,'w',.85)+spike(0,290,600,0,80,'a',.9)+spike(0,200,420,0,30,'w',.4)+'</g>'],
    ['br','0 0 1000 420','h:46%','w:96%','<g '+B+'>'+spike(1000,0,420,250,70,'w',.55)+spike(1000,140,150,420,150,'a',.95)+spike(1000,270,500,420,80,'a',.7)+spike(1000,60,640,260,40,'g',.6)+'</g>'],
    ['bl','0 0 900 170','h:18%','w:80%','<path class="g" opacity=".35" d="M0,40Q200,0 420,90L420,170H0Z"/><g '+B+'>'+spike(160,170,880,10,60,'w',.85)+spike(0,170,420,100,30,'g',.5)+'</g>']
  ]
};

/* 色の明るさ（0＝黒〜1＝白） */
function lum(c){const m=/^#?([0-9a-f]{6})$/i.exec(c||'');if(!m)return null;const n=parseInt(m[1],16);
  const L=[n>>16&255,n>>8&255,n&255].map(v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)});return .2126*L[0]+.7152*L[1]+.0722*L[2];}
const okColor=c=>/^#[0-9a-f]{6}$/i.test(c||'');

/* 筆のかすれ・ふちのギザギザ（全部の背景で1つを使い回す） */
function ensureDefs(){
  if(document.getElementById('jbg-defs'))return;
  const s=document.createElementNS('http://www.w3.org/2000/svg','svg');
  s.setAttribute('id','jbg-defs');s.setAttribute('aria-hidden','true');s.setAttribute('focusable','false');
  s.style.cssText='position:absolute;width:0;height:0;overflow:hidden';
  s.innerHTML='<defs>'+
    '<linearGradient id="jbg-shade" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#000" stop-opacity=".85"/><stop offset=".4" stop-color="#000" stop-opacity="0"/><stop offset=".75" stop-color="#000" stop-opacity=".1"/><stop offset="1" stop-color="#000" stop-opacity=".6"/></linearGradient>'+
    '<filter id="jbg-brush" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency="0.012 0.09" numOctaves="3" seed="7" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="16" xChannelSelector="R" yChannelSelector="G" result="d"/>'+
    '<feTurbulence type="fractalNoise" baseFrequency="0.06 0.5" numOctaves="2" seed="3" result="g"/><feColorMatrix in="g" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -4 2.9" result="ga"/><feComposite in="d" in2="ga" operator="in"/></filter>'+
    '<filter id="jbg-rough" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="2" seed="4" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="8" xChannelSelector="R" yChannelSelector="G"/></filter>'+
    '</defs>';
  (document.body||document.documentElement).appendChild(s);
}

function svgPiece(p){
  const [pos,vb,pc,sp,inner]=p,full=pos==='full';
  const par=full?'none':{tl:'xMinYMin',tr:'xMaxYMin',bl:'xMinYMax',br:'xMaxYMax'}[pos]+' meet';
  const sz=(v,pre)=>{if(!v)return '';const [k,n]=v.split(':');return '--'+pre+(k==='h'?'h':'w')+':'+n+';'};
  const [vw,vh]=vb.split(' ').slice(2);
  return '<svg class="jbg-p jbg-'+pos+'" viewBox="'+vb+'" preserveAspectRatio="'+par+'" style="aspect-ratio:'+vw+'/'+vh+';'+sz(pc,'')+sz(sp,'s')+'" aria-hidden="true" focusable="false">'+inner+'</svg>';
}

/* 背景を入れる。el：入れる箱、o：{variant,color,color2,intensity,deco} */
function apply(el,o){
  if(!el)return;o=o||{};ensureDefs();
  const v=VARIANTS.includes(o.variant)?o.variant:'triple-strike';
  el.classList.add('jbg');el.dataset.jbg=v;
  el.dataset.intensity=['low','normal','high'].includes(o.intensity)?o.intensity:(el.dataset.intensity||'normal');
  if(o.deco===false)el.dataset.deco='off';else el.removeAttribute('data-deco');
  el.dataset.layout=o.layout==='left'?'left':(o.layout?'center':(el.dataset.layout||'center'));
  /* 大学カラー：アクセントだけ変える。黒い地・白い文字・白い飾りはそのまま。色がないときは JUFA の赤 */
  let a=okColor(o.color)?o.color:JUFA_RED,low='';
  const L=lum(a);
  if(L!=null&&L<.03)low='dark';      // 黒に近い色：白いふちを付けて地から浮かせる（色そのものは変えない）
  else if(L!=null&&L>.8)low='light'; // 白に近い色：白い飾りと区別できるよう、グレーのふち
  el.style.setProperty('--jbg-a',a);
  el.style.setProperty('--jbg-a2',okColor(o.color2)?o.color2:'#ffffff');
  if(low)el.dataset.low=low;else el.removeAttribute('data-low');
  el.dataset.team=okColor(o.color)?'1':'0';
  let art=el.querySelector(':scope>.jbg-art');
  if(!art){art=document.createElement('div');art.className='jbg-art';art.setAttribute('aria-hidden','true');el.insertBefore(art,el.firstChild);}
  if(art.dataset.v!==v){art.innerHTML=ART[v].map(svgPiece).join('');art.dataset.v=v;}
}
/* チーム紹介（profile）から色を取り出す。ページが持っている大学カラーマスターをそのまま使う */
function fromProfile(p){return p?{color:okColor(p.color)?p.color:null,color2:okColor(p.color2)?p.color2:null}:{color:null,color2:null};}
/* data-jbg の付いた要素にまとめて入れる */
function init(root){(root||document).querySelectorAll('[data-jbg]').forEach(el=>{if(el.querySelector(':scope>.jbg-art'))return;
  apply(el,{variant:el.dataset.jbg,color:el.dataset.color,color2:el.dataset.color2,intensity:el.dataset.intensity,layout:el.dataset.layout,deco:el.dataset.deco!=='off'});});}

window.JUFABG={apply,init,fromProfile,variants:VARIANTS.slice()};
})();
