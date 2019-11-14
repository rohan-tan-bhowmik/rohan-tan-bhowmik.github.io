var dateTime = new Date("Nov 19, 2019, 11:40:30").getTime();
var tick = setInterval(function () {
    var currTime = new Date().getTime();
    var diff = dateTime - currTime;

    var dayCount = Math.floor(diff / (24 * 60 * 60 * 1000));
    var hourCount = Math.floor(diff % (24 * 60 * 60 * 1000) / (60 * 60 * 1000));
    var minuteCount = Math.floor(diff % (60 * 60 * 1000) / (60 * 1000));
    var secondCount = Math.floor(diff % (60 * 1000) / (1000));
    var msCount = Math.floor(diff % (1000));

    var sentence = dayCount + " " + hourCount + " " + minuteCount + " " + secondCount + " " + msCount;
    document.getElementById("timer").innerHTML = sentence;
    var count = -1;
    if (diff <= 1) {
        document.getElementById("alive").style = "display: inline; word-wrap: break-word;";
        document.getElementById("alive").innerHTML = "";
        clearInterval(tick);
        var text = setInterval(function () {
            var chars = ['y', 'o', 'u', 'c', 'h', 'e', 'a', 't', 'e', 'd'];
            count++;
            document.getElementById("alive").innerHTML += chars[(count) % 10];
        }, 0.1);
    }
}, 1);
