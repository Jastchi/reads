#!/usr/bin/env node
import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const ROOT = path.join(__dirname, '..');
const PDFS_DIR = path.join(ROOT, 'src/notes/pdfs');
const NOTES_DIR = path.join(ROOT, 'src/notes');
const CREDS_FILE = path.join(ROOT, 'credentials.json');

function getAuth() {
  const scopes = ['https://www.googleapis.com/auth/drive.readonly'];
  if (fs.existsSync(CREDS_FILE)) {
    return new google.auth.GoogleAuth({ keyFile: CREDS_FILE, scopes });
  }
  return new google.auth.GoogleAuth({ scopes });
}

function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};
  const lines = match[1].split('\n');
  const result = {};
  let currentKey = null;
  for (const line of lines) {
    if (line.startsWith('  - ')) {
      if (currentKey) {
        if (!Array.isArray(result[currentKey])) result[currentKey] = [];
        result[currentKey].push(line.slice(4).trim());
      }
    } else {
      const colonIdx = line.indexOf(':');
      if (colonIdx === -1) continue;
      const key = line.slice(0, colonIdx).trim();
      const val = line.slice(colonIdx + 1).trim().replace(/^"(.*)"$/, '$1');
      currentKey = null;
      if (val === '') { currentKey = key; result[key] = []; }
      else if (val === 'true') result[key] = true;
      else if (val === 'false') result[key] = false;
      else result[key] = val;
    }
  }
  return result;
}

async function downloadFile(drive, fileId, dest) {
  const res = await drive.files.get({ fileId, alt: 'media' }, { responseType: 'stream' });
  return new Promise((resolve, reject) => {
    const writer = fs.createWriteStream(dest);
    res.data.pipe(writer);
    writer.on('finish', resolve);
    writer.on('error', reject);
  });
}

async function main() {
  const auth = getAuth();
  const drive = google.drive({ version: 'v3', auth });

  fs.mkdirSync(PDFS_DIR, { recursive: true });

  const mdFiles = fs.readdirSync(NOTES_DIR).filter(f => f.endsWith('.md'));
  const allData = mdFiles.map(f => parseFrontmatter(fs.readFileSync(path.join(NOTES_DIR, f), 'utf8')));

  // Map pdf path → driveId from individual stubs and grouped posts
  const pdfToDriverId = new Map();
  for (const data of allData) {
    if (data.driveId && data.pdf) pdfToDriverId.set(data.pdf, data.driveId);
    if (Array.isArray(data.pdfs) && Array.isArray(data.driveIds)) {
      data.pdfs.forEach((p, i) => { if (data.driveIds[i]) pdfToDriverId.set(p, data.driveIds[i]); });
    }
  }

  // Collect all PDF paths needed by published notes
  const neededPdfs = new Set();
  for (const data of allData) {
    if (data.published !== true) continue;
    if (data.pdf) neededPdfs.add(data.pdf);
    if (Array.isArray(data.pdfs)) data.pdfs.forEach(p => neededPdfs.add(p));
  }

  let count = 0;
  for (const pdfPath of neededPdfs) {
    const pdfName = path.basename(pdfPath);
    const pdfDest = path.join(PDFS_DIR, pdfName);

    if (fs.existsSync(pdfDest)) {
      console.log(`Skipping (exists): ${pdfName}`);
      continue;
    }

    const driveId = pdfToDriverId.get(pdfPath);
    if (!driveId) {
      console.warn(`No driveId found for: ${pdfPath} — skipping`);
      continue;
    }

    process.stdout.write(`Downloading: ${pdfName} ... `);
    await downloadFile(drive, driveId, pdfDest);
    console.log('done');
    count++;
  }

  if (!count) console.log('Nothing new to download.');
}

main().catch(err => {
  console.error(err.message);
  process.exit(1);
});
