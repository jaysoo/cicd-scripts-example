'use strict';
const shell = require('shelljs');

module.exports.downloadFile = function(opts) {
  const headers = opts.headers
    ? Object.keys(opts.headers).reduce((acc, k) => {
        return acc + ` --header='${k}: ${opts.headers[k]}'`;
      }, '')
    : '';
  // NOTE: Wrapping around wget so downloadFile can be called from JS scripts.
  const result = shell.exec(`wget ${headers} ${opts.url} -o ${opts.output}`);
  if (result.code !== 0) {
    throw new Error(`Could not download from ${opts.url}`);
  }
};
