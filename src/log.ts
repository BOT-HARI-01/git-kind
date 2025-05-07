import zlib from "zlib";
import path from "path";
import { promises as fs } from 'fs';

async function readCommit(hash: string): Promise<{ body: string, parent?: string }> {
    const dir = path.join('.col', 'objects', hash.slice(0, 2));
    const file = path.join(dir, hash.slice(2));
    const compressedData = await fs.readFile(file);
    const decompressed = zlib.inflateSync(compressedData);

    const nullIndex = decompressed.indexOf(0);
    const body = decompressed.subarray(nullIndex + 1).toString();

    const parentMatch = body.match(/parent:\s*([a-f0-9]+)/);
    const parent = parentMatch ? parentMatch[1] : undefined;

    return { body, parent };
}

export async function log(): Promise<void> {
    const refPath = await fs.readFile('.col/Head', 'utf-8');
    const branchPath = refPath.split(':')[1].trim();
    const currentHash = (await fs.readFile(path.join('.col', branchPath), 'utf-8')).trim();

    let hash = currentHash;

    console.log('=== Commit History ===');
    while (hash && hash !== '0000000000000000000000000000000000000000') {
        const { body, parent } = await readCommit(hash);
        console.log(`\nCommit: ${hash}`);
        console.log(body.trim());
        hash = parent || '';
    }
}