#!/usr/bin/env node
'use strict';

const fs = require('fs');
const https = require('https');
const yaml = require('js-yaml');

const configPath = process.env.SHEETS_CONFIG || 'sheets.yml';
const config = yaml.load(fs.readFileSync(configPath, 'utf8'));

fs.mkdirSync('.csv-cache', { recursive: true });

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, res => {
      if (res.statusCode === 301 || res.statusCode === 302 || res.statusCode === 307 || res.statusCode === 308) {
        file.close();
        fs.unlinkSync(dest);
        return download(res.headers.location, dest).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        file.close();
        fs.unlinkSync(dest);
        return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
      }
      res.pipe(file);
      file.on('finish', () => { file.close(); resolve(); });
    }).on('error', err => {
      file.close();
      fs.unlinkSync(dest);
      reject(err);
    });
  });
}

(async () => {
  let hasError = false;
  for (const sheet of config.sheets) {
    const url = process.env[sheet.secret];
    if (!url) {
      console.error(`[ERROR] Missing env var: ${sheet.secret}`);
      hasError = true;
      continue;
    }
    const dest = `.csv-cache/${sheet.name}.csv`;
    try {
      process.stdout.write(`[...] Downloading ${sheet.name}...`);
      await download(url, dest);
      process.stdout.write(` done\n`);
      console.log(`[OK] ${dest}`);
    } catch (err) {
      console.error(`[ERROR] Failed to download ${sheet.name}: ${err.message}`);
      hasError = true;
    }
  }
  process.exit(hasError ? 1 : 0);
})();
