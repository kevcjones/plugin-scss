import fs from 'fs';
import sass from 'sass.js';
import isEmpty from 'lodash/lang/isEmpty';
import isString from 'lodash/lang/isString';
import isUndefined from 'lodash/lang/isUndefined';
import path from 'path';
import resolvePath from './resolve-path';
import escape from './escape-text';

const isWin = process.platform.match(/^win/);


const loadFile = function(file){


  return new Promise((resolve, reject) => {
    fs.readFile(file, { encoding: 'UTF-8' }, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
};

const fromFileURL = url => {
  const address = url.replace(/^file:(\/+)?/i, '');
  return !isWin ? `/${address}` : address.replace(/\//g, '\\');
};

// intercept file loading requests (@import directive) from libsass
sass.importer( function(request, done){
  // Currently only supporting scss imports due to
  // https://github.com/sass/libsass/issues/1695
  let content;
  let resolved;
  let readImportPath;
  let readPartialPath;
  resolvePath(request)
    .then(importUrl => {
      resolved = importUrl;
      const partialUrl = importUrl.replace(/\/([^/]*)$/, '/_$1');
      readImportPath = fromFileURL(importUrl);
      readPartialPath = fromFileURL(partialUrl);
      return loadFile(readPartialPath);
    })
    .then(data => content = data)
    .catch(() => loadFile(readImportPath))
    .then(data => content = data)
    .then(() => done({ content, path: resolved }))
    .catch(() => done());
});

export default function(loadObject){
  const compilePromise = function(load){

    return new Promise((resolve, reject) => {

      const urlBase = `${path.dirname(load.address)}/`;

      const options = {
        style: sass.style.compressed,
        indentedSyntax: load.address.endsWith('.sass'),
        importer: { urlBase },
      };

      // Occurs on empty files
      if (isEmpty(load.source)) {
        return resolve('');
      }

      sass.compile(load.source, options, result => {

        if (result.status === 0) {
          resolve(escape(result.text));
        } else {
          reject(result.formatted);
        }
      });
    });

  };
  return new Promise((resolve, reject) => {
    var load = loadObject;
    return loadFile(fromFileURL(load.address))
           .then(function(result){
             load.source = result;
             return compilePromise(load);
           })
           .then(function(res){
             resolve(res);
           })

  });
};
