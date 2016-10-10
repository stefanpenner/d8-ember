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
const document = new SimpleDOM.Document();
document.createElementNS = document.createElement; // TODO:wat
global.document = document;
SimpleDOM.Node.prototype.insertAdjacentHTML = function( ) {};

loadFile('./dist/ember.prod.js');
loadFile('./dist/ember-template-compiler.js');
loadFile('./node_modules/loader.js/lib/loader/loader.js');

const EmberTemplateCompiler = Ember.__loader.require('ember-template-compiler')

function compile(templateString) {

	var templateSpec = EmberTemplateCompiler.precompile(templateString);
	var template = new Function('return ' + templateSpec)();

	return Ember.HTMLBars.template(template);
}

const app = Ember.Application.extend().create({
  autoboot: false
});

app.Router = Ember.Router.extend({
  location: 'none'
});

app.Router.map(function() {
  this.route('a');
  this.route('b');
});

app.register('template:application', compile('<h1>Hello world</h1>\n{{x-foo}}'));
app.register('template:a', compile('<h2>Welcome to {{x-foo page="A"}}</h2>'));
app.register('template:b', compile('<h2>{{x-foo page="B"}}</h2>'));
app.register('component:x-foo', Ember.Component.extend({
  tagName: 'span',
  init() {
    this._super();
    initCalled = true;
  },
  didInsertElement() {
    didInsertElementCalled = true;
  }
}));

Ember.run(app, 'boot');

const serializer = new SimpleDOM.HTMLSerializer(SimpleDOM.voidMap);

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
  });

});
