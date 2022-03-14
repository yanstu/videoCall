<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="Test.aspx.cs" Inherits="VideoConnectionWeb.Test" %>

<!DOCTYPE html>

<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <script src="js/jquery-3.2.1.min.js"></script>
    <script src="js/layui/layui.js"></script>
    <link href="js/layui/css/layui.css" rel="stylesheet" />
    <script src="Scripts/jquery.signalR-2.4.2.min.js"></script>
    <script src="signalr/hubs"></script>
    <title>测试signalr</title>
    <script>
        function ShowCount() {
            $("#labRedisSubscribeCallBackCount").html(RedisSubscribeCallBackCount);
            $("#labRedisSubscribeCallBackAllCount").html(RedisSubscribeCallBackAllCount);
            setTimeout(ShowCount, 1000);
        }
        var IsTestStart = false;
        var chat = "";
        $(function () {
            if (parent.TestStart) {
                IsTestStart = true;
            }
            setTimeout(ShowCount, 1000);
            //提供方法给服务端调用
            chat = $.connection.chatHub;
            chat.client.SetSignalRID = function (id) {
                $("#labSignalRID").html(id);
                if (IsTestStart) {
                    parent.SetSignalCount();
                }
            }
            chat.client.errorServer = function (name, msg) {
                if (name == "FBTimeOut") {
                    FBTimeOut++;
                    $("#labFBTimeOut").html(FBTimeOut);

                } else {
                    QTException++;
                    $("#labQTException").html(QTException);
                }
                var htmlStr = "<tr>";
                htmlStr += '<td>' + ($("#tabQTException tr").length + 1) + '</td>';
                htmlStr += '<td>' + name + '</td>';
                htmlStr += '<td>' + msg + '</td>';
                htmlStr += "</tr>";
                $("#tabServerException").append(htmlStr);
            }
            chat.client.broadcastMessage = function (message, channelss) {
                RedisSubscribeCallBackAllCount++;
                if (channelss == RoomId) {
                    RedisSubscribeCallBackCount++;
                    var mess = JSON.parse(message);
                    switch (mess.reCode) {
                        //设置主讲人
                        case '01':
                        case '20':

                            break;
                        //获取用户列表
                        case '14':

                            break;
                        //踢出用户
                        case '07':

                            break;
                        //关闭所有人麦克风
                        case '03':

                            break;
                        //获取会议缓存信息
                        case '12':
                            for (var i = 0; i < UserList.length; i++) {
                                if (mess.ReUserid == UserList[i].UserID) {
                                    UserList[i].HYCacheCount++;
                                }
                            }
                            break;
                        //获取消息 指定接收用户
                        case '09':

                            break;
                        //获取消息 所有人接收
                        case '08':

                            break;
                        //获取申请发言列表
                        case '19':

                            break;
                        //获取申请发言
                        case '10':

                            break;
                        //打开关闭摄像头
                        case '22':
                            for (var i = 0; i < UserList.length; i++) {
                                if (mess.ReUserid == UserList[i].UserID) {
                                    if (mess.Data.State == '1') {
                                        if (UserList[i].CameraState == 0) {
                                            UserList[i].CameraState = 1;
                                            ShowUserList();
                                        }
                                    } else {
                                        if (UserList[i].CameraState == 1) {
                                            UserList[i].CameraState = 0;
                                            ShowUserList();
                                        }
                                    }

                                }
                            }
                            break;
                        //打开关闭麦克风
                        case '23':
                            for (var i = 0; i < UserList.length; i++) {
                                if (mess.ReUserid == UserList[i].UserID) {
                                    if (mess.Data.State == '1') {
                                        if (UserList[i].MicState == 0) {
                                            UserList[i].MicState = 1;
                                            ShowUserList();
                                        }
                                    } else {
                                        if (UserList[i].MicState == 1) {
                                            UserList[i].MicState = 0;
                                            ShowUserList();
                                        }
                                    }

                                }
                            }
                            break;
                        //允许发言
                        case '18':

                            break;
                        //踢出所有用户
                        case '28':

                            break;
                        //取消主讲人
                        case '29':

                            break;
                    };
                }
            };
            //断开后处理
            $.connection.hub.disconnected(function () {
                setTimeout(function () {
                    console.log("断开尝试重新连接！");
                    $.connection.hub.start();
                }, 3000); //3秒后重新连接. 
            });


            //调用服务端方法
            $.connection.hub.start().done(function () {
                var HYID = getvl("HYID");
                var StartNum = getvl("StartNum");
                var EndNum = getvl("EndNum");
                if (HYID != "") {
                    $("#txtHYID").val(HYID);
                }
                if (StartNum != "") {
                    $("#txtUserIndexStart").val(StartNum);
                }
                if (EndNum != "") {
                    $("#txtUserIndexEnd").val(EndNum);
                }
                if (HYID != "" && StartNum != "" && EndNum != "") {
                    ClickStart();
                }
            });
        })

        function ClickStart() {

            if (LoginInfo == "") {
                ApiLogin();
            } else {
                FindVideoConferenceById();
            }
        }

        var WSLLZApiUrl = "https://wsllzapptest.gzshifang.com:8091/api/";
        WSLLZApiUrl = "https://testvideoapi.gzshifang.com:9011/api/";
        var LoginInfo = "";
        function ApiLogin(fn) {
            $.ajax({
                url: WSLLZApiUrl + "Login/Login",
                data: { LoginID: "贵州省管理员", Pwd: "atest2021llz", LX: "1" },
                "type": "post",
                dataType: "json",
                async: true,
                success: function (res) {
                    if (res != null) {
                        if (res.Code == 0) {
                            LoginInfo = res.Data;
                            FindVideoConferenceById(fn);
                        }
                        else {
                            alert(res.Msg);
                        }
                    }
                },
                error: function (res) {
                    console.error(res);
                }
            });
        }

        var RoomId = "";
        function FindVideoConferenceById(fn) {
            $.ajax({
                url: WSLLZApiUrl + "VideoConference/FindVideoConferenceById?ID=" + $("#txtHYID").val(),
                "type": "get",
                dataType: "json",
                async: true,
                beforeSend: function (XMLHttpRequest) {
                    XMLHttpRequest.setRequestHeader("Token", LoginInfo.Token);
                },
                success: function (res) {
                    if (res != null) {
                        if (res.Code == 0) {
                            //Redis订阅回调次数 当前房间的
                            RedisSubscribeCallBackCount = 0;
                            //所有房间的
                            RedisSubscribeCallBackAllCount = 0;

                            var VCModel = res.Data;

                            UserList = new Array();
                            RoomId = VCModel.VideoConference.RoomId;

                            chat.server.createRedis(RoomId);

                            var startIndex = Number($("#txtUserIndexStart").val());
                            var endIndex = Number($("#txtUserIndexEnd").val());
                            if (endIndex == -1) {
                                endIndex = VCModel.VideoConferenceCHRY.length - 1;
                            }
                            else {
                                if (endIndex >= VCModel.VideoConferenceCHRY.length) {
                                    endIndex = VCModel.VideoConferenceCHRY.length - 1;
                                }
                            }
                            $("title").html(VCModel.VideoConference.Title + "【" + startIndex + "-" + endIndex + "】");
                            for (var i = startIndex; i <= endIndex; i++) {
                                var tempID = VCModel.VideoConferenceCHRY[i].ID;
                                var tempName = VCModel.VideoConferenceCHRY[i].UserName;
                                var tempXUHAO = Number(VCModel.VideoConferenceCHRY[i].XUHAO);
                                var tempModel = {
                                    RoomId: RoomId,
                                    UserID: tempID,
                                    UserName: tempName,
                                    XUHAO: tempXUHAO,
                                    CameraState: 0,//摄像头打开状态 0关闭 1打开
                                    MicState: 0,//麦克风打开状态 0关闭 1打开
                                    HYCacheCount:0
                                };
                                UserList.push(tempModel);
                            }
                            ShowUserList();
                        }
                        else {
                            alert(res.Msg);
                        }
                    }
                },
                error: function (res) {
                    console.error(res);
                }
            });
        }

        var UserList = new Array();
        function ShowUserList() {
            $("#tabUserList").html("");
            var htmlStr = "";
            for (var i = 0; i < UserList.length; i++) {
                htmlStr += "<tr>";
                htmlStr += '<td>' + (i + 1) + '</td>';
                htmlStr += '<td>' + UserList[i].UserName + '</td>';
                htmlStr += '<td>' + (UserList[i].CameraState == 0 ? "已关闭" : "已打开") + '</td>';
                htmlStr += '<td>' + (UserList[i].MicState == 0 ? "已关闭" : "已打开") + '</td>';
                htmlStr += "</tr>";
            }
            $("#tabUserList").html(htmlStr);
            if (HeartBeatTime != "") {
                clearTimeout(HeartBeatTime);
            }
            HeartBeatTime = setTimeout(HeartBeat, 1000);
        }
        var HeartBeatTime = "";
        //心跳
        function HeartBeat() {
            for (var i = 0; i < UserList.length; i++) {
                var data1 = {
                    reCode: '25',
                    ReUserid: '',
                    ReUserQYBH: '',
                    ReUserName: '',
                    SendUserID: UserList[i].UserID,
                    SendUserName: UserList[i].UserName,
                    Content: "心跳",
                    Data: {
                        State: 0,
                        CameraState: UserList[i].CameraState,
                        MicState: UserList[i].MicState,
                    }
                }
                FBRedis(data1);
            }
            if (HeartBeatTime != "") {
                clearTimeout(HeartBeatTime);
            }
            HeartBeatTime = setTimeout(HeartBeat, 1000);
        }

        function FBRedis(data1) {
            var jsonStr = JSON.stringify(data1);
            try {
                //发布消息
                chat.server.redisFB(RoomId, jsonStr);
            } catch (err) {
                JSSignalrException++;
                $("#labJSSignalrException").html(JSSignalrException);
                debugger;
                var htmlStr = "<tr>";
                htmlStr += '<td>' + ($("#tabSignalrError tr").length + 1) + '</td>';
                htmlStr += '<td>' + getTime() + '</td>';
                htmlStr += '<td>' + err + '</td>';
                htmlStr += "</tr>";
                $("#tabSignalrError").append(htmlStr);
            }
        }

        //Redis订阅回调次数 当前房间的
        var RedisSubscribeCallBackCount = 0;

        //Redis订阅回调次数 所有房间的
        var RedisSubscribeCallBackAllCount = 0;

        //发布超时次数
        var FBTimeOut = 0;

        //其他异常
        var QTException = 0;
        var JSSignalrException = 0;
        function getTime() {
            var date = new Date();
            this.year = date.getFullYear();
            this.month = date.getMonth() + 1;
            this.date = date.getDate();
            this.hour = date.getHours() < 10 ? "0" + date.getHours() : date.getHours();
            this.minute = date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes();
            this.second = date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds();
            this.milliSeconds = date.getMilliseconds();
            /*var currentTime = this.year + '-' + this.month + '-' + this.date + ' ' + this.hour + ':' + this.minute + ':' + this.second + '.' + this.milliSeconds;*/
            var currentTime = this.hour + ':' + this.minute + ':' + this.second + '.' + this.milliSeconds;
            return currentTime;
        };

        function fillZero(str) {
            var realNum;
            if (str < 10) {
                realNum = '0' + str;
            } else {
                realNum = str;
            }
            return realNum;
        }

        function getvl(name) {
            var reg = new RegExp("(^|\\?|&)" + name + "=([^&]*)(\\s|&|$)", "i");
            if (reg.test(location.href)) return unescape(RegExp.$2.replace(/\+/g, " "));
            return "";
        };
        function ClickServerTest() {
            chat.server.startTest();
        }
         //获取会议缓存
        function ClickGetHYCache() {
            for (var i = 0; i < UserList.length; i++) {
                var data1 = {
                    reCode: '25',
                    ReUserid: '',
                    ReUserQYBH: '',
                    ReUserName: getTime(),
                    SendUserID: UserList[i].UserID,
                    SendUserName: UserList[i].UserName,
                    Content: "",
                    Data: {}
                }
                FBRedis(data1);
            }
        }
    </script>
