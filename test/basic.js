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

  describe('core', function () {

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
      var collection = app.createMemoryCollection('people');
      assert(app.collections.people);
      assert.strictEqual(collection, app.collections.people);
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
  });

  describe('hooks', function () {

    it('emits `collection:create` event', function (done) {
      app.once('collection:create', function (collection) {
        assert.equal(collection.options.name, 'players');
        assert.equal(app.collections.players, collection);
        done();
      });
      app.createMemoryCollection('players');
    });

    it('emits `collection:create:[name]` event', function (done) {
      app.once('collection:create:coaches', function (collection) {
        assert.equal(collection.options.name, 'coaches');
        assert.equal(app.collections.coaches, collection);
        done();
      });
      app.createMemoryCollection('coaches');
    });

    it('runs passed collection init hook', function (done) {
      function onInit (collection) {
        assert.equal(collection.options.name, 'breads');
        assert.equal(app.collections.breads, collection);
        done();
      }
      app.createMemoryCollection('breads', {
        init: onInit
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

    it('runs `model:afterDestroy` hook', function (done) {
      var afterDestroyHookRan = false;
      app.hook('model:afterDestroy').add(function onHook (model, next) {
        app.hook('model:afterDestroy').remove(onHook);
        afterDestroyHookRan = true;
        next();
      });
      app.collections.people.create({first: 'Danny'}, function (err, model) {
        assert.ifError(err);
        app.collections.people.destroy(model, function (err) {
          assert.ifError(err);
          assert(afterDestroyHookRan);
        });
        done();
      });
    });

    it('runs `model:afterDestroy:[name]` hook', function (done) {
      var afterDestroyHookRan = false;
      app.hook('model:afterDestroy:people').add(function onHook (model, next) {
        app.hook('model:afterDestroy:people').remove(onHook);
        afterDestroyHookRan = true;
        next();
      });
      app.collections.people.create({first: 'Danny'}, function (err, model) {
        assert.ifError(err);
        app.collections.people.destroy(model, function (err) {
          assert.ifError(err);
          assert(afterDestroyHookRan);
        });
        done();
      });
    });
  });
});
