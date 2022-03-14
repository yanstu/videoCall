/* eslint-disable no-cond-assign */
/* global $ TRTC presetting RtcClient ShareClient */
/* eslint-disable require-jsdoc */
let isCamOn = true;
let isMicOn = true;
let isScreenOn = false;
let isJoined = true;
let rtc = null;
let share = null;
let shareUserId = '';
let cameraId = '';
let micId = '';
let isShowUser = false;
let isShowMessage = false;
let isShowSQFY = false;
let isShowSZ = false;
let isShowMean = false;
var cameraData = new Array();
var micData = new Array();
let isIndexBtn = false;

function login() {
    if ($('#userId').val() == '') {
        alert('用户名不能为空！');
        return;
    }
    if ($('#roomId').val() == '') {
        alert('房间号不能为空！');
        return;
    }
    if ($('#IsZCR').val()) {
        $('#sqfy_div').hide();
    } else {
        $('#sqfylb_div').hide();
        $('#allmic_div').hide();
    }
    AddAllUserToUserList();
    presetting.login(false, options => {
        options.isIndexBtn = isIndexBtn;
        rtc = new RtcClient(options);
        join();
    });
    presetting.login(true, options => {
        shareUserId = options.userId;
        share = new ShareClient(options);
    });
}
function join() {
    rtc.join();
    var userobj = getUserObjByID($('#userId').val());
    $('#member-me')
        .find('.member-id')
        .attr('title', userobj.UserName);
    $('#member-me')
        .find('.member-id')
        .html(userobj.UserName);
}
//将所有用户添加到用户列表
function AddAllUserToUserList() {
    var listnum = UserList.length;
    //大于四个更新小视频页面
    if (listnum > 4) {
        $("#bottom_mean").css('bottom', '30%');
        $("#video-grid2").css('height', '70%');
        $("#video-grid").css('height', '30%');
        $("#video-grid").css('grid-template-rows', 'repeat(2, 50%)');
        $("#video-grid").css('grid-template-areas', "'m m ' 'a b ' ");
    } else {
        $("#bottom_mean").css('bottom', '15%');
        $("#video-grid2").css('height', '85%');
        $("#video-grid").css('height', '15%');
        $("#video-grid").css('grid-template-rows', 'repeat(1, 100%)');
        $("#video-grid").css('grid-template-areas', "'m m '");
    }
    for (var i = 0; i < UserList.length; i++) {
        if (UserList[i].ID == $('#userId').val()) {
            continue;
        }
        let memberElm = $('#member-me2').clone();
        memberElm.attr('id', UserList[i].ID);
        memberElm.attr('title', UserList[i].UserName);
        memberElm.find('text.member-id').html(UserList[i].UserName);
        memberElm.css('display', 'flex');
        memberElm.appendTo($('#member-list'));
    }
}
//用户加入房间
function SetUserLine(userid) {
    $('#' + userid).find('text.member-id').css('color', 'green');
}

//发送消息设置主讲人
function ClickZCR(id) {
    $("#sendUserIDforZJR").val(id);
    $("#SetZJR").click();
}
//允许发言
function YX_btn(id) {
    $("#sendUserIDforZJR").val(id);
    $("#SetZJR").click();
    $("#SetYX").click();
}
//关闭发言
function GB_btn(id) {
    $("#sq_" + id).remove();
}
//发送消息
function ClickMessgeForOne(id) {
    $("#SendMessID").val(id);
    $('#message-box').show();
    isShowMessage = true;
}
//发送消息关闭某人
function ClickClose(id) {
    $("#sendUserIDforTC").val(id);
    $("#OutOne").click();
}

function leave() {
    if (rtc != null) {
        rtc.leave();
        share.leave();
    }
}

function muteAudio() {
    rtc.muteLocalAudio();
}

function unmuteAudio() {
    rtc.unmuteLocalAudio();
}

function muteVideo() {
    rtc.muteLocalVideo();
}

function unmuteVideo() {
    rtc.unmuteLocalVideo();
}

