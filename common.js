var async = require('asyncawait/async');
var await = require('asyncawait/await');

function canonicalUser(user) {
  if (!user) {
    return null;
  }

  user = user.trim();
  if (user[0] === '@') {
    user = user.substr(1);
  }

  return user.toLowerCase();
}

var json = async(function(url) {
  var response = await(request.getAsync(url));

  if (!response) {
    return null;
  }

  var body = response[0].body;
  return JSON.parse(body);
});

module.exports = {
  json: json,
  canonicalUser: canonicalUser
};
