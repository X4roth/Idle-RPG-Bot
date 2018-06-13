class MessageHandler {

  /**
   * Handles message sent from discord
   * https://discord.js.org/#/docs/main/stable/class/Message
   * @param {*} message
   */
  handle(message) {
    console.log(message);
  }

}
module.exports = new MessageHandler();
