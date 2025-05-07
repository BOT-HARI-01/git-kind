// import zlib from 'zlib';
// const buf1: Buffer = Buffer.from([1,2,3]);
// const buf2: Buffer = Buffer.from('helo','utf-8');
// const head = 'ahsdfha';
// const data = 'sklajkdbfadfbadsjkfhahdfla';
// // const buf3: Buffer = Buffer.concat([Buffer.from(head),data])
// const compresseddata = zlib.deflateSync(buf2);
// const dedata = zlib.inflateSync(compresseddata);
// console.log(buf1);
// console.log(buf2);
// console.log(compresseddata);
// console.log(dedata);

import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';
import zlib from 'zlib';

async function hashBlob(filePath: string): Promise<string> {
  const content = await fs.readFile(filePath);
  const header = `blob ${content.length}\0`;
  const store = Buffer.concat([Buffer.from(header), content]);

  const sha = crypto.createHash('sha1').update(store).digest('hex');
  const dir = path.join('.git', 'objects', sha.slice(0, 2));
  const file = path.join(dir, sha.slice(2));

  try {
    await fs.access(file);
  } catch {
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(file, zlib.deflateSync(store));
  }

  return sha;
}

async function writeTree(currentDir = '.'): Promise<string> {
  const files = await fs.readdir(currentDir, { withFileTypes: true });
  const entries: Buffer[] = [];

  for (const file of files) {
    if (file.name === '.git') continue;

    const fullPath = path.join(currentDir, file.name);
    const relativePath = path.relative('.', fullPath);

    if (file.isFile()) {
      const blobSha = await hashBlob(fullPath);
      const mode = '100644';
      const entry = Buffer.concat([
        Buffer.from(`${mode} ${file.name}\0`),
        Buffer.from(blobSha, 'hex'),
      ]);
      entries.push(entry);
    } else if (file.isDirectory()) {
      const treeSha = await writeTree(fullPath); // RECURSION
      const mode = '40000'; // mode for tree
      const entry = Buffer.concat([
        Buffer.from(`${mode} ${file.name}\0`),
        Buffer.from(treeSha, 'hex'),
      ]);
      entries.push(entry);
    }
  }

  const body = Buffer.concat(entries);
  const header = Buffer.from(`tree ${body.length}\0`);
  const full = Buffer.concat([header, body]);

  const sha = crypto.createHash('sha1').update(full).digest('hex');
  const dir = path.join('.git', 'objects', sha.slice(0, 2));
  const file = path.join(dir, sha.slice(2));

  try {
    await fs.access(file);
  } catch {
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(file, zlib.deflateSync(full));
  }

  console.log(`[Tree] ${currentDir} → ${sha}`);
  return sha;
}


  writeTree();