//绑定当前页用户
function BDuser(userstart, userend) {
    for (var i = 0; i < userlistlength; i++) {
        $('#small-div' + i).hide();
    }
    //绑定当前页用户信息
    for (var j = 0; j < userend; j++) {
        $('#small-div' + j).show();
        var smallid = '#small-div' + j;
        //更改用户姓名和id
        let showusernameid = $(smallid).find('div.showUserNameOther');
        showusernameid[0].id = "showUserName" + UserList[userstart].ID;
        let testid = $('#' + showusernameid[0].id).find('text.loaddiv');
        testid[0].textContent = UserList[userstart].UserName;
        testid[0].title = UserList[userstart].UserName;
        //更改麦克风ID
        let micid = $('#' + showusernameid[0].id).find('div.user_0');
        micid[0].id = "user" + UserList[userstart].ID;
        //判断是否订阅
        JudgeSubscribeStream(UserList[userstart].ID);
        userstart++;
    }
    //取消订阅所有流
    rtc.UNSubscribeTheStream();
}

//翻页  pagenumber页数
function NextPage(pagenumber) {
    if ((pagenumber > userPage) || (pagenumber == 1)) {
        pagenumber = 1;
        BDuser(0, userlistlength);
    } else if (pagenumber == userPage) {
        BDuser(((userPage - 1) * 8), remainderPage);
    } else {
        BDuser((pagenumber * 8), 8);
    }
}

//判断是否订阅远端流
function JudgeSubscribeStream(userid) {
    var divid = GetStreamDiv(userid);
    if (divid != 'no' || $('#sendUserIDforZJR').val() == userid) {
        rtc.SubscribeTheStream(userid, divid);
    }
}

//获取userid对应的div位置
function GetStreamDiv(userid) {
    for (var j = 0; j < userlistlength; j++) {
        var smallid = '#small-div' + j;
        let showusernameid = $(smallid).find('div.showUserNameOther');
        if (showusernameid[0].id == "showUserName" + userid) {
            return 'small-div' + j;
        }
    }
    return 'no';
}

//修改主讲人麦克风和信息
function ChangeZJRxx(userid) {
    var userobj = getUserObjByID(userid);
    let testid = $('#showMain').find('text.loaddiv');
    testid[0].textContent = userobj.UserName;
    testid[0].title = userobj.UserName;
    let micid = $('#showMain').find('div.user_0');
    micid[0].id = "user" + userid;
}

