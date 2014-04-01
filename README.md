cantina-models
==============

Models for Cantina applications.

Provides
--------

- **app.collections** - A hash of collections, keyed by collection 'name'.
- **app.createCollectionFactory (factoryName, store, defaults)** - Create a
store-specifc collection factory, optionally including default options. A store
must export a function that implements a
[modeler](https://github.com/carlos8f/modeler)-compatible API. Options will be
pased directly to the store, so if it's a modeler store, you can pass all the
usual modeler options. By default it sets up modeler CRUD hooks that emit/run
app-level events/hooks. (See more below).

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

During app start-up, you'll need to create from collection factories. For
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

    // These default options will get passed to modeler.
    var options = {
      client: app.redis,
      prefix: app.redisKey('models') + ':'
    };

    // We can now create collection factories.
    app.createCollectionFactory('redis', modeler, options);
    // Creates app.createRedisCollection

    var peopleOptions = {
      // each collection can still have collection-specific options
    };

    // Ready to start persisting models to redis ...
    app.createRedisCollection('people', peopleOptions);

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

- - -

### Developed by [Terra Eclipse](http://www.terraeclipse.com)
Terra Eclipse, Inc. is a nationally recognized political technology and
strategy firm located in Aptos, CA and Washington, D.C.

Copyright (C) 2013-2014 Terra Eclipse, Inc. (http://www.terraeclipse.com)