import test from 'tape';

test('translate', assert => {

    System.import('./test/config.js')
    .then(() => System.import('test/styles/test.scss!'))
    .then((module) => {
        assert.equal(typeof module.default, 'string', 'exports css string as a default');
    })
    .catch(e => { assert.fail(e) })
    .then(() => { assert.end() });

});