//绑定点击事件
function setBtnClickFuc() {
    $('#roomId').on('input', function (e) {
        let val = $('#roomId').val();
        $('#roomId').val(val.replace(/[^\d]/g, ''));
    });
    login();
    //关闭所有浮动窗口
    $('#hidebtn').click(() => {
        $('#userLB').hide();
        isShowUser = false;
        $('#SQFYLB').hide();
        isShowSQFY = false;
        $('#message-box').hide();
        isShowMessage = false;
        $('#SZLB').hide();
        isShowSZ = false;
    });
    //显示/关闭菜单
    $('#mean_btn').click(() => {
        if (isShowMean) {
            $('#bottom_mean').hide();
            isShowMean = false;
            $('#userLB').hide();
            isShowUser = false;
            $('#message-box').hide();
            isShowMessage = false;
            $('#SQFYLB').hide();
            isShowSQFY = false;
            $("#SendMessID").val("");
        } else {
            $('#bottom_mean').show();
            isShowMean = true;
        }
    });
    //打开/关闭摄像头
    $('#video-btn').on('click', () => {
        if (isCamOn) {
            $('#video-btn').attr('src', './img/trtcmeeting_ic_camera_off.png');
            $('#member-me')
                .find('.member-video-btn')
                .attr('src', 'img/camera-off.png');
            isCamOn = false;
            muteVideo();
        } else {
            $('#video-btn').attr('src', './img/trtcmeeting_ic_camera_on.png');
            $('#member-me')
                .find('.member-video-btn')
                .attr('src', 'img/camera-on.png');
            isCamOn = true;
            unmuteVideo();
        }
        $("#OpenVideo").click();
    });
    //关闭所有人麦克风
    $('#Allmic_btn').on('click', () => {
        $('#CloseAllmic').click();
    });
    //展示设置列表
    $('#SetMean').on('click', () => {
        if (isShowSZ) {
            $('#SZLB').hide();
            isShowSZ = false;
        } else {
            $('#userLB').hide();
            isShowUser = false;
            $('#SQFYLB').hide();
            isShowSQFY = false;
            $('#message-box').hide();
            isShowMessage = false;
            $('#SZLB').show();
            isShowSZ = true;
        }
    });
    //发送消息
    $('#fsmess_btn').on('click', () => {
        if ($("#inputmess").val() != "") {
            $("#SendMess").click();
        }
    });
    //申请发言
    $('#ApplicationSpeech').on('click', () => {
        $('#sendUserIDforSQFY').val($('#userId').val());
        $("#sendUserNAMEforSQFY").val($('#member-me').find('.member-id').text());
        $("#SendApplication").click();
    });
    //展示申请发言列表
    $('#ApplicationSpeechList').on('click', () => {
        if (isShowSQFY) {
            $('#SQFYLB').hide();
            isShowSQFY = false;
        } else {
            $('#SQFYLB').show();
            isShowSQFY = true;
            $('#userLB').hide();
            isShowUser = false;
            $('#message-box').hide();
            isShowMessage = false;
            $('#SZLB').hide();
            isShowSZ = false;
        }
    });
    //展示参与者列表
    $('#show-user').on('click', () => {
        if (isShowUser) {
            $('#userLB').hide();
            isShowUser = false;
        } else {
            $('#userLB').show();
            isShowUser = true;
            $('#SQFYLB').hide();
            isShowSQFY = false;
            $('#message-box').hide();
            isShowMessage = false;
            $('#SZLB').hide();
            isShowSZ = false;
        }
    });
    //展示消息
    $('#message-btn').on('click', () => {
        if (isShowMessage) {
            $('#message-box').hide();
            isShowMessage = false;
            $("#SendMessID").val("");
        } else {
            $('#message-box').show();
            isShowMessage = true;
            $("#SendMessID").val("");
            $('#userLB').hide();
            isShowUser = false;
            $('#SQFYLB').hide();
            isShowSQFY = false;
            $('#SZLB').hide();
            isShowSZ = false;
        }
    });
    //打开/关闭麦克风
    $('#mic-btn').on('click', () => {
        if (isMicOn) {
            $('#mic-btn').attr('src', './img/trtcmeeting_ic_meeting_mic_off.png');
            $('#member-me')
                .find('.member-audio-btn')
                .attr('src', 'img/mic-off.png');
            isMicOn = false;
            muteAudio();
        } else {
            $('#mic-btn').attr('src', './img/trtcmeeting_ic_mic_on.png');
            $('#member-me')
                .find('.member-audio-btn')
                .attr('src', 'img/mic-on.png');

            $('#user' + shareUserId)
                .find('.member-audio-btn')
                .attr('src', 'img/mic-on.png');
            isMicOn = true;
            unmuteAudio();
        }
        $('#OpenMic').click();
    });
}

//用户离开房间
function removeView(userid) {
    if ($('#' + userid)[0]) {
        var smallid = GetStreamDiv(userid);
        if (smallid != 'no') {
            //展示未登录时的遮罩
            $('#' + smallid).find('div#mask_1').show();
        }
    }
    $('#' + userid).find('text.member-id').css('color', '');
}

function getCameraId() {
    return cameraId;
}

function getMicrophoneId() {
    return micId;
}

// 判断字符串是否为空
function IsNullOrEmptyOrUndefined(value) {
    var result = false;
    if (value === null || value === "" || typeof (value) === "undefined" || typeof (value) === "string") {
        result = true;
    } else {
        result = false;
    }
    return result;
}
//移除View
function resetView() {
    isCamOn = true;
    isMicOn = true;
    isScreenOn = false;
    isJoined = true;
    $('#video-btn').attr('src', './img/trtcmeeting_ic_camera_on.png');
    $('#mic-btn').attr('src', './img/trtcmeeting_ic_mic_on.png');
    $('#screen-btn').attr('src', './img/screen-off.png');
    $('#member-me')
        .find('.member-video-btn')
        .attr('src', 'img/camera-on.png');
    $('#member-me')
        .find('.member-audio-btn')
        .attr('src', 'img/mic-on.png');
    $('.mask').hide();
    //清空member-list
    //if ($('#member-list')) {
    //    $('#member-list')
    //        .find('.member')
    //        .each((index, element) => {
    //            if (
    //                $(element)
    //                    .parent()
    //                    .attr('id') != 'member-me'
    //            ) {
    //                $(element)
    //                    .parent()
    //                    .remove();
    //            }
    //        });
    //}
}

