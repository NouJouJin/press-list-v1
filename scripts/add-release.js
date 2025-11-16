#!/usr/bin/env node

import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DATA_FILE = join(__dirname, '../data/press-releases.json');

/**
 * プレスリリースを追加するスクリプト
 * Usage: node scripts/add-release.js
 * または対話形式で実行
 */

async function loadData() {
  const content = await fs.readFile(DATA_FILE, 'utf-8');
  return JSON.parse(content);
}

async function saveData(data) {
  data.metadata.last_updated = new Date().toISOString().split('T')[0];
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

async function addRelease(releaseData) {
  const data = await loadData();

  // IDを自動生成
  const maxId = data.releases.length > 0
    ? Math.max(...data.releases.map(r => r.id))
    : 0;

  const newRelease = {
    id: maxId + 1,
    ...releaseData,
    added_at: new Date().toISOString()
  };

  data.releases.push(newRelease);
  data.metadata.total_count = data.releases.length;

  await saveData(data);

  console.log(`✓ プレスリリースを追加しました (ID: ${newRelease.id})`);
  console.log(JSON.stringify(newRelease, null, 2));

  return newRelease;
}

// コマンドライン引数から追加
if (process.argv.length > 2) {
  const url = process.argv[2];
  const title = process.argv[3] || '';
  const date = process.argv[4] || '';

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

  await addRelease({
    number,
    title,
    date,
    source,
    url,
    category: '',
    tags: [],
    summary: '',
    status: 'pending_data_entry'
  });
} else {
  console.log('使い方:');
  console.log('  node scripts/add-release.js <URL> [タイトル] [日付]');
  console.log('');
  console.log('例:');
  console.log('  node scripts/add-release.js "https://prtimes.jp/main/html/rd/p/000000076.000087046.html" "タイトル" "2025-01-15"');
  console.log('');
  console.log('または import-from-csv.js を使用してCSVから一括インポートしてください');
}

export { addRelease };
