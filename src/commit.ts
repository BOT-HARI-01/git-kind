import zlib from 'zlib';
import path from 'path';
import readline from 'readline';
import { promises as fs } from 'fs';
import { createHash } from 'crypto';
import { makeTree } from './makeTree.js';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  function promptCommitMessage(): Promise<string> {
    return new Promise((resolve) => {
      rl.question('Enter commit message: ', (message) => {
        resolve(message);
        rl.close();
      });
    });
  }
export async function commit() : Promise<void>{
    const headPath = path.join('.col','Head');  
    try{
        const message = await promptCommitMessage();
        const rootHash: string = await makeTree('.');
        const parent = await fs.readFile(headPath,'utf-8');
        const saveLoc = parent.split(':')[1].trim();
        const makePath = path.join('.col',saveLoc);
        const oldHash = await fs.readFile(makePath);

        // const timestamp = Math.floor(Date.now()/1000);
        const timestamp = new Date().toISOString();
        const commitBody = [
            `tree: ${rootHash}`,
            oldHash ? `parent: ${oldHash}` : null,
            `commited at: ${timestamp} +0000`,
            ``,
            `Message: ${message}`,
            ``
        ].join('\n');

        const header = `commit ${commitBody.length}\0`;
        const store = Buffer.concat([Buffer.from(header),Buffer.from(commitBody)]);
        const hash = createHash('sha1').update(store).digest('hex');
        const dir = path.join('.col','objects',hash.slice(0,2));
        const file = path.join(dir,hash.slice(2));

        await fs.mkdir(dir,{recursive : true});
        await fs.writeFile(file,zlib.deflateSync(store));
        await fs.writeFile(makePath,hash);
        console.log('Committed');
        console.log('commit Hash: ',hash);

    }catch(err : any){
        console.log("Error in commit", err);
    }
}