#!/usr/bin/env node

import { Command } from "commander";
import { commit } from "../src/commit.js";
import { initRepo } from "../src/init.js";
import { log } from "../src/log.js";
import { readTree } from "../src/readTree.js";
const program = new Command();

program
    .command('init')
    .description("Initializing a Repo.")
    .action(async()=> {
        await initRepo();
        process.exit(0); 
    })
    
program
    .command('commit')
    .description('Commit the changes.')
    .action(async()=>{ 
        await commit();
        process.exit(0);
    })
program
    .command('log')
    .description('Get Commit History.')
    .action(async()=> {
        await log();
        process.exit(0); 
    })
program
    .command('files')
    .description('Shows content of all files')
    .action(async()=>{
        await readTree('.');
        process.exit(0);
    })
program.parse(process.argv)