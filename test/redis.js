describe('redis test', function () {
  var app, id;

  before(function (done) {
    app = require('cantina').createApp();
    app.boot(function (err) {
      assert.ifError(err);
      app.conf.set('redis:prefix', 'cantina-test-' + Date.now());
      app.require('cantina-redis');
      app.require('../');
      app.start(function (err) {
        assert.ifError(err);
        var modeler = require('modeler-redis');
        app.createCollectionFactory('redis', modeler, {
          client: app.redis,
          prefix: app.redisKey('models') + ':'
        });
        done();
      });
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
    app.createRedisCollection('people');
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