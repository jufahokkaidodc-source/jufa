/* 画面に入ってきた部分を、ふわっと出す（2026-11）
 *  ・見出し・カード・表などに、画面に入ったときだけ動きを付ける。最初から画面にあるものは動かさない
 *  ・「動きを減らす」設定の端末では動かさない。JavaScript が動かないときは、何もしない（ふつうに見える）
 */
(function () {
  'use strict';
  // 写真は連盟のシステム（app.jufahokkaido.com）から速く出す。出せないときは、もとの Google ドライブの縮小版に切りかえる
  document.addEventListener('error', function (e) {
    var t = e.target; if (!t || t.tagName !== 'IMG' || t.dataset.fb) return;
    var m = String(t.src).match(/\/img\/drive\/([\w-]+)\?sz=w(\d+)/); if (!m) return;
    t.dataset.fb = '1'; t.src = 'https://drive.google.com/thumbnail?id=' + m[1] + '&sz=w' + m[2];
  }, true);
  if (!('IntersectionObserver' in window)) return;
  if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var SEL = '.sechead,.bigc,.card,.club,.clubs>*,.scorer,.mcard,.news-item,.ni,.pv,.sh,.box,.partner>div';
  var css = document.createElement('style');
  css.textContent = '.rv{opacity:0;transform:translateY(14px);transition:opacity .5s ease,transform .5s ease}.rv.in{opacity:1;transform:none}';
  document.head.appendChild(css);
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px' });
  function scan(root) {
    var h = window.innerHeight;
    (root || document).querySelectorAll(SEL).forEach(function (el) {
      if (el.dataset.rv) return; el.dataset.rv = '1';
      if (el.getBoundingClientRect().top < h) return; // 最初から見えているものは動かさない
      el.classList.add('rv'); io.observe(el);
    });
  }
  // データを読み込んでから中身ができるので、少しずつ見に行く
  var n = 0, t = setInterval(function () { scan(); if (++n > 20) clearInterval(t); }, 500);
  window.addEventListener('load', function () { scan(); });
})();
