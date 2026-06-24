#!/usr/bin/env node
'use strict';

const fs = require('fs');
const yaml = require('js-yaml');

const configPath = process.env.SHEETS_CONFIG || 'sheets.yml';
const config = yaml.load(fs.readFileSync(configPath, 'utf8'));

function parseCSV(text) {
  // Normalise line endings, then parse character-by-character so that
  // newlines inside quoted cells are handled correctly.
  const input = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const rows = [];
  let fields = [];
  let current = '';
  let inQuotes = false;
  let i = 0;

  while (i < input.length) {
    const ch = input[i];
    if (inQuotes) {
      if (ch === '"') {
        // RFC 4180: "" inside a quoted field is an escaped quote
        if (input[i + 1] === '"') { current += '"'; i += 2; continue; }
        inQuotes = false;
      } else {
        current += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ',') {
        fields.push(current.trim());
        current = '';
      } else if (ch === '\n') {
        fields.push(current.trim());
        current = '';
        if (fields.some(f => f !== '')) rows.push(fields);
        fields = [];
        i++;
        continue;
      } else {
        current += ch;
      }
    }
    i++;
  }
  // Last field / row
  fields.push(current.trim());
  if (fields.some(f => f !== '')) rows.push(fields);

  if (rows.length === 0) return [];
  const headers = rows[0];
  return rows.slice(1).map(row => {
    const obj = {};
    headers.forEach((h, idx) => { obj[h] = row[idx] || ''; });
    return obj;
  }).filter(obj => Object.values(obj).some(v => v !== ''));
}

function escapeYaml(str) {
  return String(str).replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

// Emit a YAML value: block literal for multi-line, quoted string otherwise.
function yamlValue(str, indent) {
  const s = String(str);
  if (s.includes('\n')) {
    const pad = ' '.repeat(indent);
    return '|\n' + s.split('\n').map(l => pad + l).join('\n');
  }
  return `"${escapeYaml(s)}"`;
}

let hasError = false;

for (const sheet of config.sheets) {
  const csvPath = `.csv-cache/${sheet.name}.csv`;
  if (!fs.existsSync(csvPath)) {
    console.warn(`[SKIP] ${sheet.name} — CSV not found at ${csvPath}`);
    continue;
  }

  let rows;
  try {
    rows = parseCSV(fs.readFileSync(csvPath, 'utf8'));
  } catch (err) {
    console.error(`[ERROR] Failed to parse ${csvPath}: ${err.message}`);
    hasError = true;
    continue;
  }

  if (sheet.sort_by) {
    rows.sort((a, b) => (a[sheet.sort_by] || '').localeCompare(b[sheet.sort_by] || ''));
  }

  const groupKeys = sheet.group_by || ['lang'];
  const groups = {};
  for (const row of rows) {
    const key = groupKeys.map(k => row[k] || 'all').join('_');
    if (!groups[key]) groups[key] = [];
    groups[key].push(row);
  }

  let yamlOut = '';
  if (sheet.key_value) {
    const [keyCol, valCol] = sheet.key_value;
    for (const [groupKey, items] of Object.entries(groups)) {
      yamlOut += `${groupKey}:\n`;
      for (const item of items) {
        yamlOut += `  ${escapeYaml(item[keyCol])}: ${yamlValue(item[valCol], 4)}\n`;
      }
    }
  } else {
    for (const [key, items] of Object.entries(groups)) {
      yamlOut += `${key}:\n`;
      for (const item of items) {
        const keys = Object.keys(item).filter(k => !groupKeys.includes(k));
        yamlOut += `  -\n`;
        for (const k of keys) {
          yamlOut += `    ${k}: ${yamlValue(item[k], 6)}\n`;
        }
      }
    }
  }

  const outPath = `_data/${sheet.name}.yml`;
  fs.writeFileSync(outPath, yamlOut);
  console.log(`[OK] Generated ${outPath} (${rows.length} rows, ${Object.keys(groups).length} groups)`);
}

if (hasError) process.exit(1);
