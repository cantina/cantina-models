var _ = require('underscore');

module.exports = function (app) {
  // Collections namespace.
  app.collections = {};

  // Register a loader for collections.
  app.loader('collections', function (options) {
    return app.load('modules', options);
  });

  // Create a new collection.
  function createCollection (type, name, store, options) {
    options = options || {};

    if (!name) {
      throw new Error('A collection must have a name.');
    }
    if (Object.keys(app.collections).some(function (collection) { return collection.toLowerCase() === name.toLowerCase(); })) {
      throw new Error('Collection ' + name + ' has already been created.');
    }

    // Set name.
    options.name = name;

    // Setup passed collection init hook
    if (options.init) {
      app.once('collection:init:' + name, options.init);
    }

    // Save passed CRUD hooks.
    if (options.create) {
      app.on('model:create:' + name, options.create);
    }
    if (options.save) {
      app.hook('model:save:' + name).add(options.save);
    }
    if (options.afterSave) {
      app.hook('model:afterSave:' + name).add(options.afterSave);
    }
    if (options.load) {
      app.hook('model:load:' + name).add(options.load);
    }
    if (options.destroy) {
      app.hook('model:destroy:' + name).add(options.destroy);
    }
    if (options.afterDestroy) {
      app.hook('model:afterDestroy:' + name).add(options.afterDestroy);
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
      afterSave: function (model, cb) {
        app.hook('model:afterSave').runSeries(model, function (err) {
          if (err) return cb(err);
          app.hook('model:afterSave:' + name).runSeries(model, function (err) {
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
      },
      afterDestroy: function (model, cb) {
        app.hook('model:afterDestroy').runSeries(model, function (err) {
          if (err) return cb(err);
          app.hook('model:afterDestroy:' + name).runSeries(model, function (err) {
            cb(err);
          });
        });
      }
    });

    app.collections[name] = (store)(options);
    app.collections[name].__type = type;
    process.nextTick(function () {
      app.emit('collection:init', app.collections[name]);
      app.emit('collection:init:' + name, app.collections[name]);
    });
    return app.collections[name];
  }

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
      options = _.defaults(_.clone(defaults), options || {});
      return createCollection(factoryName.toLowerCase(), name, store, options);
    };
  };
};