function getBrowser() {
    var sys = {};
    var ua = navigator.userAgent.toLowerCase();
    var s;
    (s = ua.match(/edge\/([\d.]+)/))
        ? (sys.edge = s[1])
        : (s = ua.match(/rv:([\d.]+)\) like gecko/))
            ? (sys.ie = s[1])
            : (s = ua.match(/msie ([\d.]+)/))
                ? (sys.ie = s[1])
                : (s = ua.match(/firefox\/([\d.]+)/))
                    ? (sys.firefox = s[1])
                    : (s = ua.match(/tbs\/([\d]+)/))
                        ? (sys.tbs = s[1])
                        : (s = ua.match(/xweb\/([\d]+)/))
                            ? (sys.xweb = s[1])
                            : (s = ua.match(/chrome\/([\d.]+)/))
                                ? (sys.chrome = s[1])
                                : (s = ua.match(/opera.([\d.]+)/))
                                    ? (sys.opera = s[1])
                                    : (s = ua.match(/version\/([\d.]+).*safari/))
                                        ? (sys.safari = s[1])
                                        : 0;

    if (sys.xweb) return { browser: 'webView XWEB', version: '' };
    if (sys.tbs) return { browser: 'webView TBS', version: '' };
    if (sys.edge) return { browser: 'Edge', version: sys.edge };
    if (sys.ie) return { browser: 'IE', version: sys.ie };
    if (sys.firefox) return { browser: 'Firefox', version: sys.firefox };
    if (sys.chrome) return { browser: 'Chrome', version: sys.chrome };
    if (sys.opera) return { browser: 'Opera', version: sys.opera };
    if (sys.safari) return { browser: 'Safari', version: sys.safari };

    return { browser: '', version: '0' };
}

function isHidden() {
    var hidden, visibilityChange;
    if (typeof document.hidden !== 'undefined') {
        hidden = 'hidden';
        visibilityChange = 'visibilitychange';
    } else if (typeof document.msHidden !== 'undefined') {
        hidden = 'msHidden';
        visibilityChange = 'msvisibilitychange';
    } else if (typeof document.webkitHidden !== 'undefined') {
        hidden = 'webkitHidden';
        visibilityChange = 'webkitvisibilitychange';
    }
    return document[hidden];
}

