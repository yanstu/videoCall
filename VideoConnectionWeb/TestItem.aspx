<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="TestItem.aspx.cs" Inherits="VideoConnectionWeb.TestItem" %>

<!DOCTYPE html>

<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <script src="js/jquery-3.2.1.min.js"></script>
    <script src="js/layui/layui.js"></script>
    <link href="js/layui/css/layui.css" rel="stylesheet" />
    <script src="Scripts/jquery.signalR-2.4.2.min.js"></script>
    <script src="signalr/hubs"></script>
    <title>测试单个用户</title>
    <script>

        function ShowCount() {
            $("#labRedisSubscribeCallBackCount").html(RedisSubscribeCallBackCount);
            $("#labRedisSubscribeCallBackAllCount").html(RedisSubscribeCallBackAllCount);
            setTimeout(ShowCount, 1000);
        }
        var IsTestStart = false;
        var chat = "";
        var HeartBeatEndCount = 0;
        $(function () {
            RoomId = getvl("RoomId");
            UserID = getvl("UserID");
            UserName = getvl("UserName");
            XUHAO = getvl("XUHAO");
            UserIndex = getvl("UserIndex");

            $("title").html(RoomId + "-" + UserIndex);
            $("#labUserName").html(UserName);
            $("#labXUHAO").html(XUHAO);

            if (parent.TestStart) {
                IsTestStart = true;
            }
            setTimeout(ShowCount, 1000);

            //提供方法给服务端调用
            chat = $.connection.chatHub;
            chat.client.setHeartBeatCountStart = function (time) {

            }
            chat.client.setHeartBeatEnd = function (timeStart, timeEnd, calc) {
                HeartBeatEndCount++;
                var htmlStr = "<tr>";
                htmlStr += '<td>' + HeartBeatEndCount + '</td>';
                htmlStr += '<td>【' + timeStart + " - " + timeEnd + '】用时：' + calc + '</td>';
                htmlStr += "</tr>";
                $("#tabHeartBeatLog").append(htmlStr);
            }
            chat.client.setSignalRID = function (id) {
                $("#labSignalRID").html(id);
                if (IsTestStart) {
                    parent.SetSignalState(UserIndex, 1);
                }
            }

            chat.client.errorFBTimeOut = function (name, msg) {
                FBTimeOut++;
                $("#labFBTimeOut").html(FBTimeOut);
                if (IsTestStart) {
                    parent.SetFBTimeOut(UserIndex);
                }
                var htmlStr = "<tr>";
                htmlStr += '<td>' + ($("#tabQTException tr").length + 1) + '</td>';
                htmlStr += '<td>' + name + '</td>';
                htmlStr += '<td>' + msg + '</td>';
                htmlStr += "</tr>";
                $("#tabServerException").append(htmlStr);
            }
            chat.client.errorServer = function (name, msg) {
                QTException++;
                $("#labQTException").html(QTException);
                if (IsTestStart) {
                    parent.SetServerException(UserIndex);
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
                    var mess = "";
                    try {
                        mess = JSON.parse(message);
                    } catch (err) {
                        JSSignalrExceptionLog('broadcastMessage:出错' + err + '（message：' + message + '）');
                        return;
                    }
                    switch (mess.reCode) {
                        //设置主讲人
                        case '01':
                        case '20':
                            parent.SetZJR(UserIndex, mess.ReUserid);
                            break;
                        //获取用户列表
                        case '14':
                            parent.SetUserListCount(UserIndex, mess.Data.UserList.length);
                            break;
                        //踢出用户
                        case '07':
                            if (mess.ReUserid == UserID) {
                                parent.SetUserOut(UserIndex);
                                window.location.href = "about:blank";
                            }
                            break;
                        //关闭所有人麦克风
                        case '03':
                            MicState = 0;
                            ShowUserState();
                            parent.SetMicState(UserIndex, 0);
                            break;
                        //获取会议缓存信息
                        case '12':
                            if (mess.ReUserid == UserID) {
                                parent.SetGetHYCache(UserIndex);
                            }
                            break;
                        //获取消息 指定接收用户
                        case '09':
                            if (mess.ReUserid == UserID) {
                                parent.SetMessage(UserIndex, getTime(), mess.SendUserName, mess.Content);
                            }
                            break;
                        //获取消息 所有人接收
                        case '08':
                            parent.SetMessage(UserIndex, getTime(), mess.SendUserName, mess.Content);
                            break;
                        //获取申请发言列表
                        case '19':

                            break;
                        //获取申请发言
                        case '10':

                            break;
                        //打开关闭摄像头
                        case '22':
                            if (mess.ReUserid == UserID) {
                                if (mess.Data.State == '1') {
                                    if (CameraState == 0) {
                                        CameraState = 1;
                                        ShowUserState();
                                        parent.SetCameraState(UserIndex, CameraState);
                                    }
                                } else {
                                    if (CameraState == 1) {
                                        CameraState = 0;
                                        ShowUserState();
                                        parent.SetCameraState(UserIndex, CameraState);
                                    }
                                }
                            }
                            break;
                        //打开关闭麦克风
                        case '23':
                            if (mess.ReUserid == UserID) {
                                if (mess.Data.State == '1') {
                                    if (MicState == 0) {
                                        MicState = 1;
                                        ShowUserState();
                                        parent.SetMicState(UserIndex, MicState);
                                    }
                                } else {
                                    if (MicState == 1) {
                                        MicState = 0;
                                        ShowUserState();
                                        parent.SetMicState(UserIndex, MicState);
                                    }
                                }
                            }
                            break;
                        //允许发言
                        case '18':
                            parent.SetYXFY(UserIndex, mess.Data.State);
                            break;
                        //踢出所有用户
                        case '28':
                            parent.SetUserOut(UserIndex);
                            window.location.href = "about:blank";
                            break;
                        //取消主讲人
                        case '29':
                            parent.SetQXZJR(UserIndex);
                            break;
                    };
                }
            };

            //断开后处理
            $.connection.hub.disconnected(function () {
                setTimeout(function () {
                    JSSignalrExceptionLog(UserName + "：断开尝试重新连接！");
                    $.connection.hub.start();
                }, 3000); //3秒后重新连接. 
            });

            var hubP = {
                transport: ['webSockets', 'serverSentEvents', 'longPolling', 'foreverFrame']
            };
            HubStart(hubP);
        })

        function HubStart(hubP) {
            //调用服务端方法
            $.connection.hub.start(hubP).done(function () {
                chat.server.createRedis(RoomId);
                if (HeartBeatTime != "") {
                    clearTimeout(HeartBeatTime);
                }
                HeartBeatTime = setTimeout(HeartBeat, 1000);
                GetHYCache();
            }).fail(function (r) {
                JSSignalrExceptionLog(UserName + "：连接失败！" + r);
                setTimeout(HubStart, 3000); //3秒后重新连接.
            });
        }

        var UserIndex = "";
        var RoomId = "";
        var UserID = "";
        var UserName = "";
        var XUHAO = "";

        var CameraState = 0;
        var MicState = 0;

        var HeartBeatTime = "";

        var HeartBeatCountStart = 0;
        var HeartBeatCountEnd = 0;
        //心跳
        function HeartBeat() {
            var data1 = {
                reCode: '25',
                ReUserid: '',
                ReUserQYBH: '',
                ReUserName: "【网页时间：】"+getTime(),
                SendUserID: UserID,
                SendUserName: UserName,
                Content: "心跳",
                Data: {
                    State: 0,
                    CameraState: CameraState,
                    MicState: MicState,
                }
            }
            FBRedis(data1, function () {
                if (HeartBeatTime != "") {
                    clearTimeout(HeartBeatTime);
                }
                HeartBeatTime = setTimeout(HeartBeat, 1400);
            });
            HeartBeatCount++;
            $("#labHeartBeatCount").html(HeartBeatCount);
          
        }
        var HeartBeatCount = 0;
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

        function ShowUserState() {
            if (CameraState == 0) {
                $("#labCameraState").html("已关闭");
            } else {
                $("#labCameraState").html("已打开");
            }

            if (MicState == 0) {
                $("#labMicState").html("已关闭");
            } else {
                $("#labMicState").html("已打开");
            }
        }

        var IsLog = false;

        function CboLogChange() {
            if ($("#cboLog").is(':checked')) {
                IsLog = true;
            } else {
                IsLog = false;
            }
        }
        //发布redis信息
        function FBRedis(data, fn) {
            var jsonStr = JSON.stringify(data);
            try {
                if (IsLog) {
                    console.log(UserName + "发布日志：" + jsonStr);
                }
                //发布消息
                chat.server.redisFB(RoomId, jsonStr);
                if (fn) {
                    fn();
                }
            } catch (err) {
                JSSignalrExceptionLog(err);
                if (fn) {
                   fn();
                }
            }
        }

        function JSSignalrExceptionLog(err) {
            JSSignalrException++;
            $("#labJSSignalrException").html(JSSignalrException);
            if (IsTestStart) {
                parent.SetJSSignalrException(UserIndex);
            }
            var htmlStr = "<tr>";
            htmlStr += '<td>' + ($("#tabSignalrError tr").length + 1) + '</td>';
            htmlStr += '<td>' + getTime() + '</td>';
            htmlStr += '<td>' + err + '</td>';
            htmlStr += "</tr>";
            $("#tabSignalrError").append(htmlStr);
        }

        //获取会议缓存
        function GetHYCache() {
            var data1 = {
                reCode: '11',
                ReUserid: '',
                ReUserQYBH: '',
                ReUserName: getTime(),
                SendUserID: UserID,
                SendUserName: UserName,
                Content: "",
                Data: {}
            }
            //console.log(UserName + "发布获取会议缓存：SendUserName:" + data1.SendUserName + " SendUserID:" + data1.SendUserID);
            FBRedis(data1);
        }

        //申请发言
        function SQFY() {
            var data1 = {
                reCode: '10',
                ReUserid: UserID,
                ReUserQYBH: '',
                ReUserName: '',
                SendUserID: UserID,
                SendUserName: UserName,
                Content: "",
                Data: {}
            }
            FBRedis(data1);
        }

        function GetMessageList() {
            var data1 = {
                reCode: '10',
                ReUserid: UserID,
                ReUserQYBH: '',
                ReUserName: '',
                SendUserID: UserID,
                SendUserName: UserName,
                Content: "",
                Data: {}
            }
            FBRedis(data1);
        }

        function SendMessage(msg) {
            data1 = {
                reCode: '09',
                ReUserid: '',
                ReUserQYBH: '',
                ReUserName: '',
                SendUserID: UserID,
                SendUserName: UserName,
                Content: msg,
                Data: {}
            }
            FBRedis(data1);
        }

        function ChangeCameraState(s) {
            if (s == 1) {
                if (CameraState == 0) {
                    CameraState = 1;
                    ShowUserState();
                    parent.SetCameraState(UserIndex, CameraState);
                }
            } else {
                if (CameraState == 1) {
                    CameraState = 0;
                    ShowUserState();
                    parent.SetCameraState(UserIndex, CameraState);
                }
            }
        }

        function ChangeMicState(s) {
            if (s == 1) {
                if (MicState == 0) {
                    MicState = 1;
                    ShowUserState();
                    parent.SetMicState(UserIndex, MicState);
                }
            } else {
                if (MicState == 1) {
                    MicState = 0;
                    ShowUserState();
                    parent.SetMicState(UserIndex, MicState);
                }
            }
        }
    </script>
