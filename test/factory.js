describe('factory test', function () {
  var app;

  before(function (done) {
    app = require('cantina');
    app.boot(function (err) {
      assert.ifError(err);

      require('../');

      app.start(done);
    });
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
});