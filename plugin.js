var async = require('asyncawait/async');
var await = require('asyncawait/await');
var sprintf = require('sprintf');

function plugin(handlers) {
  function makeChannel(client, channelName) {
    return {
      name: channelName,
      say: function() {
        client.say('#' + channelName, sprintf.apply(null, arguments));
      }
    };
  }

  function makeUser(client, username) {
    return {
      name: username,
      say: function() {
        throw new Error('user.say');
      }
    };
  }

  return {
    load: function(emitter) {
      if (handlers.load) {
        handlers.load(emitter);
      }

      if (handlers.message) {
        emitter.on('message', async(function(client, channel, user, message) {
          handlers.message(makeChannel(client, channel), makeUser(client, user), message);
        }));
      }

      if (handlers.join) {
        emitter.on('join', async(function(client, channel, user) {
          handlers.join(makeChannel(client, channel), makeUser(client, user));
        }));
      }

      if (handlers.part) {
        emitter.on('part', async(function(client, channel, user) {
          handlers.part(makeChannel(client, channel), makeUser(client, user));
        }));
      }

      if (handlers.channel) {
        emitter.on('channel', async(function(client, channel) {
          handlers.channel(makeChannel(client, channel));
        }));
      }
    }
  };
}

module.exports = plugin;
