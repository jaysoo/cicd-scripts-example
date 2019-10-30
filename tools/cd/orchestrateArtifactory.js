/*
 * This script does something with artifactory.
 */

'use strict';
const colors = require('colors');
const { join } = require('path');
const { downloadFile } = require('../shared/network');
const argv = require('yargs')
  .usage('node ${WORKSPACE}/tools/cd/orchestrateArtifactory --output=${OUTPUT}')
  // Replace this with .zip or whatever
  .default('output', join(__dirname, 'example.html'))
  .demandOption(['output']).argv;

main().catch(err => console.log(colors.red(err.message)));

async function main() {
  downloadFile({
    url: 'http://example.com',
    headers: { 'Content-Type': 'text/html' },
    output: argv.output
  });
}
