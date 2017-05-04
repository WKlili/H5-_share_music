/**
 * Created by huangchen on 2017/5/4.
 */
var arrayid = [], audio, setintervalinner, offsetheightall = 0;

var app = new Vue({
    el: '#app',
    data: {
        resultsong: '',
        musicflag: 0,
        playurl: 'uploads/lhh.mp3',
        playimg: 'uploads/play.png',
        paused: '',
        playtime: '',
        song: [],
        thistimestr: '',
        margintopsong: '',
        tl : new TimelineMax({repeat:-1}),
    },
    methods: {
        playor: function () {
            var _this = this;
            //正在加载的状态；
            audio = document.getElementById("myAudio");
            if (_this.musicflag === 0) {
                _this.playimg = 'uploads/stop.png';
                audio.play();
                _this.tl.to(".round", 8, {rotation:'+=360',ease:Linear.easeNone});
                _this.tl.play();
                setintervalinner = setInterval(function () {
//                        TweenLite.to(".round", 2, {rotation:'+=50',repeat:-1});
                    _this.playtime = audio.currentTime;
                    if(audio.duration.toFixed(1) == audio.currentTime.toFixed(1)){
                        window.clearInterval(setintervalinner)
                        _this.playtime = 0;
                        _this.playimg = 'uploads/play.png';
                        audio.pause();
                        _this.tl.progress(0);
                        _this.tl.pause();
                        _this.musicflag = 0;
                        var songshowgeci = document.getElementById('songshowgeci');
//                            TweenLite.to(songshowgeci, 1, {scrollTo: 0});
                        offsetheightall = 0;
                        return
                    }
                }, 100)

                _this.musicflag = 1;
            } else {
                _this.tl.pause();
                window.clearInterval(setintervalinner);
                _this.playimg = 'uploads/play.png';
                audio.pause();
                _this.musicflag = 0;
            }
        },
//            处理歌词文件的function
        parseLyric: function (text) {
            var lines = text.split('\n'),
                pattern = /\[\d{2}:\d{2}.\d{2}\]/g,
                result = [];
            //去掉不含时间的行
            for (var i = 0; i < arrayid.length; i++) {
                var j = arrayid[i]
                var removeitem = lines.splice(j, 1)
            }
            console.log(lines)
            lines[lines.length - 1].length === 0 && lines.pop();
            lines.forEach(function (v /*数组元素值*/, i /*元素索引*/, a /*数组本身*/) {
                var time = v.match(pattern),
                    value = v.replace(pattern, '');
                time.forEach(function (v1, i1, a1) {
                    var t = v1.slice(1, -1).split(':');
                    result.push([parseInt(t[0], 10) * 60 + parseFloat(t[1]), value]);
                });
            });

            result.sort(function (a, b) {
                return a[0] - b[0];
            });
            this.resultsong = result;
            this.buildhtml(result)
            return result;
        },
//            将歌词文件填入html
        buildhtml: function (arr) {
            var _this = this;
            for (var i = 0; i < arr.length; i++) {
                _this.song.push(arr[i][1])
            }
            return;
        }
    },
    mounted: function () {
        var _this = this;
        _this.tl.pause();
        $.ajax({
            url: 'uploads/lhh.lrc',
            dataType: 'text',
            type: 'get',
            success: function (data) {
                var data = data.replace(/^\s+|\s+$/g, "");
                var newArr = data.replace(/\n/g, '\n<br/>');//匹配输出的歌词及时间
                var reg = /\[.[^*]*?\]/g;//匹配时间正则
                var time = newArr.match(reg);//已经 提取出来时间数组
                var jsonT = JSON.stringify(time);
                jsonT = JSON.parse(jsonT);
                for (var i = 0; i < jsonT.length; i++) {

                    var s = jsonT[i].indexOf(':');
                    var w = jsonT[i].indexOf('.');
                    if (s === -1 || w === -1) {
                        arrayid.push(i)
                    }
                }
                arrayid.reverse()
                _this.parseLyric(data);
            },
            error: function () {
                console.log('error');
            }
        });
    }
})

app.$watch('playtime', function () {
    var _this = this;
    for (var i = 0; i < _this.resultsong.length; i++) {
        if (_this.playtime.toFixed(0) == _this.resultsong[i][0].toFixed(0)) {
            var timestr = _this.resultsong[i][0].toString();
            _this.thistimestr = timestr;
        }
    }
})

app.$watch('thistimestr', function () {
    var _this = this;
    for (var i = 0; i < _this.resultsong.length; i++) {
        if (_this.playtime.toFixed(0) == _this.resultsong[i][0].toFixed(0)) {
            var timestr = _this.resultsong[i][0].toString();
            var time = '[data-time="' + timestr + '"]';
            $('#songshowgeci li').removeClass('gaoliang')
//                歌词高亮
            document.querySelectorAll(time)[0].className = 'songtime gaoliang';

            var offsetheight = document.querySelectorAll(time)[0].offsetHeight;
            if (offsetheight != 0) {
                _this.margintopsong = 'margin-top:' + offsetheight + 'px';
            }
            offsetheightall += offsetheight;
            var songshowgeci = document.getElementById('songshowgeci');
            TweenLite.to(songshowgeci, 1, {scrollTo: offsetheightall});
        }
    }
})