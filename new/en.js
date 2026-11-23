/* 大会記録（results.html）の英語表示（2026-11：Hudl 社との提携。海外の人にも記録を見てもらう）
 *  ・ページの上の「English」で切りかえ（えらんだ言葉は覚えておく。?lang=en・?lang=ja でも切りかえ）
 *  ・名前：data/en.json（連盟のシステムが書き出す。チーム・選手・会場・大会の英語名）。英語名がないものは日本語のまま
 *  ・画面の言葉：下の WORDS（そのままの言葉）と RULES（日付・節・勝敗など、形が決まった言葉）で英語に
 *  使い方：results.html で site.js のあとに読み込む。データは jufaEN.data(d)、言葉は自動（画面が変わるたびに直す） */
(function () {
  'use strict';
  const KEY = 'jufa_lang';
  const q = new URLSearchParams(location.search).get('lang');
  if (q === 'en' || q === 'ja') { try { localStorage.setItem(KEY, q); } catch (_) {} }
  let lang = q || 'ja';
  if (!q) { try { lang = localStorage.getItem(KEY) || 'ja'; } catch (_) {} }
  const EN = lang === 'en';
  const JP = /[぀-ヿ一-鿿]/;
  const nm = (s) => String(s == null ? '' : s).replace(/[\s　]/g, '');
  const vkey = (s) => String(s == null ? '' : s).normalize('NFKC').replace(/[\s　]/g, '').replace(/\(/g, '（').replace(/\)/g, '）');
  let MAP = { teams: {}, players: {}, venues: {}, comps: {} };
  const ready = EN ? fetch('../results/data/en.json', { cache: 'no-cache' }).then((r) => (r.ok ? r.json() : null)).catch(() => null).then((m) => { if (m) MAP = Object.assign(MAP, m); }) : Promise.resolve();

  // ---------- 名前 ----------
  const WD = { 日: 'Sun', 月: 'Mon', 火: 'Tue', 水: 'Wed', 木: 'Thu', 金: 'Fri', 土: 'Sat' };
  const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const teamOf = (k) => MAP.teams[nm(k)] || null;
  const shortOf = (s) => { const t = teamOf(s); return t ? t.short : s; };
  const player = (name, univ) => { if (!name || !JP.test(name)) return name; return MAP.players[nm(univ) + '|' + nm(name)] || MAP.players['|' + nm(name)] || name; };
  const venue = (v) => { if (!v || !JP.test(v)) return v; return MAP.venues[vkey(v)] || v; };
  function round(r) {
    return String(r == null ? '' : r).replace(/第\s*(\d+)\s*節/g, 'Matchday $1').replace(/(\d+)\s*回戦/g, 'Round $1').replace(/準々決勝/g, 'Quarter-final').replace(/準決勝/g, 'Semi-final')
      .replace(/3位決定戦|三位決定戦/g, '3rd place').replace(/決勝/g, 'Final').replace(/入替戦/g, 'Playoff').replace(/プレーオフ/g, 'Playoff');
  }
  const INFO = { '晴れ': 'Sunny', '晴': 'Sunny', '快晴': 'Clear', '曇り': 'Cloudy', '曇': 'Cloudy', '雨': 'Rain', '小雨': 'Light rain', '雪': 'Snow', '天然芝': 'Natural grass', '人工芝': 'Artificial turf',
    '土': 'Dirt', '良': 'Good', '良好': 'Good', '普通': 'Fair', 'やや不良': 'Fair', '不良': 'Poor', '無風': 'None', '微風': 'Light', '弱': 'Light', '中': 'Moderate', '強': 'Strong', '強風': 'Strong' };
  const info = (v) => (INFO[v] || String(v || '').replace(/(\d+)\s*分/g, '$1 min'));
  const AWARD = { '最優秀選手賞（MVP）': 'Most Valuable Player', '最優秀選手賞': 'Most Valuable Player', '優秀選手賞': 'Outstanding Player', '最優秀新人賞': 'Best Rookie', '優秀新人賞': 'Outstanding Rookie',
    '最優秀GK賞': 'Best Goalkeeper', '最優秀DF賞': 'Best Defender', '最優秀MF賞': 'Best Midfielder', '最優秀FW賞': 'Best Forward', '得点王': 'Top Scorer', 'アシスト王': 'Top Assist', 'フェアプレー賞': 'Fair Play Award' };

  // データ（大会・試合の詳細・名簿）の名前を英語に。チームの id・univ（色やエンブレムを探すのに使う）は変えない
  const isTeam = (o) => o && typeof o === 'object' && !Array.isArray(o) && 'id' in o && 'name' in o && ('short' in o || 'univ' in o);
  function walk(o, ctx) {
    if (Array.isArray(o)) { o.forEach((x) => walk(x, ctx)); return; }
    if (!o || typeof o !== 'object') return;
    if (isTeam(o)) { const t = teamOf(o.id) || teamOf(o.name) || teamOf(o.short); if (t) { o.name = t.name; o.short = t.short; } return; }
    // チームの文脈（選手の名前を、その大学の名前で探す）
    let c = ctx;
    if (o.match && o.match.home && o.match.away) c = { home: o.match.home.univ, away: o.match.away.univ };
    else if (o.home && o.away && isTeam(o.home)) c = { home: o.home.univ, away: o.away.univ };
    const univ = o.team && o.team.univ ? o.team.univ : o.side && c ? c[o.side] : c && c.univ;
    if (o.competition && o.competition.id && MAP.comps[o.competition.id]) o.competition.name = MAP.comps[o.competition.id];
    if ('year' in o && 'format' in o && o.id && MAP.comps[o.id]) o.name = MAP.comps[o.id]; // competitions.json
    for (const k of Object.keys(o)) {
      const v = o[k];
      if (typeof v === 'string') {
        if (!JP.test(v)) continue;
        if (k === 'venue') o[k] = venue(v);
        else if (k === 'round') o[k] = round(v);
        else if (k === 'opp' || k === 'host' || k === 'fourth' || k === 'venueSchool' || k === 'duty') o[k] = shortOf(v);
        else if (k === 'award') o[k] = AWARD[v] || v;
        else if (k === 'scorer' || k === 'assist' || k === 'in' || k === 'out' || k === 'name') o[k] = player(v, univ);
        else if (['weather', 'pitch', 'pitchCondition', 'wind', 'duration'].includes(k)) o[k] = info(v);
        continue;
      }
      if (k === 'lineups' || k === 'stats') { for (const sd of ['home', 'away']) if (v && v[sd]) walk(v[sd], { univ: c && c[sd] }); continue; }
      if (k === 'team' || k === 'home' || k === 'away') { walk(v, c); continue; }
      walk(v, c);
    }
  }
  function data(d) { if (EN && d && typeof d === 'object') { try { walk(d, null); } catch (e) { console.warn('en', e); } } return d; }

  // ---------- 画面の言葉 ----------
  const WORDS = {
    'トップ': 'Home', '日程・結果': 'Fixtures & Results', '順位・ランキング': 'Standings & Rankings', 'お知らせ': 'News', '歴代成績': 'History', '大会情報': 'Competition info', '会場案内': 'Venues',
    '連盟について': 'About', '年間日程表': 'Season calendar', '☰ メニュー': '☰ Menu', 'ページ上部へ ↑': 'Back to top ↑', '北海道学生サッカー連盟': 'Hokkaido University Football Association',
    '大会記録': 'Competition records', '順位表': 'Standings', '星取表': 'Results grid', 'トーナメント': 'Bracket', '得点': 'Goals', 'アシスト': 'Assists', '警告・退場': 'Cautions & dismissals',
    '表彰': 'Awards', '分析': 'Analysis', '日程・結果・順位表・得点ランキング・警告・退場': 'Fixtures, results, standings, scorers, cautions and dismissals', '読み込み中…': 'Loading…',
    'すべての節': 'All matchdays', 'すべてのチーム': 'All teams', '当番校：すべて': 'Host: all', '順位': 'Pos', 'チーム': 'Team', '試合': 'Match', '勝': 'W', '分': 'D', '敗': 'L', '得失点': 'GD', '失点': 'GA',
    '勝点': 'Pts', '勝率': 'Win %', '選手': 'Player', '警告': 'YC', '退場': 'RC', '停止': 'Susp.', '出場停止の試合': 'Suspended matches', '出場停止（消化済み）': 'Suspension (served)', '出場': 'Apps',
    '先発': 'Starts', '出場時間': 'Minutes', '上位20人': 'Top 20', '決定率': 'Conversion', '得点/90分': 'Goals/90', '90分あたりの得点': 'Goals per 90 min', 'シュート': 'Shots', 'オフサイド': 'Offside',
    'シュート・セットプレー': 'Shots & set pieces', '打たれた': 'Against', '時間帯別の得点': 'Goals by time', 'チームの時間帯別 得点-失点': 'Goals for/against by time', '先制したとき・されたとき': 'Scoring first / conceding first',
    '先制した試合': 'Scored first', '先制された試合': 'Conceded first', '前半リード': 'Led at half-time', '逆転勝ち': 'Comeback wins', '途中出場からの得点': 'Goals by substitutes', '1試合あたり': 'Per match',
    '延期': 'Postponed', '会場変更': 'Venue changed', 'KO変更': 'Kick-off changed', '日程変更': 'Rescheduled', '対戦決定': 'Fixture confirmed', '注釈': 'Note', '公式の記録ではありません': 'Not an official record',
    '試合の一覧で見る': 'See in the fixtures list', '試合が見つかりません': 'Match not found', '読み込めませんでした。時間をおいて、もう一度開いてください。': 'Could not load. Please try again later.',
    '↗ この大会を共有する': '↗ Share this competition', '📅 日程をカレンダーに入れる': '📅 Add fixtures to your calendar', 'この大会の全試合': 'All matches in this competition', 'Googleカレンダー': 'Google Calendar',
    'iPhone・Mac': 'iPhone / Mac', '登録すると、日程や会場が変わったときもカレンダーが自動で変わります（反映まで数時間かかることがあります）': 'Your calendar updates automatically when dates or venues change (this can take a few hours).',
    '○勝ち　●負け　△引き分け（左のチームから見た結果）': '○ win　● loss　△ draw (from the left-hand team’s view)',
    '順位は勝点・得失点差・総得点・当該チーム同士の勝敗の順で決めます（大会要項による）。': 'Ranking: points, goal difference, goals scored, then head-to-head (per competition regulations).',
    '大会記録は、公式記録（各試合の当番校が入力し、両チーム・主審が承認したもの）から自動で反映しています。': 'Records are updated automatically from the official match reports (entered by the host university and approved by both teams and the referee).',
    'コードのない「C」「S」は、理由の区分が記録されていない警告・退場です。累積警告は、出場停止となった時点と大会終了時に消えます。': '"C" / "S" without a number: the reason code was not recorded. Accumulated cautions are cleared when a suspension is imposed and at the end of the competition.',
    '決定率＝得点÷シュート。FKは直接FKと間接FKの合計です。シュートなどの記録が入っている試合だけで計算しています。': 'Conversion = goals ÷ shots. FK = direct + indirect free kicks. Calculated only from matches with shot data.',
    '先制は、得点の時間がすべて記録された試合だけで数えています。前半リードは、前半を勝って終えた試合の結果です。': 'Scoring first is counted only for matches with all goal times recorded. "Led at half-time" = result of matches the team led at half-time.',
    '公式記録の画面で入力された試合の得点と出場時間で計算しています。': 'Calculated from goals and minutes in matches entered on the official report screen.',
    'ベンチから出て決めた得点（公式記録の画面で入力された試合）。': 'Goals scored by substitutes (matches entered on the official report screen).',
    'プレ大会（フェスティバル）：シーズン前に、大会運営システム（速報・結果）を試すための大会です。': 'Pre-season festival: a trial event to test the results system before the season.',
    '反スポーツ的行為': 'Unsporting behaviour', 'ラフプレー': 'Reckless play', '言葉または行動による異議': 'Dissent by word or action', '繰り返しの反則': 'Persistent offences', 'プレーの再開を遅らせる': 'Delaying the restart',
    '規定の距離を守らない': 'Failure to respect the distance', '主審の承認を得ずにフィールドに入る': 'Entering the field without permission', '主審の承認を得ずにフィールドから出る': 'Leaving the field without permission',
    '著しく不正なプレー': 'Serious foul play', '乱暴な行為': 'Violent conduct', '人をかむ、つばを吐く': 'Biting or spitting', '手で得点・決定的な得点の機会を阻止': 'Denying a goal by handball',
    '反則で決定的な得点の機会を阻止': 'Denying an obvious goal-scoring opportunity', '攻撃的、侮辱的、下品な発言や行動': 'Offensive, insulting or abusive language/action', '同じ試合で2つ目の警告': 'Second caution in the same match',
    'カレンダーに入れる日程': 'Fixtures to add', '当番校': 'Host', '節': 'Matchday', '記録の種類': 'Record type', '試合の詳細': 'Match details', '公式記録の画面で入力された': 'entered on the official report screen',
    '前半': '1st half', '後半': '2nd half', '延長': 'Extra time', 'PK戦': 'Penalties', '得点者': 'Scorer', '交代': 'Substitutions', '警告・退場の記録': 'Cautions & dismissals', '主審': 'Referee', '副審': 'Assistant referees',
    '試合詳細': 'Match details', '試合詳細 ›': 'Match details ›', '試合経過': 'Match events', 'メンバー': 'Line-ups', '控え': 'Substitutes', 'スタッツ': 'Stats', 'コーナーキック': 'Corner kicks', 'ゴールキック': 'Goal kicks', '直接FK': 'Direct FK', '間接FK': 'Indirect FK',
    '審判員・コンディション': 'Officials & conditions', '対戦成績・データ': 'Head-to-head & data', '第4審': '4th official', '用紙の形・印刷やPDF保存もできます': 'Official form view (print or save as PDF)',
    '📄 公式記録を見る': '📄 View official match report', '大会本部': 'Competition HQ', '学連事務局': 'Federation office', 'オウンゴール': 'Own goal', 'サテライト': 'Satellite', 'セカンド': 'Second',
    '会場': 'Venue', '天候': 'Weather', 'ピッチ': 'Pitch', 'ベンチ': 'Bench', 'スタメン': 'Starting XI', '監督': 'Coach', '試合終了': 'Full time', '試合前': 'Upcoming', '中止': 'Cancelled', '中断': 'Suspended',
  };
  const RULES = [
    [/(\d{1,2})月(\d{1,2})日（(.)）/g, (a, m, d, w) => `${WD[w] || w} ${+d} ${MON[m - 1]}`],
    [/(\d{1,2})\/(\d{1,2})\((.)\)/g, (a, m, d, w) => `${+d} ${MON[m - 1]} (${WD[w] || w})`],
    [/(\d+)勝(\d+)分(\d+)敗/g, '$1W $2D $3L'],
    [/(\d+) \/ (\d+) 試合終了/g, '$1 / $2 played'],
    [/大会全体・(\d+)点/g, 'All teams · $1 goals'],
    [/^試合（終わった (\d+) 試合のうち）から集計しています。入力された試合が増えると、自動で増えます。$/, 'matches (of $1 played). Updated automatically as more reports are entered.'],
    [/時間が記録されていない得点（(\d+)点）は数えていません。/g, 'Goals without a recorded time ($1) are not counted.'],
    [/^出場 (\d+)分以上$/, 'Played $1+ min'], [/(\d+)-(\d+)分/g, "$1-$2'"],
    [/^更新：/, 'Updated: '], [/^当番校：?\s*/, 'Host: '], [/^(.+)の試合$/, '$1 matches'],
    [/第\s*(\d+)\s*節/g, 'Matchday $1'], [/(\d+)\s*回戦/g, 'Round $1'], [/準々決勝/g, 'Quarter-final'], [/準決勝/g, 'Semi-final'], [/3位決定戦/g, '3rd place'], [/決勝/g, 'Final'],
    // 大会名（data/en.json に英語名がないとき）
    [/^(\d{4})年度\s*第\d+回北海道学生サッカーリーグ\s*(\d)部$/, '$1 Hokkaido University Football League Division $2'],
    [/^(\d{4}年度\s*)?インディペンデンスリーグ北海道大会$/, 'Independence League Hokkaido'],
    [/^(\d{4}年度\s*)?全日本大学サッカー新人戦北海道大会$/, 'All Japan University Football Rookie Tournament, Hokkaido'],
    [/^(\d{4}年度\s*)?総理大臣杯\s*全日本大学サッカートーナメント北海道大会$/, "Prime Minister's Cup, Hokkaido"],
    [/^‹\s*(.+)に戻る$/, '‹ Back to $1'],
    [/前半\s*(\d+-\d+)/g, '1st half $1'], [/後半\s*(\d+-\d+)/g, '2nd half $1'], [/延長\s*(\d+-\d+)/g, 'ET $1'],
    [/・No\./g, ' · No.'], [/（(\d+)試合）/g, ' ($1 matches)'], [/(\d+)\s*試合/g, '$1 matches'], [/(\d+)\s*人/g, '$1'], [/(\d+)\s*分$/g, "$1'"],
  ];
  // 表の見出しだけの言いかた（順位表：試合 → P、得点 → GF）
  const TH = { '試合': 'P', '得点': 'GF', '失点': 'GA', '勝点': 'Pts', '分': 'D' };
  function tr(t, el) {
    const k = t.trim();
    if (!k || !JP.test(k)) return null;
    if (el && el.closest && el.closest('th') && TH[k]) {
      // 得点：順位表（失点の列がある表）では GF、得点ランキングでは Goals
      if (k === '得点') { const tr0 = el.closest('tr'); return t.replace(k, tr0 && /失点|GA/.test(tr0.textContent) ? 'GF' : 'Goals'); }
      return t.replace(k, TH[k]);
    }
    if (WORDS[k] != null) return t.replace(k, WORDS[k]);
    const sh = teamOf(k); if (sh) return t.replace(k, sh.short);
    const v = MAP.venues[vkey(k)]; if (v) return t.replace(k, v);
    let out = k;
    for (const [re, to] of RULES) out = out.replace(re, to);
    for (const [ja, en] of Object.entries(WORDS).sort((x, y) => y[0].length - x[0].length)) if (ja.length >= 3 && out.includes(ja)) out = out.split(ja).join(en);
    for (const [ja, t] of Object.entries(MAP.teams)) if (ja.length >= 2 && JP.test(ja) && out.includes(ja)) out = out.split(ja).join(t.short);
    out = out.replace(/・/g, ', ');
    return out !== k ? t.replace(k, out) : null;
  }
  function translate(root) {
    if (!EN || !root) return;
    const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const list = [];
    let n;
    while ((n = w.nextNode())) { if (!n.parentElement || n.parentElement.closest('script,style,.nolang')) continue; list.push(n); }
    for (const x of list) { const v = tr(x.nodeValue, x.parentElement); if (v != null && v !== x.nodeValue) x.nodeValue = v; }
    root.querySelectorAll && root.querySelectorAll('[title],[aria-label],[placeholder]').forEach((e) => ['title', 'aria-label', 'placeholder'].forEach((a) => { const v0 = e.getAttribute(a); const v = v0 && tr(v0); if (v != null) e.setAttribute(a, v); }));
  }
  let busy = false;
  function start() {
    // 切りかえのボタン（ページの上・大会名の上）
    const ph = document.querySelector('.pagehead') || document.body;
    const b = document.createElement('a');
    b.href = '#'; b.className = 'langbtn nolang'; b.setAttribute('role', 'button');
    b.textContent = EN ? '日本語' : 'English';
    b.setAttribute('aria-label', EN ? '日本語で見る' : 'View in English');
    b.onclick = (e) => { e.preventDefault(); try { localStorage.setItem(KEY, EN ? 'ja' : 'en'); } catch (_) {} const u = new URL(location.href); u.searchParams.set('lang', EN ? 'ja' : 'en'); location.href = u.toString(); };
    ph.insertBefore(b, ph.firstChild);
    if (!EN) return;
    document.documentElement.lang = 'en';
    translate(document.body);
    new MutationObserver(() => { if (busy) return; busy = true; requestAnimationFrame(() => { translate(document.body); if (document.title && JP.test(document.title)) document.title = (tr(document.title) || document.title); busy = false; }); })
      .observe(document.body, { childList: true, subtree: true, characterData: true });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
  window.jufaEN = { on: EN, ready, data, translate, player, venue, round };
})();
