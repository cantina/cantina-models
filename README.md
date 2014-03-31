cantina-models
==============

Models for Cantina applications.

Provides
--------

- **app.collections** - A hash of collections, keyed by collection 'name'.
- **app.createCollection (name, store, options)** - Create a collection using
the specified store for use in the application. The store must export a function
that implements a [modeler](https://github.com/carlos8f/modeler)-compatible API.
Options will be pased directly to the store, so if it's a modeler store, you can
pass all the usual modeler options. By default it sets up modeler CRUD hooks
that emit/run app-level events/hooks. (See more below). If you don't specify a
store, collections will be created using a modeler memory-store.
- **app.createCollectionFactory (factoryName, store, defaults)** - Create a
store-specifc collection factory, optionally including default options.

Events
------

- **model:create (model)** - A model was created.
- **model:create:_name_ (model)** - A model of type _name_ was created.

Hooks
-----

- **model:save (model, cb)** - A model is about to be saved.
- **model:save:_name_ (model, cb)** - A model of type _name_ is about to be saved.
- **model:load (model, cb)** - A model was loaded.
- **model:load:_name_ (model, cb)** - A model of type _name_ was loaded.
- **model:destroy (model, cb)** - A model was destroyed.
- **model:destroy:_name_ (model, cb)** - A model of type _name_ was destroyed.

Usage
-----

**Memory Store**

Out of the box, collections will be created using a modeler memory-store.

```js
var app = require('cantina');

app.boot(function (err) {
  if (err) throw err;

  // Load the module.
  require('cantina-models');

  app.start(function (err) {
    if (err) throw err;

    // We can now create collections.
    app.createCollection('people');

    // Bind to app events or hooks, for example:
    app.hook('model:save:people', function (person, next) {
      if (!person.first) return next(new Error('People must have a first name'));
      next();
    });

    // Create a person.
    app.collections.people.create({last: 'Doe'}, function (err, model) {
      // We will get a 'validation' error here because of the hook.
    });
  });
});
```

**Redis**

Usually, you'll want to use an actual data store, not the memory store. For
example, to use [cantina-redis](https://github.com/cantina/cantina-redis) with
[modeler-redis](https://github.com/carlos8f/modeler-redis):

```js
var app = require('cantina');

app.boot(function (err) {
  if (err) throw err;

  require('cantina-redis');
  require('cantina-models');

  app.start(function (err) {
    if (err) throw err;
    // Use a redis modeler store.
    var modeler = require('modeler-redis');

    // Pass options to modeler.
    var options = {
      client: app.redis,
      prefix: app.redisKey('models') + ':'
    };

    // Ready to start persisting models to redis ...
    app.createCollection('people', modeler, options);
  });
});
```

**Store-Specifc Collection Factory**

`cantina-models` supports defining store-specifc collection factories, optionally
including default options.

```js
// When you create the Factory, pass the name, your store, and any default options.
var modeler-leveldb = require('modeler-leveldb');
app.createCollectionFactory('leveldb', modeler-leveldb, {
  // Pass options like usual.
  db: require('levelup')('/path/to/db')
});
// create the collection factory "app.createLeveldbCollection"

// Then use it with simplified parameters for less repetition
app.createLeveldbCollection('people');
var petOptions = {
  // each collection can still have collection-specific options
};
app.createLeveldbCollection('pets', petOptions);
```

- - -

### Developed by [Terra Eclipse](http://www.terraeclipse.com)
Terra Eclipse, Inc. is a nationally recognized political technology and
strategy firm located in Aptos, CA and Washington, D.C.
