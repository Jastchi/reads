#!/usr/bin/env node
import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Google Cloud project: jaschi
const FOLDER_ID = '121qDvrFVx1w4wFC91PKGQn_2oT4x0sOK';
const ROOT = path.join(__dirname, '..');
const NOTES_DIR = path.join(ROOT, 'src/notes');
const CREDS_FILE = path.join(ROOT, 'credentials.json');

function slugify(name) {
  return name
    .replace(/\.pdf$/i, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function getAuth() {
  const scopes = ['https://www.googleapis.com/auth/drive.readonly'];
  if (fs.existsSync(CREDS_FILE)) {
    return new google.auth.GoogleAuth({ keyFile: CREDS_FILE, scopes });
  }
  return new google.auth.GoogleAuth({ scopes });
}

async function listAll(drive, query, fields) {
  const results = [];
  let pageToken;
  do {
    const res = await drive.files.list({ q: query, fields: `nextPageToken,${fields}`, pageSize: 1000, pageToken });
    results.push(...res.data.files);
    pageToken = res.data.nextPageToken;
  } while (pageToken);
  return results;
}

async function listAllPdfs(drive, folderId, folderPath = '/') {
  console.log(`  Scanning ${folderPath}`);
  const results = [];

  const pdfs = await listAll(drive,
    `'${folderId}' in parents and mimeType='application/pdf' and trashed=false`,
    'files(id, name, createdTime)');
  results.push(...pdfs);

  const subfolders = await listAll(drive,
    `'${folderId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
    'files(id, name)');
  for (const subfolder of subfolders) {
    results.push(...await listAllPdfs(drive, subfolder.id, `${folderPath}${subfolder.name}/`));
  }

  return results;
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

function indexExistingStubs() {
  const byDriveId = new Map();
  for (const f of fs.readdirSync(NOTES_DIR).filter(f => f.endsWith('.md'))) {
    const data = parseFrontmatter(fs.readFileSync(path.join(NOTES_DIR, f), 'utf8'));
    if (data.driveId) byDriveId.set(data.driveId, f);
    if (Array.isArray(data.driveIds)) {
      for (const id of data.driveIds) byDriveId.set(id, f);
    }
  }
  return byDriveId;
}

async function main() {
  const auth = getAuth();
  const drive = google.drive({ version: 'v3', auth });

  const files = await listAllPdfs(drive, FOLDER_ID);
  console.log(`Found ${files.length} PDF(s) total.\n`);
  if (!files.length) return;

  const existingStubs = indexExistingStubs();
  const driveIds = new Set(files.map(f => f.id));

  // Remove stubs whose driveId is no longer in Drive
  for (const [driveId, filename] of existingStubs) {
    if (!driveIds.has(driveId)) {
      fs.unlinkSync(path.join(NOTES_DIR, filename));
      console.log(`Deleted orphaned stub: ${filename}`);
    }
  }

  // Create stubs for new Drive files
  for (const file of files) {
    if (existingStubs.has(file.id)) {
      console.log(`Skipping (exists): ${existingStubs.get(file.id)}`);
      continue;
    }

    const slug = slugify(file.name);
    const pdfName = `${slug}.pdf`;
    const date = file.createdTime.split('T')[0];
    const mdName = `${date}-${slug}.md`;
    const mdPath = path.join(NOTES_DIR, mdName);

    const title = file.name.replace(/\.pdf$/i, '');
    const stub = [
      '---',
      `title: "${title}"`,
      `date: ${date}`,
      `pdf: /notes/pdfs/${pdfName}`,
      `driveId: ${file.id}`,
      `published: false`,
      '---',
      '',
    ].join('\n');
    fs.writeFileSync(mdPath, stub);
    console.log(`Created stub: ${mdName}`);
  }
}

main().catch(err => {
  console.error(err.message);
  process.exit(1);
});
