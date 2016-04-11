/* global __moduleName */
let fetch;
let translate;

fetch = function() {
    return '';
};

translate = function(load) {
    return System.import(typeof window !== 'undefined' ? './sass-inject.js' : './sass-inject-build.js', {
            name: __moduleName,
        })
        .then(function(inject) {
            return inject.default(load);
        })
        .then(function(css) {
            load.metadata.format = 'amd';
            const output = 'def' + 'ine(function() {\nreturn "' + css.trim().replace('\n', '') + '";\n});';
            return (!!css) ? output : '';
        });
};

export {
    fetch,
    translate,
};
