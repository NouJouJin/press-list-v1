#!/usr/bin/env node

import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createObjectCsvWriter } from 'csv-writer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DATA_FILE = join(__dirname, '../data/press-releases.json');
const EXPORT_DIR = join(__dirname, '../exports');

/**
 * プレスリリースデータを各種形式でエクスポート
 * Usage: node scripts/export.js [format]
 * Formats: json, csv, markdown, ai-training (default: all)
 */

async function loadData() {
  const content = await fs.readFile(DATA_FILE, 'utf-8');
  return JSON.parse(content);
}

async function ensureExportDir() {
  try {
    await fs.mkdir(EXPORT_DIR, { recursive: true });
  } catch (err) {
    // Directory already exists
  }
}

async function exportJSON(data) {
  const outputPath = join(EXPORT_DIR, 'press-releases.json');
  await fs.writeFile(outputPath, JSON.stringify(data, null, 2), 'utf-8');
  console.log(`✓ JSON エクスポート: ${outputPath}`);
}

async function exportCSV(data) {
  const outputPath = join(EXPORT_DIR, 'press-releases.csv');

  const csvWriter = createObjectCsvWriter({
    path: outputPath,
    header: [
      { id: 'id', title: 'ID' },
      { id: 'number', title: 'Number' },
      { id: 'title', title: 'Title' },
      { id: 'date', title: 'Date' },
      { id: 'source', title: 'Source' },
      { id: 'url', title: 'URL' },
      { id: 'category', title: 'Category' },
      { id: 'tags', title: 'Tags' },
      { id: 'summary', title: 'Summary' },
      { id: 'status', title: 'Status' }
    ]
  });

  const records = data.releases.map(r => ({
    ...r,
    tags: Array.isArray(r.tags) ? r.tags.join(';') : r.tags
  }));

  await csvWriter.writeRecords(records);
  console.log(`✓ CSV エクスポート: ${outputPath}`);
}

async function exportMarkdown(data) {
  const outputPath = join(EXPORT_DIR, 'press-releases.md');

  let markdown = `# ${data.company.name} プレスリリース一覧\n\n`;
  markdown += `最終更新: ${data.metadata.last_updated}\n`;
  markdown += `総数: ${data.metadata.total_count}件\n\n`;

  markdown += `## ソース\n\n`;
  markdown += `- PR TIMES: ${data.sources.prtimes.url}\n`;
  markdown += `- @Press: ${data.sources.atpress.url}\n\n`;

  markdown += `---\n\n`;
  markdown += `## プレスリリース一覧\n\n`;

  // 日付順にソート
  const sorted = [...data.releases].sort((a, b) => {
    if (!a.date) return 1;
    if (!b.date) return -1;
    return b.date.localeCompare(a.date);
  });

  for (const release of sorted) {
    markdown += `### ${release.title || '(タイトル未設定)'}\n\n`;
    markdown += `- **日付**: ${release.date || 'N/A'}\n`;
    markdown += `- **ソース**: ${release.source}\n`;
    markdown += `- **URL**: [${release.url}](${release.url})\n`;
    if (release.category) {
      markdown += `- **カテゴリ**: ${release.category}\n`;
    }
    if (release.tags && release.tags.length > 0) {
      markdown += `- **タグ**: ${release.tags.join(', ')}\n`;
    }
    if (release.summary) {
      markdown += `\n${release.summary}\n`;
    }
    markdown += `\n---\n\n`;
  }

  await fs.writeFile(outputPath, markdown, 'utf-8');
  console.log(`✓ Markdown エクスポート: ${outputPath}`);
}

async function exportAITraining(data) {
  const outputPath = join(EXPORT_DIR, 'ai-training-data.jsonl');

  // JSONL形式 (1行に1つのJSONオブジェクト)
  const lines = data.releases
    .filter(r => r.status === 'complete' && r.title && r.summary)
    .map(r => {
      const trainingData = {
        text: `タイトル: ${r.title}\n日付: ${r.date}\nカテゴリ: ${r.category}\n内容: ${r.summary}`,
        metadata: {
          url: r.url,
          source: r.source,
          date: r.date,
          category: r.category,
          tags: r.tags
        }
      };
      return JSON.stringify(trainingData);
    });

  await fs.writeFile(outputPath, lines.join('\n'), 'utf-8');
  console.log(`✓ AI学習用データ エクスポート: ${outputPath}`);
  console.log(`  (完全なデータ: ${lines.length}件)`);

  // プロンプト用テキストも生成
  const promptPath = join(EXPORT_DIR, 'ai-training-prompt.txt');
  let promptText = `農情人株式会社のプレスリリース情報\n\n`;
  promptText += `この企業は以下のプレスリリースを発表しています：\n\n`;

  const complete = data.releases.filter(r => r.status === 'complete');
  for (const release of complete) {
    promptText += `【${release.date}】${release.title}\n`;
    promptText += `${release.summary}\n`;
    promptText += `詳細: ${release.url}\n\n`;
  }

  await fs.writeFile(promptPath, promptText, 'utf-8');
  console.log(`✓ AIプロンプト用テキスト: ${promptPath}`);
}

async function exportAll(data) {
  await ensureExportDir();
  await exportJSON(data);
  await exportCSV(data);
  await exportMarkdown(data);
  await exportAITraining(data);
}

// 実行
const format = process.argv[2] || 'all';
const data = await loadData();

console.log(`📤 プレスリリースをエクスポートしています...\n`);

switch (format) {
  case 'json':
    await ensureExportDir();
    await exportJSON(data);
    break;
  case 'csv':
    await ensureExportDir();
    await exportCSV(data);
    break;
  case 'markdown':
  case 'md':
    await ensureExportDir();
    await exportMarkdown(data);
    break;
  case 'ai':
  case 'ai-training':
    await ensureExportDir();
    await exportAITraining(data);
    break;
  case 'all':
  default:
    await exportAll(data);
    break;
}

console.log('\n✓ エクスポート完了');
