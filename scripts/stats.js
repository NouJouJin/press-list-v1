#!/usr/bin/env node

import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DATA_FILE = join(__dirname, '../data/press-releases.json');

/**
 * 統計情報を表示
 */

async function showStats() {
  const content = await fs.readFile(DATA_FILE, 'utf-8');
  const data = JSON.parse(content);

  console.log(`\n📊 ${data.company.name} プレスリリース統計\n`);
  console.log('='.repeat(50));

  // 基本統計
  console.log('\n【基本情報】');
  console.log(`総件数: ${data.releases.length}件`);
  console.log(`最終更新: ${data.metadata.last_updated}`);

  // ステータス別
  console.log('\n【ステータス】');
  const statusCount = {};
  for (const release of data.releases) {
    statusCount[release.status] = (statusCount[release.status] || 0) + 1;
  }
  for (const [status, count] of Object.entries(statusCount)) {
    const percentage = ((count / data.releases.length) * 100).toFixed(1);
    console.log(`  ${status}: ${count}件 (${percentage}%)`);
  }

  // ソース別
  console.log('\n【ソース】');
  const sourceCount = {};
  for (const release of data.releases) {
    sourceCount[release.source] = (sourceCount[release.source] || 0) + 1;
  }
  for (const [source, count] of Object.entries(sourceCount)) {
    const percentage = ((count / data.releases.length) * 100).toFixed(1);
    console.log(`  ${source}: ${count}件 (${percentage}%)`);
  }

  // 年別
  console.log('\n【年別】');
  const yearCount = {};
  for (const release of data.releases) {
    if (release.date) {
      const year = release.date.substring(0, 4);
      yearCount[year] = (yearCount[year] || 0) + 1;
    } else {
      yearCount['不明'] = (yearCount['不明'] || 0) + 1;
    }
  }
  const sortedYears = Object.entries(yearCount).sort((a, b) => b[0].localeCompare(a[0]));
  for (const [year, count] of sortedYears) {
    console.log(`  ${year}: ${count}件`);
  }

  // カテゴリ別
  console.log('\n【カテゴリ】');
  const categoryCount = {};
  for (const release of data.releases) {
    const cat = release.category || '未分類';
    categoryCount[cat] = (categoryCount[cat] || 0) + 1;
  }
  const sortedCategories = Object.entries(categoryCount).sort((a, b) => b[1] - a[1]);
  for (const [category, count] of sortedCategories.slice(0, 10)) {
    console.log(`  ${category}: ${count}件`);
  }

  // タグ別
  console.log('\n【よく使われるタグ (上位10)】');
  const tagCount = {};
  for (const release of data.releases) {
    if (release.tags && Array.isArray(release.tags)) {
      for (const tag of release.tags) {
        tagCount[tag] = (tagCount[tag] || 0) + 1;
      }
    }
  }
  const sortedTags = Object.entries(tagCount).sort((a, b) => b[1] - a[1]);
  if (sortedTags.length > 0) {
    for (const [tag, count] of sortedTags.slice(0, 10)) {
      console.log(`  ${tag}: ${count}件`);
    }
  } else {
    console.log('  (タグなし)');
  }

  // 最新・最古
  const withDates = data.releases.filter(r => r.date).sort((a, b) => b.date.localeCompare(a.date));
  if (withDates.length > 0) {
    console.log('\n【期間】');
    console.log(`  最新: ${withDates[0].date} - ${withDates[0].title || '(タイトル未設定)'}`);
    console.log(`  最古: ${withDates[withDates.length - 1].date} - ${withDates[withDates.length - 1].title || '(タイトル未設定)'}`);
  }

  console.log('\n' + '='.repeat(50) + '\n');
}

await showStats();
