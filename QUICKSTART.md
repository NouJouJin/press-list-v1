# クイックスタートガイド

農情人のプレスリリース180件をまとめるための最速手順です。

## 🚀 5分でセットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. CSVファイルの準備

`data/press-releases-import.csv` を作成してください（Excel、Google Sheetsなどで編集可能）：

```csv
url,title,date,category,tags,summary
https://prtimes.jp/main/html/rd/p/000000076.000087046.html,タイトル,2025-01-15,新製品,農業;AI,概要文
https://prtimes.jp/main/html/rd/p/000000075.000087046.html,タイトル2,2025-01-10,サービス,農業;IoT,概要文2
...（180件分）
```

### 3. データのインポート

```bash
npm run import data/press-releases-import.csv
```

### 4. 確認

```bash
npm run stats
npm run validate
```

### 5. AI学習用データの出力

```bash
npm run export
```

→ `exports/` フォルダに以下が生成されます：
- `ai-training-data.jsonl` - AI学習用JSONL形式
- `ai-training-prompt.txt` - プロンプト用テキスト
- `press-releases.json` - 完全なJSON
- `press-releases.csv` - CSV形式
- `press-releases.md` - Markdown文書

## 📝 データ入力のコツ

### 最小限の入力（URLのみ）

まずはURLだけ登録して、詳細は後で追加することもできます：

```csv
url,title,date,category,tags,summary
https://prtimes.jp/main/html/rd/p/000000076.000087046.html,,,,
https://prtimes.jp/main/html/rd/p/000000075.000087046.html,,,,
```

### 完全な入力（推奨）

AI学習に使うなら、タイトル・日付・概要は必須です：

```csv
url,title,date,category,tags,summary
https://prtimes.jp/main/html/rd/p/000000076.000087046.html,新サービス発表,2025-01-15,サービス,農業;AI,農業向けAIサービスを開始
```

## 🔄 180件のデータをまとめる手順

### ステップ1: URLリストの収集

PR TIMESとAtPressから全URLを収集します。

**PR TIMES**
- https://prtimes.jp/main/html/searchrlp/company_id/87046
- ページネーションをたどって全件のURLを取得

**@Press**
- https://www.atpress.ne.jp/news/company/94892
- 全件のURLを取得

### ステップ2: CSVファイル作成

ExcelまたはGoogle Sheetsで作成するのが簡単です：

1. URLをコピペ
2. 各プレスリリースのページを開いてタイトル・日付をコピー
3. 概要を要約（AI学習用に重要）

### ステップ3: インポートと検証

```bash
# インポート
npm run import data/press-releases-import.csv

# 検証（エラーや警告をチェック）
npm run validate

# 統計確認
npm run stats
```

### ステップ4: 定期更新の設定

新しいプレスリリースが出たら：

1. 新しいURLをCSVに追加
2. `npm run import` で追加
3. `npm run export` で最新データを出力
4. Gitにコミット

## 💡 よくある質問

### Q: 180件すべて手入力しなければいけませんか？

A: URLは必須ですが、タイトルや概要は後で追加できます。まずURLだけ登録して、`status: "pending_data_entry"` として管理できます。

### Q: AI学習に必要な情報は？

A: 最低限、`title`（タイトル）と `summary`（概要）があればAI学習用エクスポートに含まれます。日付やカテゴリもあると精度が上がります。

### Q: データを間違えた場合は？

A: `data/press-releases.json` を直接編集するか、CSVを修正して再インポートしてください（重複は自動スキップされます）。

### Q: エクスポートしたデータをどう使う？

A:
- `ai-training-data.jsonl` → 機械学習モデルのファイン��ューニング
- `ai-training-prompt.txt` → ChatGPTやClaudeのプロンプトに貼り付け
- `press-releases.json` → プログラムから利用
- `press-releases.csv` → Excelで分析

## 📞 サポート

問題が発生した場合は、以下を確認してください：

1. `npm run validate` でエラーメッセージを確認
2. `data/press-releases.json` のバックアップを取っていますか？
3. CSVのフォーマットは正しいですか？

---

**これで準備完了です！180件のプレスリリースを効率的にまとめて、AI学習用データとして活用できます。**
