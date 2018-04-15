
class Helper {

  // https://stackoverflow.com/questions/6312993/javascript-seconds-to-time-string-with-format-hhmmss#6313008
  secondsToTimeFormat(duration) {
    const secNum = parseInt(duration, 10); // don't forget the second param
    let days = Math.floor(secNum / 86400);
    let hours = Math.floor(secNum / 3600);
    let minutes = Math.floor((secNum - (hours * 3600)) / 60);
    let seconds = secNum - (hours * 3600) - (minutes * 60);

    days = days < 10 ? `0${days}` : days;
    hours = hours < 10 ? `0${hours}` : hours;
    minutes = minutes < 10 ? `0${minutes}` : minutes;
    seconds = seconds < 10 ? `0${seconds}` : seconds;
    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
  }

}
module.exports = new Helper();
