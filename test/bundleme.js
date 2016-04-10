import test from 'test/styles/test.scss!';
import test_sass from 'test/styles/test_sass.sass!scss';
import test_other from 'test/styles/test_other.scss!';
import test_spaced from 'test/styles/spaced directory/spaced.scss!';

var injectCSS = function(c) {
    var d = document,
        a = 'appendChild',
        i = 'styleSheet',
        s = d.createElement('style');
    s.type = 'text/css';
    d.getElementsByTagName('head')[0][a](s);
    s[i] ?
        s[i].cssText = c :
        s[a](d.createTextNode(c));
}

injectCSS(test);
injectCSS(test_sass);
injectCSS(test_other);
injectCSS(test_spaced);

console.log('I am bundled');
