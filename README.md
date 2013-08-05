cantina-models
==============

[Modeler](https://github.com/carlos8f/modeler)-powered models for Cantina applications.

Provides
--------

- **app.collections** - A hash of modeler collections, keyed by collection 'name'.
- **app.createCollection (name, options)** - Create a collection for use in the
application. Accepts all the usual modeler options. By default it sets up
modeler CRUD hooks that emit/run app-level events/hooks. (See more below).

Events
------

- **model:create (model)** - A model was created.
- **model:create:<name> (model)** - A model of type `<name>` was created.

Hooks
-----

- **model:save (model, cb)** - A model is about to be saved.
- **model:save:<name> (model, cb)** - A model of type `<name>` is about to be saved.
- **model:load (model, cb)** - A model was loaded.
- **model:load:<name> (model, cb)** - A model of type `<name>` was loaded.
- **model:destroy (model, cb)** - A model was destroyed.
- **model:destroy:<name> (model, cb)** - A model of type `<name>` was destroyed.

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

If you want to use other modeler stores, its easy. For example, to use
[cantina-redis](https://github.com/cantina/cantina-redis) with
[modeler-redis](https://github.com/carlos8f/modeler-redis):

```js
var app = require('cantina');

app.boot(function (err) {
  if (err) throw err;

  require('cantina-redis');
  require('cantina-models');

  // Use a different modeler store.
  app.modeler = require('modeler-redis');

  // Provide default options for new collections.
  app.modelerOpts = {
    client: app.redis,
    prefix: app.redisKey('models') + ':'
  };

  // Ready to start persisting models to redis ...
});
```

**Custom store per-collection**

`cantina-models` supports specifying a custom modeler store per-collection.

```js
// When you create the collection, just pass your modeler store and options.
app.createCollection({
  // The modeler store to use.
  modeler: require('modeler-leveldb'),

  // Pass options like usual.
  db: require('levelup')('/path/to/db')
});
```

- - -

### Developed by [Terra Eclipse](http://www.terraeclipse.com)
Terra Eclipse, Inc. is a nationally recognized political technology and
strategy firm located in Aptos, CA and Washington, D.C.

- - -

### License: MIT
Copyright (C) 2013 Terra Eclipse, Inc. ([http://www.terraeclipse.com](http://www.terraeclipse.com))

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the &quot;Software&quot;), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is furnished
to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
