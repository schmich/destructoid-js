var Promise = require('bluebird');

function sleep(duration) {
  return new Promise(function(resolve, reject) {
    setTimeout(resolve, duration);
  });
}

module.exports = sleep;
