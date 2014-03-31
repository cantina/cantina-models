var app = require('cantina')
  , modeler = require('modeler')
  , _ = require('underscore');

// Collections namespace.
app.collections = {};

// Create a new collection.
app.createCollection = function (name, store, options) {
  if (arguments.length < 3) {
    options = store;
    store = null;
  }
  // default modeler memory store
  store = store || modeler;
  options = options || {};

  if (!name) {
    throw new Error('A collection must have a name.');
  }
  if (app.collections[name]) {
    throw new Error('Collection ' + name + ' has already been created.');
  }

  // Set name.
  options.name = name;

  // Save passed CRUD hooks.
  if (options.create) {
    app.on('model:create:' + name, options.create);
  }
  if (options.save) {
    app.hook('model:save:' + name).add(options.save);
  }
  if (options.load) {
    app.hook('model:load:' + name).add(options.load);
  }
  if (options.destroy) {
    app.hook('model:destroy:' + name).add(options.destroy);
  }

  // Overridew with app-level CRUD hooks.
  options = _.extend({}, options, {
    create: function (model) {
      app.emit('model:create', model);
      app.emit('model:create:' + name, model);
    },
    save: function (model, cb) {
      app.hook('model:save').runSeries(model, function (err) {
        if (err) return cb(err);
        app.hook('model:save:' + name).runSeries(model, function (err) {
          cb(err);
        });
      });
    },
    load: function (model, cb) {
      app.hook('model:load').runSeries(model, function (err) {
        if (err) return cb(err);
        app.hook('model:load:' + name).runSeries(model, function (err) {
          cb(err);
        });
      });
    },
    destroy: function (model, cb) {
      app.hook('model:destroy').runSeries(model, function (err) {
        if (err) return cb(err);
        app.hook('model:destroy:' + name).runSeries(model, function (err) {
          cb(err);
        });
      });
    }
  });

  app.collections[name] = (store)(options);
};

// Create a collection factory for a specific store.
app.createCollectionFactory = function (factoryName, store, defaults) {
  defaults = defaults || {};

  if (!factoryName) {
    throw new Error('A factory must have a name.');
  }
  if (!store || 'function' !== typeof store) {
    throw new Error('A factory must have a store.');
  }

  // Normalize the factory name
  factoryName = factoryName.toLowerCase().replace(/^./, function (char) { return char.toUpperCase(); });

  if (app['create' + factoryName + 'Collection']) {
    throw new Error('Factory ' + factoryName + ' has already been created.');
  }

  app['create' + factoryName + 'Collection'] = function (name, options) {
    options = _.defaults(defaults, options || {});
    return app.createCollection(name, store, options);
  };
};