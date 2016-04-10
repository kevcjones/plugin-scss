import fs from 'fs';
import autoprefixer from 'autoprefixer';
import postcss from 'postcss';
import sass from 'sass.js';
import cloneDeep from 'lodash/cloneDeep';
import isEmpty from 'lodash/isEmpty';
import isUndefined from 'lodash/isUndefined';
import path from 'path';
import resolvePath from './resolve-path';
import escape from './escape-text';
import log from './log';

const isWin = process.platform.match(/^win/);

const loadFile = function(file) {

    return new Promise((resolve, reject) => {
        fs.readFile(file, {
            encoding: 'UTF-8',
        }, (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
};

const fromFileURL = url => {
    const address = decodeURIComponent(url.replace(/^file:(\/+)?/i, ''));
    return !isWin ? `/${address}` : address.replace(/\//g, '\\');
};

// intercept file loading requests (@import directive) from libsass
sass.importer(function(request, done) {
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
        .then(() => done({
            content,
            path: resolved,
        }))
        .catch(() => done());
});

export default function(loadObject) {
    const compilePromise = function(load) {

        return new Promise((resolve, reject) => {

            const urlBase = `${path.dirname(load.address)}/`;

            let options = {};

            if (!isUndefined(System.sassPluginOptions) &&
                !isUndefined(System.sassPluginOptions.sassOptions)) {
                options = cloneDeep(System.sassPluginOptions.sassOptions);
            }

            options.style = sass.style.compressed;
            options.indentedSyntax = load.address.endsWith('.sass');
            options.importer = {
                urlBase,
            };

            // Occurs on empty files
            if (isEmpty(load.source)) {
                return resolve('');
            }

            sass.compile(load.source, options, result => {

                if (result.status === 0) {
                    // credit : plugin-sass = screendriver + co - ty.
                    if (!isUndefined(System.sassPluginOptions) &&
                        System.sassPluginOptions.autoprefixer) {
                        postcss([autoprefixer])
                            .process(result.text)
                            .then(({ css }) => {
                                resolve(escape(css));
                            });
                    } else {
                        resolve(escape(result.text));
                    }
                } else {
                    log('warn', 'Stacklite :: github:KevCJones/plugin-scss/sass-inject-build.js -> npm:sass.js', true);
                    log('error', result.formatted, true);
                    reject(result.formatted);
                }
            });
        });

    };
    return new Promise((resolve, reject) => {
        const load = loadObject;
        return loadFile(fromFileURL(load.address))
            .then(function(result) {
                load.source = result;
                return compilePromise(load);
            })
            .then(function(res) {
                if (!res) {
                    reject('');
                } else {
                    resolve(res);
                }
            });

    });
}
