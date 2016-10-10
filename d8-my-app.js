print('version:', version());
function loadFile(file) {
  print('load: ' + file);
  load(file);
}

const global = new Function('return this;')();

global.console = {
  log(...args) {
    print(...args);
  }
};

global.setTimeout = function(callback) {
  // good enough
  Promise.resolve().then(callback).catch(e => print('error' + e));
};

loadFile('./node_modules/simple-dom/dist/simple-dom.js');

// Fake the world
const document = new SimpleDOM.Document();
document.createElementNS = document.createElement; // fix the sniff, DOMHelper
global.document = document;
global.self = document;
const location = { href: 'omg' };
document.location = location;
global.location = location;
document.implementation = { createHTMLDocument() { return { body: { childNodes: [1,2]}}}}
SimpleDOM.Node.prototype.insertAdjacentHTML = function( ) {}; // fix the sniff, DOMHelper


const _requireCache = {};
global.module = {
  require(x) {
    if (x === 'url') {
      if (x in _requireCache) {
        return _requireCache[x];
      }
      global.exports = {};
      loadFile('./vendor/url.js');
      return (_requireCache[x] = exports.Url);
    } else {
        throw TypeError('Unknown node module depedencies: ' + x)
    }
    console.log(x, y)
  }
};

runningTests = true;

loadFile('./my-app/dist/assets/vendor.js');
loadFile('./my-app/dist/assets/my-app.js');

const App = require('my-app/app').default;
const app = App.create({
  autoboot: false
});

const serializer = new SimpleDOM.HTMLSerializer(SimpleDOM.voidMap);

Ember.RSVP.on('error', error => {
  console.log("RSVP.on('error')");
  console.log(error);
  console.log(error.message);
  console.log(''+error.stack);
});

try {
  Ember.run(() => {
    const start = Date.now();
    print('visiting...');
    app.visit('/', {
      rootElement: document.body
    }).
      then(() => {
        console.log('visited! took',  (Date.now() - start));
        console.log('\n----- Start: OUTPUT for visit("/")----\n')
        console.log(serializer.serialize(document));
        console.log('\n----- End: OUTPUT for visit("/")----\n')
        // return app.visit('/a').
        //   then(value => {
        //     console.log('hello')
        //     console.log(value)
        //   }).catch(error => {
        //     console.log('OMG catch')
        //     console.log(error);
        //   });
      }).finally(function() {
          console.log('the end');
      });
  });
} catch(e) {
  console.log('EWUT');
  console.log('SUCH CAUGHT', e);
}
