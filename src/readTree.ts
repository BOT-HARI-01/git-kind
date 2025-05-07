import zlib from 'zlib';
import { promises as fs } from "fs";
import path from 'path';
import { readCol } from "./readCol.js";

export async function readTree(currDir = path.join('.col', 'objects')): Promise<void>{
    const dir = await fs.readdir(currDir,{withFileTypes : true});
    for( const d of dir){
        if(d.isDirectory()){
            const filepath = path.join(currDir,d.name);
            // console.log(fullpath);
            const files = await fs.readdir(filepath);
            for (const file of files) {
                const fullhash = d.name + file;
                // console.log(fullhash); 
                await readCol(fullhash); 
            }
        }
    }
}
readTree();