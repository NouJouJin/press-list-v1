# 農情人プレスリリース管理システム

農情人株式会社のプレスリリースを網羅的に管理・整理するためのシステムです。AI学習用データの準備や、定期的なアップデートを簡単に行えます。

## 📋 目次

- [特徴](#特徴)
- [セットアップ](#セットアップ)
- [使い方](#使い方)
- [データ構造](#データ構造)
- [スクリプト](#スクリプト)
- [エクスポート形式](#エクスポート形式)
- [定期更新の方法](#定期更新の方法)

## 🎯 特徴

- **網羅的な管理**: PR TIMES、@Pressなど複数ソースのプレスリリースを一元管理
- **AI学習対応**: JSONL形式など、AI学習に適した形式でエクスポート可能
- **簡単な更新**: CSVファイルから一括インポート、または1件ずつ追加
- **データ検証**: 重複チェックや必須項目の検証機能
- **多様なエクスポート**: JSON, CSV, Markdown, AI学習用形式に対応
- **統計情報**: ソース別、年別、カテゴリ別などの統計を表示

## 🚀 セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. ディレクトリ構造

```
press-list-v1/
├── data/                           # データファイル
│   ├── press-releases.json        # メインデータファイル
│   └── press-releases-template.csv # CSVテンプレート
├── scripts/                        # 管理スクリプト
│   ├── add-release.js             # 1件追加
│   ├── import-from-csv.js         # CSV一括インポート
│   ├── export.js                  # エクスポート
│   ├── validate.js                # データ検証
│   └── stats.js                   # 統計表示
├── exports/                        # エクスポート出力先
└── README.md                       # このファイル
```

## 📖 使い方

### データの追加方法

#### 方法1: CSVから一括インポート（推奨）

180件のプレスリリースを効率的に登録する場合は、CSVファイルを準備してください。

1. **CSVファイルの準備**

`data/press-releases-template.csv` を参考に、以下の形式でCSVファイルを作成：

```csv
url,title,date,category,tags,summary
https://prtimes.jp/main/html/rd/p/000000076.000087046.html,タイトル,2025-01-15,新製品,農業;AI,概要
```

2. **インポート実行**

```bash
npm run import data/your-file.csv
```

#### 方法2: 1件ずつ追加

```bash
npm run add "https://prtimes.jp/main/html/rd/p/000000076.000087046.html" "タイトル" "2025-01-15"
```

### データの検証

```bash
npm run validate
```

重複チェック、必須項目の確認などを行います。

### 統計情報の確認

```bash
npm run stats
```

ソース別、年別、カテゴリ別などの統計を表示します。

### エクスポート

#### すべての形式でエクスポート

```bash
npm run export
```

#### 特定の形式のみエクスポート

```bash
npm run export json        # JSON形式のみ
npm run export csv         # CSV形式のみ
npm run export markdown    # Markdown形式のみ
npm run export ai-training # AI学習用形式のみ
```

エクスポートファイルは `exports/` ディレクトリに保存されます。

## 📊 データ構造

### プレスリリースオブジェクト

```json
{
  "id": 1,
  "number": "000000076",
  "title": "プレスリリースのタイトル",
  "date": "2025-01-15",
  "source": "prtimes",
  "url": "https://prtimes.jp/main/html/rd/p/000000076.000087046.html",
  "category": "新製品",
  "tags": ["農業", "AI", "テクノロジー"],
  "summary": "プレスリリースの概要",
  "status": "complete",
  "added_at": "2025-11-16T08:00:00.000Z"
}
```

### ステータス

- `complete`: タイトル、日付、概要など必要な情報がすべて入力済み
- `pending_data_entry`: URLのみ登録済み、詳細情報は未入力

### ソース

- `prtimes`: PR TIMES
- `atpress`: @Press
- `other`: その他

## 🛠 スクリプト

### add-release.js

1件のプレスリリースを追加します。

```bash
node scripts/add-release.js <URL> [タイトル] [日付]
```

### import-from-csv.js

CSVファイルから一括でインポートします。重複は自動的にスキップされます。

```bash
node scripts/import-from-csv.js <CSVファイルパス>
```

### export.js

各種形式でエクスポートします。

```bash
node scripts/export.js [format]
# format: json, csv, markdown, ai-training, all (デフォルト)
```

### validate.js

データの整合性をチェックします。

```bash
node scripts/validate.js
```

### stats.js

統計情報を表示します。

```bash
node scripts/stats.js
```

## 📤 エクスポート形式

### 1. JSON (`exports/press-releases.json`)

元のデータ構造そのまま。プログラムからの利用に最適。

### 2. CSV (`exports/press-releases.csv`)

表計算ソフトで編集可能。Excel、Google Sheetsなどで開けます。

### 3. Markdown (`exports/press-releases.md`)

読みやすいドキュメント形式。GitHubやNotionなどで表示可能。

### 4. AI学習用

- **JSONL** (`exports/ai-training-data.jsonl`): 1行1JSONの形式。機械学習に最適。
- **テキスト** (`exports/ai-training-prompt.txt`): プロンプトとして使えるテキスト形式。

```jsonl
{"text":"タイトル: ...\n日付: ...\n内容: ...","metadata":{"url":"...","source":"..."}}
```

## 🔄 定期更新の方法

### 新しいプレスリリースの追加手順

1. **URLリストの準備**

新しいプレスリリースのURLをCSVファイルに追加します。

```csv
url,title,date,category,tags,summary
https://prtimes.jp/main/html/rd/p/000000XXX.000087046.html,新しいリリース,2025-02-01,サービス,農業;IoT,概要
```

2. **インポート**

```bash
npm run import data/new-releases.csv
```

3. **検証**

```bash
npm run validate
```

4. **エクスポート**

```bash
npm run export
```

5. **Gitにコミット**

```bash
git add data/press-releases.json
git commit -m "Update: 新しいプレスリリースを追加"
git push
```

### 自動化のヒント

定期的に更新する場合は、以下のワークフローを推奨します：

1. 週次/月次でPR TIMESと@Pressをチェック
2. 新しいリリースをCSVに追加
3. インポート→検証→エクスポート→コミット
4. AI学習用データを更新

## 📚 プレスリリースソース

### PR TIMES
- 企業ページ: https://prtimes.jp/main/html/searchrlp/company_id/87046
- 個別URL形式: `https://prtimes.jp/main/html/rd/p/000000XXX.000087046.html`

### @Press
- 企業ページ: https://www.atpress.ne.jp/news/company/94892
- 個別URL形式: `https://www.atpress.ne.jp/news/XXXXXX`

## 💡 Tips

### URLだけ先に登録する

詳細情報は後で入力する場合、URLだけ先に登録できます：

```bash
npm run add "https://prtimes.jp/main/html/rd/p/000000076.000087046.html"
```

ステータスは自動的に `pending_data_entry` になります。

### 完了済みデータのみエクスポート

AI学習用エクスポートは、自動的に `status: "complete"` のデータのみを出力します。

### データのバックアップ

`data/press-releases.json` を定期的にバックアップすることをお勧めします。

```bash
cp data/press-releases.json data/press-releases-backup-$(date +%Y%m%d).json
```

## 🤝 貢献

このシステムの改善提案や機能追加のアイデアがあれば、お気軽にお知らせください。

## 📝 ライセンス

MIT

---

**Last Updated**: 2025-11-16
