import { promises as fs } from "fs";
import path from "path";
import { createHash } from "crypto";
import zlib from 'zlib';

export async function makeHash(filept: string): Promise<string> {
    // const fullpath = path.join(process.cwd(), filename);
    let hash: string;
    const data = await fs.readFile(filept);

    const header = `blob ${data.length}\0`;
    const store = Buffer.concat([Buffer.from(header), data]);
    // console.log(store);

    hash = createHash('sha1').update(store).digest('hex');
    // console.log(hash)
    const dir = path.join('.col', 'objects', hash.slice(0, 2));
    const file = path.join(dir, hash.slice(2));

    try {
        await fs.access(file)
    } catch (err: any){
        await fs.mkdir(dir, { recursive: true });
        await fs.writeFile(file, zlib.deflateSync(store));
        // console.log('error',err);
    }
    return hash;
}