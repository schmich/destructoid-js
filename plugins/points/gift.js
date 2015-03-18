var common = require('../../common'),
    Command = common.Command,
    await = common.await,
    InsufficientPoints = require('../../lib/points').InsufficientPoints;

module.exports = function(points, userService) {
  return new Command('!gift', function(user, amount) {
    if (!user || !amount) {
      this.say('%s: point gifting format is !gift letoucan 42', this.user);
      return;
    }

    var from = userService.canonical(this.user);
    var to = userService.canonical(user);

    if (from == to) {
      this.say('Gifting yourself points, %s? DansGame', from);
      return;
    }

    var amount = parseInt(amount);
    if (isNaN(amount) || (amount < 1)) {
      this.say('%s: gifted points must be a positive integer.', this.user);
      return;
    }

    if (!await(userService.exists(to))) {
      this.say('%s: user %s does not exist', from, to);
      return;
    }

    if (to == 'real_jansoon') {
      this.say('%s: senpai cannot get any more dank Keepo', from);
      return;
    } else if ((to == 'dankbot3000') || (to == 'nightbot')) {
      this.say('%s: bots do not require dank points, only dank memes MrDestructoid', from);
      return;
    }

    try {
      await(points.transfer(from, to, amount));
    } catch (e) {
      if (e instanceof InsufficientPoints) {
        if (e.points == 0) {
          this.say('%s: you have no ₯ to give', this.user);
        } else if (e.points < 0) {
          this.say('%s: yous still in debt with %d ₯ FailFish', this.user, e.points);
        } else {
          this.say('%s: you only have %s', this.user, points.display(e.points));
        }
      } else {
        this.say('Unexpected error');
      }
      return;
    }

    this.say('%s gifted %s %s HeyGuys', from, to, points.display(amount));
  });
};