</head>
<body>
    <div style="margin-top: 10px;">
        用户序号：<label id="labXUHAO"></label>
        &nbsp;&nbsp;&nbsp;&nbsp;连接SignalR的ID：<label id="labSignalRID"></label>
        &nbsp;&nbsp;&nbsp;&nbsp;用户名：<label id="labUserName"></label>
        &nbsp;&nbsp;&nbsp;&nbsp;摄像头：<label id="labCameraState"></label>
        &nbsp;&nbsp;&nbsp;&nbsp;麦克风：<label id="labMicState"></label>
        &nbsp;&nbsp;&nbsp;&nbsp;显示发布日志：<input id="cboLog" type="checkbox" name="cboLog" onchange="CboLogChange()" />
    </div>
    <div style="margin-top: 10px;">
        所有房间回调次数：<label id="labRedisSubscribeCallBackAllCount"></label>
        &nbsp;&nbsp;&nbsp;&nbsp;当前房间回调次数：<label id="labRedisSubscribeCallBackCount"></label>
        &nbsp;&nbsp;&nbsp;&nbsp;服务端发布超时次数：<label id="labFBTimeOut"></label>
        &nbsp;&nbsp;&nbsp;&nbsp;其他异常服务端异常：<label id="labQTException"></label>
        &nbsp;&nbsp;&nbsp;&nbsp;JS Signalr调用服务端异常：<label id="labJSSignalrException"></label>
        &nbsp;&nbsp;&nbsp;&nbsp;心跳次数：<label id="labHeartBeatCount"></label>
    </div>
    <div>
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
        <div id="" style="height: 600px; width: 600px; overflow-y: auto; display: inline-block; margin-top: 20px;">
            <div>心跳记录</div>
            <table class="layui-table">
                <thead>
                    <tr>
                        <th style="width: 40px;">序号</th>
                        <th>内容</th>
                    </tr>
                </thead>
                <tbody id="tabHeartBeatLog">
                </tbody>
            </table>
        </div>
    </div>
</body>
</html>
