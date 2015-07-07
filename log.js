var Log = require('winston');
var moment = require('moment');

Log.remove(Log.transports.Console);
Log.add(Log.transports.Console, { timestamp: function() { return moment().format(); } });

module.exports = Log;
