/*
 * This script will generate the token used for all K8S API calls.
 */

'use strict';
const shell = require('shelljs');
const colors = require('colors');
const axios = require('axios');
const { appendFileSync, chmodSync } = require('fs');
const { stripIndents } = require('common-tags');

// Use yargs to parse and validate cli options.
// There are more advance usage in their examples.
// See: https://github.com/yargs/yargs/blob/master/docs/examples.md
const argv = require('yargs')
  .usage(
    'node ${WORKSPACE}/tools/cd/generateToken --workspace="${WORKSPACE}" --k8s-username="${AF_USERNAME}" --k8s-password="${AF_PASS}"'
  )
  .default('k8sUsername', process.env.AF_USERNAME)
  .default('k8sPassword', process.env.AF_PASS)
  .demandOption(['k8sUsername', 'k8sPassword', 'workspace']).argv;

const ENV_VARS_FILE = process.env.ENV_VARS_FILE || 'env_variables.properties';

// You can silence the warning if NODE_NO_WARNINGS=1 is set before calling script.
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// NOTE: JS functions are hoisted, so they can be called from anywhere in the module no matter where they are declared.

main().catch(err => {
  console.log(colors.red(`Error occurred ${err.message}`));
  process.exit(1);
});

async function main() {
  process.chdir(argv.workspace);
  const requestOptions = createRequestOptions();
  const token = await getToken(requestOptions);
  writeFile(token);
}

function createRequestOptions() {
  return {
    apiUrl: 'https://example.com',
    username: argv.k8sUsername,
    password: argv.k8sPassword
  };
}
async function getToken(requestOptions) {
  // Use stripIndents to remove leading whitespace.
  // See: https://2ality.com/2016/05/template-literal-whitespace.html
  console.log(stripIndents`
    ********************************************************
    Generate K8S Token
    ********************************************************
  `);

  const response = await axios({
    method: 'post',
    url: requestOptions.apiUrl,
    headers: {
      'Cache-Control': 'no-cache',
      'Content-Type': 'application/json'
    },
    data: {
      username: requestOptions.username,
      password: requestOptions.password
    }
  });

  const status = response.status;

  if (status === 200) {
    console.log(stripIndents`
      ********************************************************
      INFO: Got 200! All done!
      ********************************************************
    `);
  } else if (status === 201) {
    console.log(stripIndents`
      ********************************************************
      INFO: Got 201! Proceed with caution!
      ********************************************************
    `);
  } else {
    throw new Error(stripIndents`
      ********************************************************
      ERROR: ${status}
      ********************************************************
    `);
  }

  // NOTE: Doesn't look like we need to return value anywhere.
  // return requestOptions;

  // NOTE: But we can separate fetching token from writing to file.
  return 'K8S_TOKEN=' + response.data.token + '\n';
}

function writeFile(token) {
  // NOTE: Make sure file exists.
  shell.touch(ENV_VARS_FILE);

  appendFileSync(ENV_VARS_FILE, token);
  chmodSync(ENV_VARS_FILE, '755');
}
