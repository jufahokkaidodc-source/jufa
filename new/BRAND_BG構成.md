# JUFA Hokkaido 共通グラフィック（背景5種類）

ファイル：`new/brand-bg.js`（図形を入れる）・`new/brand-bg.css`（地・質感・色・スマホの置き方）。見本：`new/brand.html`（検索には出さない）。

## 1. 重なりの順（下から）

| 層 | 中身 | どこで作る |
| --- | --- | --- |
| 1 | 黒い地と質感（細かいざらつき・うすい光） | `brand-bg.css` の `.jbg` |
| 2 | 図形（三角・3本線・楕円・板・山並み）。四隅に置く部品の SVG | `brand-bg.js` の `ART` |
| 3 | 大学カラー（図形のアクセントだけ。`--jbg-a`） | `JUFABG.apply` が入れる |
| 4 | 中身（大会名・大学名・選手名・エンブレム・結果） | 各ページの HTML |

背景に文字・エンブレムは入れない。JUFA の公式ロゴは使わない・描き直さない（図形はロゴの要素から考えた別の形）。

## 2. 5種類

| 名前（variant） | 形 | 主な使い道 |
| --- | --- | --- |
| `triangle-ascent` | 四隅から中央へ向かう鋭い三角と斜めの線、うすい大きな三角 | 優勝・大会開幕・大会のメインビジュアル |
| `triple-strike`（標準） | 右下から右上へ走る平行な3本線、左下のグレーの帯 | 全大会共通・クラブ紹介・見出し・シーズンオフ |
| `orbit` | ボールの軌道の大きな楕円（白・グレー・アクセントの弧） | 試合結果・対戦カード・次節案内 |
| `monolith` | 左上の白い角丸の板、右下の白い三角と3本線 | 個人表彰・最終順位・得点ランキング・記録 |
| `north-pulse` | 右上の山並み、上へ向かう筆の線 | 大会トップ・次年度案内・シーズンオフ・連盟紹介 |

## 3. 使い方

HTML だけで入れる：

```html
<section data-jbg="triple-strike" data-color="#86519C" data-color2="#F5F5F5" data-layout="left">…中身…</section>
<script src="./brand-bg.js"></script>
<script>JUFABG.init();</script>
```

JS で入れる（大学の色は、そのページが持っているチーム紹介からそのまま渡す）：

```js
JUFABG.apply(el, Object.assign({variant:'monolith', intensity:'normal', layout:'center'}, JUFABG.fromProfile(profile)));
```

| 項目 | 値 |
| --- | --- |
| `variant` | 上の5種類（ないときは `triple-strike`） |
| `color` / `color2` | 大学カラー（チーム紹介の `color` / `color2`）。ないときは JUFA の赤 |
| `intensity` | `low` / `normal` / `high`（装飾の強さ） |
| `layout` | `center`（中身がまん中）/ `left`（中身が左寄せ：左の図形を小さく・うすく、左を暗く） |
| `deco` | `false` で図形を消す（黒い地と質感だけ） |

## 4. 大学カラー

- 色は大学カラーマスター（チーム紹介シートの「チームカラー」「サブカラー」。HPでは `results/data/*-roster.json` の `profile.color` / `color2`）だけを使う。ここに色を書かない
- 変わるのは図形のアクセントだけ。黒い地・白い文字・白い飾りはそのまま
- 黒に近い色は白いふち、白に近い色はグレーのふちを付けて見えるようにする（色そのものは変えない）

## 5. 使っている場所（2026-11 限定導入）

| 場所 | 種類 | 色 |
| --- | --- | --- |
| 大会記録（results.html）の上の見出し | `triangle-ascent`・左寄せ | JUFA |
| クラブ紹介（team.html）の上 | `triple-strike`・左寄せ | そのチームの色 |
| トップのスライド：個人表彰（MVP・優秀選手・新人賞・ポジション別） | `monolith` | 受賞した大学が1つならその色、ばらばらなら JUFA |

## 6. ほかの場所に広げるとき

1. ページの `<head>` で `brand-bg.css`、本文の前に `brand-bg.js` を読む
2. 背景にしたい箱に `JUFABG.apply` を1行（または `data-jbg` を付けて `JUFABG.init()`）
3. 中身が左寄せなら `layout:'left'`
