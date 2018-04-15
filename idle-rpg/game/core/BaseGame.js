const Promise = require('bluebird');

class BaseGame {

  constructor() {
    super();

    this.Promise = Promise;
  }

}
module.exports = BaseGame;