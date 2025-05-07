import zlib from 'zlib';
import {promises as fs} from 'fs';
import path from 'path';
export async function readCol(filehash : string) : Promise<void>{
    const filepath = path.join('.col','objects',filehash.slice(0,2));
    try{
        const file = path.join(filepath,filehash.slice(2));
        const compresseddata = await fs.readFile(file);
        const decompress = zlib.inflateSync(compresseddata);
        
        const nullindex = decompress.indexOf(0);
        const header = decompress.subarray(0,nullindex).toString();
        const type = header.split(' ')[0]
        // If we have a file directly decompress and convert buffer to str for readable content
        // const body = decompress.subarray(nullindex+1).toString();

        if(type  === 'tree'){
            const body = decompress.subarray(nullindex+1);
            console.log('header ',header);
            console.log('body', body);
            let i = 0;
            while (i < body.length) {
            
                const spaceIndex = body.indexOf(0x20, i);
                const mode = body.subarray(i, spaceIndex).toString();
                i = spaceIndex + 1;

                
                const nullByteIndex = body.indexOf(0x00, i);
                const filename = body.subarray(i, nullByteIndex).toString();
                i = nullByteIndex + 1;

                const shaBinary = body.subarray(i, i + 20);
                const shaHex = shaBinary.toString('hex');
                i += 20;

                console.log(`${mode} ${filename} -> ${shaHex}`);

                if (mode === '40000'){
                        console.log('inside 40000')
                        await readCol(shaHex);
                }
            }
        }else {
            const body = decompress.subarray(nullindex+1).toString();
            console.log('header',header);
            console.log('body', body);

        }
    }
    catch (err) {
        console.log("error", err);
    }
}
