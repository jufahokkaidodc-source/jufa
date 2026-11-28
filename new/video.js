/* 試合の映像（ライブ配信・アーカイブ。YouTube・hudl）
 *  システムの /api/videos?comp=大会ID を読む（事務局・当番校が入れたURL）。開いているあいだは1分ごとに読み直す
 *  使い方：JUFA_VIDEO.load(大会ID)。JUFA_VIDEO.of(試合ID) → { live:{kind,url,embed}, archive:{…} } か null。JUFA_VIDEO.on(関数) で、中身が変わったときに呼ばれる
 */
(function(){
  var API=(window.JUFA_VIDEO_API||'https://app.jufahokkaido.com/api/videos')+'?v=1';
  var V={comp:'',map:{},subs:[],timer:null,last:''};
  function next(){clearTimeout(V.timer);V.timer=setTimeout(function(){V.load(V.comp)},60000);}
  V.load=function(comp){
    if(!comp)return;
    if(comp!==V.comp){V.comp=comp;V.map={};V.last='';}
    if(document.visibilityState==='hidden'){next();return;}
    var cb='__jufaVideo'+Date.now(),s=document.createElement('script'),done=false;
    window[cb]=function(d){done=true;try{delete window[cb];}catch(e){window[cb]=undefined;}s.remove();
      if(d&&d.ok&&d.comp===V.comp){var j=JSON.stringify(d.videos||{});if(j!==V.last){V.last=j;V.map=d.videos||{};V.subs.forEach(function(f){try{f(V);}catch(e){}});}}
      next();};
    s.onerror=function(){s.remove();next();};
    setTimeout(function(){if(!done){s.remove();next();}},20000);
    s.src=API+'&comp='+encodeURIComponent(comp)+'&callback='+cb;
    document.head.appendChild(s);
  };
  V.of=function(id){return V.map[id]||null;};
  V.on=function(f){V.subs.push(f);};
  document.addEventListener('visibilitychange',function(){if(document.visibilityState==='visible'&&V.comp)V.load(V.comp);});
  window.JUFA_VIDEO=V;
})();
