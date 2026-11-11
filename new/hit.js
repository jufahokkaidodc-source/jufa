/* アクセス数：ページが開かれたことだけを全体システム（Google Cloud の新しいしくみ）に知らせる（名前・IPアドレス・クッキーは使わない）。
   ダッシュボードの「発信」→「アクセス数」で見る。「トラッキング拒否」の設定のブラウザでは送らない */
(function(){
  try{
    if(navigator.doNotTrack==='1'||window.doNotTrack==='1')return;
    var EXEC='https://app.jufahokkaido.com/api/hit';
    var p=(location.pathname.split('/').pop()||'index.html').replace(/\.html$/,'')||'index';
    var q=new URLSearchParams(location.search),x=p==='results'?(q.get('comp')||''):(p==='team'||p==='player')?(q.get('team')||''):'';
    new Image().src=EXEC+'?p='+encodeURIComponent(p)+'&q='+encodeURIComponent(x)+'&_='+Date.now();
  }catch(e){}
})();
