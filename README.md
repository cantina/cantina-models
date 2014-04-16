cantina-models
==============

Models for Cantina applications.

Provides
--------

- **app.collections** - A hash of collections, keyed by collection 'name'.
- **app.createCollectionFactory (factoryName, store, defaults)** - Create a
store-specifc collection factory, optionally including default options.
  - **factoryName** - used to name the factory, e.g., the factoryName "redis"
(case-insensitive) will create `app.createRedisCollection`
  - **store** - a function that implements a
[modeler](https://github.com/carlos8f/modeler)-compatible API.
  - **defaults** - default options to be passed to the store

Factory
-------
- **app.create[Factoryname]Collection (name, options)** - Create a
collection for use in your application.
  - **name** - used to name the collection, e.g., the name "userComments" will
create `app.collections.userComments`
  - **options** - passed directly to the store. So, if it's a modeler store, you
can pass all the usual modeler options. Other stores may implement additional
options. By default it sets up modeler CRUD hooks that emit/run app-level
events/hooks, as well as an `init` event that is triggered once on
`collection:init`. (See more below).

### Factory CRUD methods

Every collection created by the factory will implement the following modeler-compatible CRUD methods:

#### `create (attributes, [callback])`

Creates a model using the provided `attributes`. If not provided, ensures that
`id`, `rev`, and `created` are defined.

The created model is returned unless a `callback` is provided. If a `callback` is
provided, the model will be saved and the `callback` invoked with the results of
the save.

#### `load (id, [options], [callback])`

Loads a model by `id`. Any `options` are passed to the store.

#### `save (model, [options], [callback])`

Saves `model`. Any `options` are passed to the store.

#### `destroy (id|model, [options], [callback])`

Destroys (deletes) `model` (or the model identified by `id`). Any `options` are
passed to the store.

#### `list ([options], callback)`

Lists all models in the collection. Any `options` (e.g., offset, limit) are
passed to the store.

### Model properties

Every model will have the following properties, at a minimum:

#### `id`

The model's unique identifier.

#### `rev`

The model's revision number (incremented on each save).

#### `created`

The `Date.now()` when the model was created.

#### `updated`

If the model has been saved, the `Date.now()` when the model was most recently
saved.

Events
------

- **collection:init (collection)** - A collection was created.
- **collection:init:_name_ (collection)** - A collection of type _name_ was created.
- **model:create (model)** - A model was created.
- **model:create:_name_ (model)** - A model of type _name_ was created.

Hooks
-----

- **model:save (model, cb)** - A model is about to be saved.
- **model:save:_name_ (model, cb)** - A model of type _name_ is about to be saved.
- **model:afterSave (model, cb)** - A model was successfully saved.
- **model:afterSave:_name_ (model, cb)** - A model of type _name_ was successfully saved.
- **model:load (model, cb)** - A model was loaded.
- **model:load:_name_ (model, cb)** - A model of type _name_ was loaded.
- **model:destroy (model, cb)** - A model is about to be destroyed.
- **model:destroy:_name_ (model, cb)** - A model of type _name_ is about to be destroyed.
- **model:afterDestroy (model, cb)** - A model was successfully destroyed.
- **model:afterDestroy:_name_ (model, cb)** - A model of type _name_ was successfully destroyed.

Usage
-----

During app start-up, you'll need to create some collection factories. For
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
