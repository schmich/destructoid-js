function regexEscape(pattern) {
  return s.replace(/([/\\^$*+?.()|[\]{}])/g, '\\$1')
}

function match(pattern, message, handler) {
  if (pattern instanceof RegExp) {
    message = message.trim();

    if (message.match(pattern)) {
      var args = message.split(/\s+/);
      args.shift();

      for (var i = 0; i < args.length; ++i) {
        args[i] = args[i].trim();
      }

      handler.apply(null, args);
    }
  } else if ((pattern instanceof String) || (typeof pattern === 'string')) {
    var regex = new RegExp('^\\s*' + regexEscape(pattern) + '(\\s+|$)', 'i');

    return match(regex, message, handler);
  }
}

module.exports = match;