</head>
<body>
    <div style="margin-top: 10px;">
        用户开始下标：<input id="txtUserIndexStart" type="number" class="layui-input" style="width: 60px; display: inline-block;" value="0" />
        &nbsp;&nbsp;&nbsp;&nbsp;用户截止下标：<input id="txtUserIndexEnd" type="number" class="layui-input" style="width: 60px; display: inline-block;" value="-1" />
        &nbsp;&nbsp;&nbsp;&nbsp;会议ID：<input id="txtHYID" type="text" class="layui-input" style="width: 150px; display: inline-block;" value="5cfe3341245a4b5789bb6552e79e9b3d" />
        <button class="layui-btn" onclick="ClickStart()">开始</button>
        &nbsp;&nbsp;&nbsp;&nbsp;连接SignalR的ID：<label id="labSignalRID"></label>
       <%-- <button class="layui-btn" onclick="ClickServerTest()">服务端测试</button>--%>
         <button class="layui-btn" onclick="ClickGetHYCache()">获取会议缓存</button>
    </div>
    <div style="margin-top: 10px;">
        所有房间回调次数：<label id="labRedisSubscribeCallBackAllCount"></label>
        &nbsp;&nbsp;&nbsp;&nbsp;当前房间回调次数：<label id="labRedisSubscribeCallBackCount"></label>
        &nbsp;&nbsp;&nbsp;&nbsp;服务端发布超时次数：<label id="labFBTimeOut"></label>
        &nbsp;&nbsp;&nbsp;&nbsp;其他异常服务端异常：<label id="labQTException"></label>
        &nbsp;&nbsp;&nbsp;&nbsp;JS Signalr调用服务端异常：<label id="labJSSignalrException"></label>
    </div>
    <div>
        <div id="divUserList" style="height: 600px; width: 600px; overflow-y: auto; display: inline-block; margin-top: 20px;">
            <table class="layui-table">
                <thead>
                    <tr>
                        <th style="width: 40px;">序号</th>
                        <th>姓名</th>
                        <th>摄像头</th>
                        <th>麦克风</th>
                        <th>获取会议缓存次数</th>
                    </tr>
                </thead>
                <tbody id="tabUserList">
                </tbody>
            </table>
        </div>
        <div id="" style="height: 600px; width: 600px; overflow-y: auto; display: inline-block; margin-top: 20px;">
            <div>Redis 服务端发布异常记录</div>
            <table class="layui-table">
                <thead>
                    <tr>
                        <th style="width: 40px;">序号</th>
                        <th>时间</th>
                        <th>异常信息</th>
                    </tr>
                </thead>
                <tbody id="tabServerException">
                </tbody>
            </table>
        </div>
        <div id="" style="height: 600px; width: 600px; overflow-y: auto; display: inline-block; margin-top: 20px;">
            <div>JS Signalr发布异常记录</div>
            <table class="layui-table">
                <thead>
                    <tr>
                        <th style="width: 40px;">序号</th>
                        <th>时间</th>
                        <th>异常信息</th>
                    </tr>
                </thead>
                <tbody id="tabSignalrError">
                </tbody>
            </table>
        </div>
    </div>
</body>
</html>
