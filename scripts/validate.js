#!/usr/bin/env node

import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DATA_FILE = join(__dirname, '../data/press-releases.json');

/**
 * データの整合性をチェック
 */

async function validate() {
  console.log('🔍 データを検証しています...\n');

  const content = await fs.readFile(DATA_FILE, 'utf-8');
  const data = JSON.parse(content);

  let errors = 0;
  let warnings = 0;

  // 基本構造チェック
  if (!data.company) {
    console.error('❌ エラー: company情報がありません');
    errors++;
  }

  if (!data.releases || !Array.isArray(data.releases)) {
    console.error('❌ エラー: releases配列がありません');
    errors++;
    return;
  }

  console.log(`📊 総件数: ${data.releases.length}件\n`);

  // 重複チェック
  const urlSet = new Set();
  const idSet = new Set();

  for (const [index, release] of data.releases.entries()) {
    const position = index + 1;

    // ID重複チェック
    if (idSet.has(release.id)) {
      console.error(`❌ エラー [${position}]: IDが重複しています (ID: ${release.id})`);
      errors++;
    }
    idSet.add(release.id);

    // URL重複チェック
    if (urlSet.has(release.url)) {
      console.error(`❌ エラー [${position}]: URLが重複しています (${release.url})`);
      errors++;
    }
    urlSet.add(release.url);

    // 必須フィールドチェック
    if (!release.url) {
      console.error(`❌ エラー [${position}]: URLがありません (ID: ${release.id})`);
      errors++;
    }

    // 推奨フィールドチェック
    if (!release.title) {
      console.warn(`⚠️  警告 [${position}]: タイトルがありません (${release.url})`);
      warnings++;
    }

    if (!release.date) {
      console.warn(`⚠️  警告 [${position}]: 日付がありません (${release.url})`);
      warnings++;
    }

    // 日付フォーマットチェック
    if (release.date && !/^\d{4}-\d{2}-\d{2}$/.test(release.date)) {
      console.warn(`⚠️  警告 [${position}]: 日付フォーマットが不正です (${release.date})`);
      warnings++;
    }

    // URLフォーマットチェック
    if (release.url && !release.url.startsWith('http')) {
      console.error(`❌ エラー [${position}]: URLが不正です (${release.url})`);
      errors++;
    }
  }

  // 統計情報
  const complete = data.releases.filter(r => r.status === 'complete').length;
  const pending = data.releases.filter(r => r.status === 'pending_data_entry').length;

  console.log('\n=== 統計 ===');
  console.log(`完全なデータ: ${complete}件`);
  console.log(`データ入力待ち: ${pending}件`);

  const sources = {};
  for (const release of data.releases) {
    sources[release.source] = (sources[release.source] || 0) + 1;
  }

  console.log('\nソース別:');
  for (const [source, count] of Object.entries(sources)) {
    console.log(`  ${source}: ${count}件`);
  }

  // 結果サマリー
  console.log('\n=== 検証結果 ===');
  if (errors === 0 && warnings === 0) {
    console.log('✓ 問題は見つかりませんでした');
  } else {
    if (errors > 0) {
      console.error(`❌ エラー: ${errors}件`);
    }
    if (warnings > 0) {
      console.warn(`⚠️  警告: ${warnings}件`);
    }
  }

  return errors === 0;
}

const isValid = await validate();
process.exit(isValid ? 0 : 1);
