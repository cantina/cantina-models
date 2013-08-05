describe('redis test', function () {
  var app, id;

  before(function (done) {
    app = require('cantina');
    app.boot(function (err) {
      assert.ifError(err);

      app.conf.set('redis:prefix', 'cantina-test-' + Date.now());
      require('cantina-redis');
      require('../');

      app.modeler = require('modeler-redis');
      app.modelerOpts = {
        client: app.redis,
        prefix: app.redisKey('models') + ':'
      };

      app.start(done);
    });
  });

  after(function (done) {
    app.redis.keys(app.redisKey('models') + ':*', function (err, keys) {
      assert.ifError(err);
      app.redis.del(keys, function (err) {
        assert.ifError(err);
        app.destroy(done);
      });
    });
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
      id = brian.id;
      done();
    });
  });

  it('saved model to redis', function (done) {
    app.redis.get(app.redisKey('models', 'people', id), function (err, data) {
      assert.ifError(err);
      data = JSON.parse(data);
      assert.equal(data.first, 'Brian');
      done();
    });
  });
});