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

  it('can create a collection', function (done) {
    app.createCollection('people');
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