#!/usr/bin/env node

import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { parse } from 'csv-parse/sync';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DATA_FILE = join(__dirname, '../data/press-releases.json');

/**
 * CSVファイルからプレスリリースを一括インポート
 * CSV形式: url,title,date,category,tags,summary
 * Usage: node scripts/import-from-csv.js <csvファイル>
 */

async function importFromCSV(csvPath) {
  console.log(`📂 CSVファイルを読み込んでいます: ${csvPath}`);

  const csvContent = await fs.readFile(csvPath, 'utf-8');
  const records = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    relax_quotes: true,
    relax_column_count: true,
    escape: '\\'
  });

  console.log(`📊 ${records.length}件のレコードを検出しました`);

  // データファイルを読み込み
  const dataContent = await fs.readFile(DATA_FILE, 'utf-8');
  const data = JSON.parse(dataContent);

  let added = 0;
  let skipped = 0;

  for (const record of records) {
    const { url, title, date, category, tags, summary } = record;

    // URLの重複チェック
    const exists = data.releases.some(r => r.url === url);
    if (exists) {
      console.log(`⊘ スキップ (重複): ${url}`);
      skipped++;
      continue;
    }

    // URLから情報を推測
    let source = 'other';
    let number = '';

    if (url.includes('prtimes.jp')) {
      source = 'prtimes';
      const match = url.match(/\/p\/(\d+)\./);
      if (match) number = match[1];
    } else if (url.includes('atpress.ne.jp')) {
      source = 'atpress';
      const match = url.match(/\/news\/(\d+)/);
      if (match) number = match[1];
    }

    // IDを自動生成
    const maxId = data.releases.length > 0
      ? Math.max(...data.releases.map(r => r.id))
      : 0;

    const newRelease = {
      id: maxId + 1,
      number,
      title: title || '',
      date: date || '',
      source,
      url,
      category: category || '',
      tags: tags ? tags.split(';').map(t => t.trim()) : [],
      summary: summary || '',
      status: (title && date) ? 'complete' : 'pending_data_entry',
      added_at: new Date().toISOString()
    };

    data.releases.push(newRelease);
    console.log(`✓ 追加: ${url}`);
    added++;
  }

  // 保存
  data.metadata.total_count = data.releases.length;
  data.metadata.last_updated = new Date().toISOString().split('T')[0];
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');

  console.log('');
  console.log('=== インポート完了 ===');
  console.log(`✓ 追加: ${added}件`);
  console.log(`⊘ スキップ: ${skipped}件`);
  console.log(`📊 合計: ${data.releases.length}件`);
}

// 実行
if (process.argv.length < 3) {
  console.log('使い方:');
  console.log('  node scripts/import-from-csv.js <csvファイル>');
  console.log('');
  console.log('CSV形式:');
  console.log('  url,title,date,category,tags,summary');
  console.log('');
  console.log('例:');
  console.log('  node scripts/import-from-csv.js data/press-releases-import.csv');
  process.exit(1);
}

const csvPath = process.argv[2];
await importFromCSV(csvPath);
