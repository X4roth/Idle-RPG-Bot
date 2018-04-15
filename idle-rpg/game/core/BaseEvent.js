const Promise = require('bluebird');

class BaseEvent {

  constructor() {
    super();

    this.Promise = Promise;
  }

}
module.exports = BaseEvent;