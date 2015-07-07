var Promise = require('bluebird');
var mongodb = Promise.promisifyAll(require('mongodb'));

module.exports = {
  Client: mongodb.MongoClient,
  Collection: mongodb.Collection
};
