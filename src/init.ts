import { promises as fs } from "fs";
import path from "path";

export async function initRepo() : Promise<void> {
    const gitdir = path.join(process.cwd(),'.col');

    try{
        await fs.mkdir(gitdir);
        await fs.mkdir(path.join(gitdir,'objects'));
        await fs.mkdir(path.join(gitdir,'refs','heads'),{recursive : true});
        
        const masterFile = path.join(gitdir,'refs','heads');
        await fs.writeFile(path.join(masterFile,'master'),'0000000000000000000000000000000000000000');
        
        await fs.writeFile(path.join('.','col_ignore'),'.col\nnode_modules\ndist')
        await fs.writeFile(path.join(gitdir, 'Head'),'ref : refs/heads/master\n');
        console.log("Initialized a repo .col");
    }catch(err : any){
        if(err.code == 'EEXIST'){
            console.log("repo exist");
        }else{
            console.log("Failed",err);
        }
    }
}
