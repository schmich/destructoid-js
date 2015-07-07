var EventEmitter = require('events').EventEmitter,
    irc = require('irc'),
    async = require('asyncawait/async'),
    async = require('asyncawait/await'),
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

  function loadPlugin(plugin) {
    plugin.load(self.emitter);
  }

  this.plugin = function(plugin) {
    if (plugin instanceof Array) {
      for (var i = 0; i < plugin.length; ++i) {
        loadPlugin(plugin[i]);
      }
    } else {
      loadPlugin(plugin);
    }

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
        if (user === 'jtv') {
          return;
        }

        channel = channel.substr(1).trim().toLowerCase();

        self.emitter.emit('message', client, channel, user, message);
      });

      client.on('join', function(channel, user) {
        user = user.trim().toLowerCase();
        if (user === 'jtv') {
          return;
        }

        channel = channel.substr(1).trim().toLowerCase();

        self.emitter.emit('join', client, channel, user);
      });

      client.on('part', function(channel, user) {
        user = user.trim().toLowerCase();
        if (user === 'jtv') {
          return;
        }

        channel = channel.substr(1).trim().toLowerCase();

        self.emitter.emit('part', client, channel, user);
      });
    });
  };
};

module.exports = Bot;
