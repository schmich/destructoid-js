var EventEmitter = require('events').EventEmitter,
    irc = require('irc'),
    async = require('asyncawait/async'),
    await = require('asyncawait/await'),
    Log = require('./log'),
    sprintf = require('sprintf'),
    Promise = require('bluebird');

function Bot(opts) {
  var self = this;

  this.username = opts.username;
  this.password = 'oauth:' + opts.oauth.replace(/^oauth:/i, '');
  this.joins = [];
  this.client = Promise.defer();

  this.emitter = new EventEmitter();
  this.emitter.setMaxListeners(0);

  this.join = function(channel) {
    this.client.promise.then(function(client) {
      Log.info(sprintf('Joining #%s.', channel));

      client.join(sprintf('#%s', channel), function() {
        Log.info(sprintf('Joined #%s.', channel));
        self.emitter.emit('channel', client, channel);
      });
    });

    return this;
  };

  function makeChannel(client, channelName) {
    return {
      name: channelName,
      say: function() {
        client.say('#' + channelName, sprintf.apply(null, arguments));
      },
      ban: function(user) {
        // TODO: Canonicalize username.
        this.say('.ban ' + user);
      },
      unban: function(user) {
        // TODO: Canonicalize username.
        this.say('.unban ' + user);
      }
    };
  }

  function makeUser(client, username) {
    function channelSay(channel, message) {
      client.say('#' + channelName, sprintf.apply(null, arguments));
    }

    // TODO: Canonicalize username.
    return {
      name: username,
      whisper: function() {
        throw new Error('user.whisper');
      },
      ban: function(channel) {
        channelSay(channel, '.ban ' + username);
      },
      unban: function(channel) {
        channelSay(channel, '.unban ' + username);
      }
    };
  }

  this.loadPlugin = function(plugin) {
    if (plugin.load) {
      plugin.load(emitter);
    }

    if (plugin.message) {
      this.on('message', async(function(client, channel, user, message) {
        plugin.message(makeChannel(client, channel), makeUser(client, user), message);
      }));
    }

    if (plugin.join) {
      this.on('join', async(function(client, channel, user) {
        plugin.join(makeChannel(client, channel), makeUser(client, user));
      }));
    }

    if (plugin.part) {
      this.on('part', async(function(client, channel, user) {
        plugin.part(makeChannel(client, channel), makeUser(client, user));
      }));
    }

    if (plugin.channel) {
      this.on('channel', async(function(client, channel) {
        plugin.channel(makeChannel(client, channel));
      }));
    }
  }

  this.plugin = function(plugin) {
    if (plugin instanceof Array) {
      for (var i = 0; i < plugin.length; ++i) {
        this.loadPlugin(plugin[i]);
      }
    } else {
      this.loadPlugin(plugin);
    }

    return this;
  };

  this.on = function() {
    this.emitter.on.apply(this.emitter, arguments);
    return this;
  };

  this.listen = function() {
    var client = new irc.Client('irc.twitch.tv', this.username, {
      port: 6667,
      showErrors: true,
      password: this.password,
      userName: this.username,
      realName: this.username,
      autoConnect: false,
      showErrors: true,
      stripColors: true,
      secure: false
    });

    client.on('error', function(message) {
      Log.error(sprintf('IRC error: %s', message));
    });

    Log.info('Connecting to Twitch IRC servers.');
    client.connect(5, function() {
      Log.info('Connected to Twitch IRC servers.');
      self.client.resolve(client);
    });

    this.client.promise.then(function(client) {
      client.on('message#', function(user, channel, message) {
        user = user.trim().toLowerCase();
        channel = channel.substr(1).trim().toLowerCase();

        self.emitter.emit('message', client, channel, user, message);
      });

      client.on('join', function(channel, user) {
        user = user.trim().toLowerCase();
        channel = channel.substr(1).trim().toLowerCase();

        self.emitter.emit('join', client, channel, user);
      });

      client.on('part', function(channel, user) {
        user = user.trim().toLowerCase();
        channel = channel.substr(1).trim().toLowerCase();

        self.emitter.emit('part', client, channel, user);
      });
    });
  };
};

module.exports = Bot;
