let intervalHandle;

function timer(seconds) {
  intervalHandle = window.setInterval(function(){
    // console.log(seconds);
    $('#timer').text(seconds);
    seconds--;
    if (seconds < 0) {
      whenTimerIsFinish();
    }
  }, 1000);
}

function whenTimerIsFinish() {
  clearInterval(intervalHandle);
}

timer(5);
