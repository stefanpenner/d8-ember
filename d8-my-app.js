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

global.self = global;
loadFile('./node_modules/simple-dom/dist/simple-dom.js');
const document = new SimpleDOMTests.Document();
document.createElementNS = document.createElement; // TODO:wat
global.document = document;
SimpleDOMTests.Node.prototype.insertAdjacentHTML = function( ) {};

global.module = {
  require(x) {
    if (x === 'url') {
      const exports = {};
      loadFile('./vendor/url.js');
      return exports.Url;
    } else {
        throw TypeError('Unknown node module depedencies: ' + x)
    }
    console.log(x, y)
  }
};

loadFile('./dist/ember.prod.js');
loadFile('./dist/ember-template-compiler.js');
loadFile('./node_modules/loader.js/lib/loader/loader.js');

define('ember', [], () => Ember)
loadFile('./vendor/ember-load-initializers.js'); // TODO: use fastboot vendor
loadFile('./vendor/ember-resolver.js'); // TODO: use fastboot vendor
runningTests = true;
loadFile('./my-app/dist/assets/my-app.js');

const App = require('my-app/app').default;
const app = App.create({
  autoboot: false
});

Ember.run(app, 'boot');

const serializer = new SimpleDOMTests.HTMLSerializer(SimpleDOMTests.voidMap);

Ember.RSVP.on('error', error => {
  print(error.message);
  print(error.stack);
});

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

    // return app.visit('/a').finally(() => {
    //   print(serializer.serialize(document));
    //   return app.visit('/b').then(function() {
    //     print(serializer.serialize(document));
    //   });
    // });
  });
});
