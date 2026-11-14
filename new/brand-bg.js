/* JUFA Hokkaido 共通グラフィック（背景5種類）  2026-11
 *
 * 使い方（HTML）：
 *   <section data-jbg="triple-strike" data-color="#86519C" data-color2="#F5F5F5"> …中身… </section>
 *   ページの最後で JUFABG.init() を呼ぶと、data-jbg の付いた要素に背景を入れる。
 * 使い方（JS）：
 *   JUFABG.apply(要素, {variant:'monolith', color:'#86519C', color2:'#F5F5F5', intensity:'normal', layout:'center', deco:true})
 *   色を渡さない（null）と JUFA の色（黒・白・赤）になる。
 *   大学の色は、各ページがすでに持っているチーム紹介（profile.color / color2）から渡す。ここに色を書かない。
 *
 * variant：triangle-ascent / triple-strike（標準）/ orbit / monolith / north-pulse
 * intensity：low / normal / high（装飾の強さ）
 * layout：center（中身がまん中）/ left（中身が左寄せ：左側をうすく・暗くする）
 * deco：false で装飾を消す（黒い地だけ）
 *
 * 重なりの順：1 地と質感（img/bg/〇〇.webp。元の画像から赤い部分を抜いたもの）
 *           → 2・3 図形の色（img/bg/〇〇-a.webp の形に大学カラーを流しこみ、〇〇-d.webp で元の濃淡をもどす）
 *           → 4 中身（HTML）
 * 箱が横長のときは画像を1枚で、縦長（スマホなど）のときは左半分・右半分に分けて画面の端に寄せる。
 * 公式ロゴは使わない・描き直さない。
 */
(function(){
'use strict';
const JUFA_RED='#E60012';
const VARIANTS=['triangle-ascent','triple-strike','orbit','monolith','north-pulse'];
const RATIO=1672/941; // 元の画像の横÷縦

function lum(c){const m=/^#?([0-9a-f]{6})$/i.exec(c||'');if(!m)return null;const n=parseInt(m[1],16);
  const L=[n>>16&255,n>>8&255,n&255].map(v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)});return .2126*L[0]+.7152*L[1]+.0722*L[2];}
const okColor=c=>/^#[0-9a-f]{6}$/i.test(c||'');

/* 横長か縦長かを見て、置き方を変える（縦長は左右に分けて端に寄せる） */
const RO=typeof ResizeObserver==='function'?new ResizeObserver(es=>es.forEach(e=>shape(e.target))):null;
function shape(el){const w=el.clientWidth,h=el.clientHeight;if(!w||!h)return;const s=w/h<RATIO*.92?'tall':'wide';if(el.dataset.shape!==s)el.dataset.shape=s;}

const LAYERS='<div class="jbg-b"></div><div class="jbg-c"><i></i></div><div class="jbg-d"></div>';

/* 背景を入れる。el：入れる箱、o：{variant,color,color2,intensity,layout,deco} */
function apply(el,o){
  if(!el)return;o=o||{};
  const v=VARIANTS.includes(o.variant)?o.variant:'triple-strike';
  el.classList.add('jbg');el.dataset.jbg=v;
  el.dataset.intensity=['low','normal','high'].includes(o.intensity)?o.intensity:(el.dataset.intensity||'normal');
  el.dataset.layout=o.layout==='left'?'left':(o.layout?'center':(el.dataset.layout||'center'));
  if(o.deco===false)el.dataset.deco='off';else el.removeAttribute('data-deco');
  /* 大学カラー：図形の色の部分だけ変える。黒い地・白い文字・白い飾りはそのまま。色がないときは JUFA の赤 */
  const a=okColor(o.color)?o.color:JUFA_RED,L=lum(a);
  el.style.setProperty('--jbg-a',a);
  el.style.setProperty('--jbg-a2',okColor(o.color2)?o.color2:'#ffffff');
  if(L!=null&&L<.03)el.dataset.low='dark';        // 黒に近い色：白いふちで地から浮かせる（色そのものは変えない）
  else if(L!=null&&L>.8)el.dataset.low='light';   // 白に近い色：グレーのふちで白い飾りと分ける
  else el.removeAttribute('data-low');
  el.dataset.team=okColor(o.color)?'1':'0';
  let art=el.querySelector(':scope>.jbg-art');
  if(!art){art=document.createElement('div');art.className='jbg-art';art.setAttribute('aria-hidden','true');
    art.innerHTML='<div class="jbg-h jbg-l">'+LAYERS+'</div><div class="jbg-h jbg-r">'+LAYERS+'</div>';
    el.insertBefore(art,el.firstChild);}
  shape(el);if(RO)RO.observe(el);
}
/* チーム紹介（profile）から色を取り出す。ページが持っている大学カラーマスターをそのまま使う */
function fromProfile(p){return p?{color:okColor(p.color)?p.color:null,color2:okColor(p.color2)?p.color2:null}:{color:null,color2:null};}
/* data-jbg の付いた要素にまとめて入れる */
function init(root){(root||document).querySelectorAll('[data-jbg]').forEach(el=>{if(el.querySelector(':scope>.jbg-art'))return;
  apply(el,{variant:el.dataset.jbg,color:el.dataset.color,color2:el.dataset.color2,intensity:el.dataset.intensity,layout:el.dataset.layout,deco:el.dataset.deco!=='off'});});}

window.JUFABG={apply,init,fromProfile,variants:VARIANTS.slice()};
})();
