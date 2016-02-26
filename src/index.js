/* global __moduleName */
let fetch;
let translate;

fetch = function(){ return ''; };

translate = function(load) {
    load.metadata.format = 'amd';

    return System.import(this.builder ? './sass-inject-build' : './sass-inject', { name: __moduleName })
      .then(function(inject){
        return inject.default(load);
      })
      .then(function(css){
        const output = 'def' + 'ine(function() {\nreturn "' + css.trim().replace('\n', '') + '";\n});';
        return (!!css) ? output : '';
      });
};

export { fetch, translate };
