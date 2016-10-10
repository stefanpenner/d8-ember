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

Ember.run(app, 'boot');

const serializer = new SimpleDOM.HTMLSerializer(SimpleDOM.voidMap);

Ember.RSVP.on('error', error => {
  print("OMG")
  print(error);
  print(error.message);
  print(''+error.stack);
});
try {
  Ember.run(() => {
    const start = Date.now();
    print('visiting');
    app.visit('/', {
      isBrowser: false,
      document,
      rootElement: document.body
    }).finally(() => {
      print('visited' + (Date.now() - start));
      print(serializer.serialize(document));

      return app.visit('/a').finally(() => {
        print(serializer.serialize(document));
        return app.visit('/b').then(function() {
          print(serializer.serialize(document));
        });
      });
    });
  });
} catch(e) {
  print('EWUT');
  print(e);
}
