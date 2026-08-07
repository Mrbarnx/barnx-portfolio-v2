import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const root = process.cwd();
const dir = path.join(root, '.barnx-v2');
const chunks = fs.readdirSync(dir)
  .filter((name) => /^chunk-\d+\.txt$/.test(name))
  .sort((a,b) => Number(a.match(/\d+/)?.[0]) - Number(b.match(/\d+/)?.[0]));

if (!chunks.length) throw new Error('Barnx source payload is missing.');

const encoded = chunks.map((name) => fs.readFileSync(path.join(dir,name),'utf8').trim()).join('');
const decoded = zlib.gunzipSync(Buffer.from(encoded,'base64')).toString('utf8');
const files = JSON.parse(decoded);

for (const [relative, content] of Object.entries(files)) {
  const target = path.join(root, relative);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, content, 'utf8');
}

console.log(`Barnx V2 source ready: ${Object.keys(files).length} generated files.`);
