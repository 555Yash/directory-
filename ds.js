const fs = require('fs');
const axios = require('axios');
const readline = require('readline');

const delayBetweenRequests = 100;

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function askQuestion(query) {
    return new Promise(resolve => rl.question(query, resolve));
}

async function readWordlist(filePath) {
    try {
        const data = fs.readFileSync(filePath, 'utf-8');
        return data.split(/\r?\n/).filter(Boolean);
    } catch (err) {
        console.error(`Could not read wordlist: ${err.message}`);
        process.exit(1);
    }
}

async function checkPath(baseURL, path) {
    const fullURL = `${baseURL}/${path}`;

    try {
        const response = await axios.get(fullURL, {
            validateStatus: () => true 
        });

        if (response.status !== 404) {
            console.log(` Found: ${fullURL} (Status: ${response.status})`);
        } else {
            console.log(` Not Found: ${fullURL}`);
        }
    } catch (err) {
        console.error(` Error: ${fullURL} -> ${err.message}`);
    }
}

async function startScan() {

    const inputURL = await askQuestion('Enter target URL (e.g., http://example.com): ');
    const inputWordlist = await askQuestion('Enter path to wordlist file: ');

    const baseURL = inputURL.replace(/\/+$/, ''); 
    const wordlist = await readWordlist(inputWordlist);

    console.log(`\n Scanning ${baseURL}`);
    console.log(` Using wordlist: ${inputWordlist}`);
    console.log(` Total entries to scan: ${wordlist.length}\n`);

    for (const word of wordlist) {
        await checkPath(baseURL, word);
        await new Promise(resolve => setTimeout(resolve, delayBetweenRequests));
    }

    console.log('\n Scan completed.');
    rl.close();
}

startScan();