function getIPAddress() {
    return new Promise(resolve => {
        window.RTCPeerConnection =
            window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection; //compatibility for firefox and chrome
        let pc = new RTCPeerConnection({ iceServers: [] });
        let noop = function () { };
        let IPAddress = '';
        let ipRegex = /([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/;
        pc.createDataChannel(''); //create a bogus data channel
        pc.createOffer(pc.setLocalDescription.bind(pc), noop); // create offer and set local description
        //listen for candidate events
        pc.onicecandidate = function (ice) {
            if (
                !ice ||
                !ice.candidate ||
                !ice.candidate.candidate ||
                !ipRegex.exec(ice.candidate.candidate)
            ) {
                return;
            }
            IPAddress = ipRegex.exec(ice.candidate.candidate)[1];
            pc.onicecandidate = noop;
            resolve(IPAddress);
        };
    });
}
let isMobile = {
    Android: function () {
        return navigator.userAgent.match(/Android/i);
    },
    BlackBerry: function () {
        return navigator.userAgent.match(/BlackBerry|BB10/i);
    },
    iOS: function () {
        return navigator.userAgent.match(/iPhone|iPad|iPod/i);
    },
    Opera: function () {
        return navigator.userAgent.match(/Opera Mini/i);
    },
    Windows: function () {
        return navigator.userAgent.match(/IEMobile/i);
    },
    any: function () {
        return (
            isMobile.Android() ||
            isMobile.BlackBerry() ||
            isMobile.iOS() ||
            isMobile.Opera() ||
            isMobile.Windows()
        );
    },
    getOsName: function () {
        var osName = 'Unknown OS';
        if (isMobile.Android()) {
            osName = 'Android';
        }
        if (isMobile.BlackBerry()) {
            osName = 'BlackBerry';
        }
        if (isMobile.iOS()) {
            osName = 'iOS';
        }
        if (isMobile.Opera()) {
            osName = 'Opera Mini';
        }
        if (isMobile.Windows()) {
            osName = 'Windows';
        }
        return {
            osName,
            type: 'mobile'
        };
    }
};
function detectDesktopOS() {
    var unknown = '-';
    var nVer = navigator.appVersion;
    var nAgt = navigator.userAgent;
    var os = unknown;
    var clientStrings = [
        {
            s: 'Chrome OS',
            r: /CrOS/
        },
        {
            s: 'Windows 10',
            r: /(Windows 10.0|Windows NT 10.0)/
        },
        {
            s: 'Windows 8.1',
            r: /(Windows 8.1|Windows NT 6.3)/
        },
        {
            s: 'Windows 8',
            r: /(Windows 8|Windows NT 6.2)/
        },
        {
            s: 'Windows 7',
            r: /(Windows 7|Windows NT 6.1)/
        },
        {
            s: 'Windows Vista',
            r: /Windows NT 6.0/
        },
        {
            s: 'Windows Server 2003',
            r: /Windows NT 5.2/
        },
        {
            s: 'Windows XP',
            r: /(Windows NT 5.1|Windows XP)/
        },
        {
            s: 'Windows 2000',
            r: /(Windows NT 5.0|Windows 2000)/
        },
        {
            s: 'Windows ME',
            r: /(Win 9x 4.90|Windows ME)/
        },
        {
            s: 'Windows 98',
            r: /(Windows 98|Win98)/
        },
        {
            s: 'Windows 95',
            r: /(Windows 95|Win95|Windows_95)/
        },
        {
            s: 'Windows NT 4.0',
            r: /(Windows NT 4.0|WinNT4.0|WinNT|Windows NT)/
        },
        {
            s: 'Windows CE',
            r: /Windows CE/
        },
        {
            s: 'Windows 3.11',
            r: /Win16/
        },
        {
            s: 'Android',
            r: /Android/
        },
        {
            s: 'Open BSD',
            r: /OpenBSD/
        },
        {
            s: 'Sun OS',
            r: /SunOS/
        },
        {
            s: 'Linux',
            r: /(Linux|X11)/
        },
        {
            s: 'iOS',
            r: /(iPhone|iPad|iPod)/
        },
        {
            s: 'Mac OS X',
            r: /Mac OS X/
        },
        {
            s: 'Mac OS',
            r: /(MacPPC|MacIntel|Mac_PowerPC|Macintosh)/
        },
        {
            s: 'QNX',
            r: /QNX/
        },
        {
            s: 'UNIX',
            r: /UNIX/
        },
        {
            s: 'BeOS',
            r: /BeOS/
        },
        {
            s: 'OS/2',
            r: /OS\/2/
        },
        {
            s: 'Search Bot',
            r: /(nuhk|Googlebot|Yammybot|Openbot|Slurp|MSNBot|Ask Jeeves\/Teoma|ia_archiver)/
        }
    ];
    for (var i = 0, cs; (cs = clientStrings[i]); i++) {
        if (cs.r.test(nAgt)) {
            os = cs.s;
            break;
        }
    }
    var osVersion = unknown;
    if (/Windows/.test(os)) {
        if (/Windows (.*)/.test(os)) {
            osVersion = /Windows (.*)/.exec(os)[1];
        }
        os = 'Windows';
    }
    switch (os) {
        case 'Mac OS X':
            if (/Mac OS X (10[/._\d]+)/.test(nAgt)) {
                // eslint-disable-next-line no-useless-escape
                osVersion = /Mac OS X (10[\.\_\d]+)/.exec(nAgt)[1];
            }
            break;
        case 'Android':
            // eslint-disable-next-line no-useless-escape
            if (/Android ([\.\_\d]+)/.test(nAgt)) {
                // eslint-disable-next-line no-useless-escape
                osVersion = /Android ([\.\_\d]+)/.exec(nAgt)[1];
            }
            break;
        case 'iOS':
            if (/OS (\d+)_(\d+)_?(\d+)?/.test(nAgt)) {
                osVersion = /OS (\d+)_(\d+)_?(\d+)?/.exec(nVer);
                osVersion = osVersion[1] + '.' + osVersion[2] + '.' + (osVersion[3] | 0);
            }
            break;
    }
    return {
        osName: os + osVersion,
        type: 'desktop'
    };
}
function getOS() {
    if (isMobile.any()) {
        return isMobile.getOsName();
    } else {
        return detectDesktopOS();
    }
}
