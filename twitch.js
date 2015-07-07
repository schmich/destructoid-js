var async = require('asyncawait/async'),
    await = require('asyncawait/await'),
    sprintf = require('sprintf'),
    Log = require('./log'),
    sleep = require('./sleep'),
    request = require('./request');

function Twitch() {
}

Twitch.lastRequest = Date.now();

Twitch.request = async(function(url, headers) {
  var now = Date.now();
  var wait = Math.max(1 - (now - Twitch.lastRequest), 0);
  await(sleep(wait));

  var tries = 0;
  var maxTries = 5;

  var options = { url: url };

  if (headers !== false) {
    options.headers = {
      'Accept': 'application/vnd.twitchtv.v3+json',
      'Client-ID': 'Destructoid (https://github.com/schmich/destructoid)'
    };
  }

  while (true) {
    ++tries;

    Log.info(sprintf('Requesting %s.', options.url));

    var response = await(request.getAsync(options));
    var body = response[0].body;

    var statusCode = response[0].statusCode;
    if (statusCode != 200) {
      Log.error(sprintf('Unexpected status code: %d\nResponse: %s', statusCode, body));
      if (tries == maxTries) {
        throw new Error(sprintf('Max tries exceeded for %s.', options.url));
      }

      Log.info(sprintf('Try %d of %d, waiting for 5s.', tries, maxTries));
      await(sleep(5000));
      continue;
    }

    Twitch.lastRequest = now;
    
    return JSON.parse(body);
  }
});

module.exports = Twitch;
