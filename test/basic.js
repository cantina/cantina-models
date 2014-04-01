describe('basic test', function () {
  var app;

  before(function (done) {
    app = require('cantina');
    app.boot(function (err) {
      assert.ifError(err);

      require('../');

      app.start(done);
    });
  });

  after(function (done) {
    app.destroy(done);
  });

  it('can create store-specific collection factory', function () {
    var modeler = require('modeler');
    app.createCollectionFactory('memory', modeler);
    assert(app.createMemoryCollection);
    assert('function' === typeof app.createMemoryCollection);
  });

  it('throws if you try to create the same factory more than once', function () {
    assert.throws(function () {
      var modeler = require('modeler');
      app.createCollectionFactory('memory', modeler);
    },
    /Factory Memory has already been created./);
  });

  it('can create a collection', function (done) {
    app.createMemoryCollection('people');
    app.collections.people.create({
      first: 'Brian',
      last: 'Link',
      email: 'cpsubrian@gmail.com'
    }, function (err, brian) {
      assert.ifError(err);
      assert.equal(brian.first, 'Brian');
      assert.equal(brian.last, 'Link');
      assert.equal(brian.email, 'cpsubrian@gmail.com');
      done();
    });
  });

  it('emits `model:create` event', function (done) {
    app.on('model:create', function onModelCreate (model) {
      app.removeListener('model:create', onModelCreate);
      assert.equal(model.first, 'John');
      done();
    });
    app.collections.people.create({
      first: 'John',
      last: 'Doe'
    });
  });

  it('emits `model:create:[name]` event', function (done) {
    app.on('model:create:people', function onModelCreate (model) {
      app.removeListener('model:create:people', onModelCreate);
      assert.equal(model.first, 'Jane');
      done();
    });
    app.collections.people.create({
      first: 'Jane',
      last: 'Doe'
    });
  });

  it('runs `model:save` hook', function (done) {
    app.hook('model:save').add(function onHook (model, next) {
      app.hook('model:save').remove(onHook);
      model.saveHookRan = true;
      next();
    });
    app.collections.people.create({first: 'Danny'}, function (err, model) {
      assert.ifError(err);
      assert.equal(model.first, 'Danny');
      assert(model.saveHookRan);
      done();
    });
  });

  it('runs `model:save:[name]` hook', function (done) {
    app.hook('model:save:people').add(function onHook (model, next) {
      app.hook('model:save:people').remove(onHook);
      model.saveHookRan = true;
      next();
    });
    app.collections.people.create({first: 'Danny'}, function (err, model) {
      assert.ifError(err);
      assert.equal(model.first, 'Danny');
      assert(model.saveHookRan);
      done();
    });
  });
});
