import zlib from 'zlib';
import path from "path";
import { promises as fs } from 'fs';
import { createHash } from 'crypto';
import { makeHash } from './makeHash.js';
export async function makeTree(currDir = '.'): Promise<string> {
    let hash: string;
    const files = await fs.readdir(currDir, { withFileTypes: true });
    
    const fileIgn = await fs.readFile(path.join('.','col_ignore'),'utf-8');
    // console.log(fileIgn);
    let ignoreSet = new Set(fileIgn .split('\n') .map(line => line.trim()));


    const entrieBuff: Buffer[] = [];
    for (let f of files) {
        if (ignoreSet.has(f.name)) continue;
        // console.log(f.name);
        const fullpath = path.join(currDir, f.name);
        // console.log(fullpath)

        if (f.isFile()) {
            const blobsha = await makeHash(fullpath);
            const mode = '100644';
            const entry = Buffer.concat([
                Buffer.from(`${mode} ${f.name}\0`),
                Buffer.from(blobsha, 'hex'),
            ]);
            // console.log(Buffer.from(blobsha,'hex'));
            entrieBuff.push(entry);
        } else if (f.isDirectory()) {
            const treeSha = await makeTree(fullpath);
            const mode = '40000';
            const entry = Buffer.concat([
                Buffer.from(`${mode} ${f.name}\0`),
                Buffer.from(treeSha, 'hex'),
            ]);
            entrieBuff.push(entry);
        }
    }

    const body = Buffer.concat(entrieBuff);
    const header = Buffer.from(`tree ${body.length}\0`);
    const store = Buffer.concat([Buffer.from(header), body]);

    hash = createHash('sha1').update(store).digest('hex');
    const dir = path.join('.col', 'objects', hash.slice(0, 2));
    const file = path.join(dir, hash.slice(2));

    try {
        await fs.access(file);
    } catch (err) {
        await fs.mkdir(dir, { recursive: true });
        await fs.writeFile(file, zlib.deflateSync(store));
    }
    console.log(`Tree ${currDir} -> ${hash}`);
    //only the finaly returned has is root hash other are hashed of dir's inside the root
    // console.log("Root Dir Hash -> ",hash)
    return hash;
}
// makeTree('.')