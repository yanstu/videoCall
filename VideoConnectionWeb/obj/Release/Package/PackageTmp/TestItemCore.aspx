<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="TestItemCore.aspx.cs" Inherits="VideoConnectionWeb.TestItemCore" %>

<!DOCTYPE html>

<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <script src="js/jquery-3.2.1.min.js"></script>
    <script src="js/layui/layui.js"></script>
    <link href="js/layui/css/layui.css" rel="stylesheet" />
    <script src="https://testvideo.gzshifang.com:9031/lib/aspnet/signalr/dist/browser/signalr.min.js"></script>
    <title>测试单个用户</title>
    <script>

        function ShowCount() {
            $("#labRedisSubscribeCallBackCount").html(RedisSubscribeCallBackCount);
            $("#labRedisSubscribeCallBackAllCount").html(RedisSubscribeCallBackAllCount);
        }
        var IsTestStart = false;
        var chat = "";

        var connection = new signalR.HubConnectionBuilder().withUrl("https://testvideo.gzshifang.com:9031/chatHub").build();
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
            setInterval(ShowCount, 1000);

            //提供方法给服务端调用
            connection.on("setHeartBeatCountStart", function () {

            });
            connection.on("setHeartBeatEnd", function (timeStart, timeEnd, calc) {
                HeartBeatEndCount++;
                //var htmlStr = "<tr>";
                //htmlStr += '<td>' + HeartBeatEndCount + '</td>';
                //htmlStr += '<td>【' + timeStart + " - " + timeEnd + '】用时：' + calc + '</td>';
                //htmlStr += "</tr>";
                //$("#tabHeartBeatLog").append(htmlStr);
                $("#labHeartBeatCount").html(HeartBeatEndCount);
            });

            connection.on("setSignalRID", function (id) {
                $("#labSignalRID").html(id);
                if (IsTestStart) {
                    parent.SetSignalState(UserIndex, 1);
                }
            });
            connection.on("errorFBTimeOut", function (name, msg) {
                FBTimeOut++;
                $("#labFBTimeOut").html(FBTimeOut);
                if (IsTestStart) {
                    parent.SetFBTimeOut(UserIndex);
                }
                ShowServerErr("【Redis发布超时】"+name, msg);

            });

            connection.on("errorServer", function (name, msg) {
                ShowServerErr("【服务端异常】"+name, msg);
            });
            connection.on("broadcastMessage", function (message, channelss) {
               //console.log(getTime()+"【broadcastMessage】" + message);
                RedisSubscribeCallBackAllCount++;
                if (channelss == RoomId) {
                    RedisSubscribeCallBackCount++;
                    var mess = "";
                    try {
                        mess = JSON.parse(message);
                    } catch (err) {
                        console.error(message);
                        JSSignalrExceptionLog('broadcastMessage:解析出错' + err + '（message：' + message + '）');
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
            });

            //断开后处理
            connection.connection.onclose(function () {
                JSSignalrExceptionLog(UserName + "：Signalr连接断开！");
                Reconnect();
            });

            var hubP = {
                transport: ['webSockets', 'serverSentEvents', 'longPolling', 'foreverFrame']
            };

            for (var i = 0; i < 5; i++) {
                HubStart();
            }
        })

        //掉线重连
        function Reconnect() {
            if (HeartBeatTime != "") {
                clearInterval(HeartBeatTime);
            }
            if (HubStartTime != "") {
                clearTimeout(HubStartTime);
            }
            HubStartTime = setTimeout(function () {
                JSSignalrExceptionLog(UserName + "：Signalr断开尝试重新连接！");
                HubStart();
            }, 3000); //3秒后重新连接. 
        }

        var isStrat = false;
        var HubStartTime = "";
        function HubStart() {
            if (isStrat == true) {
                return;
            }
            isStrat = true;
            if (HubStartTime != "") {
                clearTimeout(HubStartTime);
            }
            Log(UserName + "：开始连接Signalr！");
            connection.start().then(function () {
                if (HubStartTime != "") {
                    clearTimeout(HubStartTime);
                }
                isStrat = false;

                Log(UserName + "：Signalr连接成功！");
                connection.invoke("createRedis", RoomId).catch(function (err) {
                    return console.error(err.toString());
                });
                if (HeartBeatTime != "") {
                    clearInterval(HeartBeatTime);
                }
                HeartBeatTime = setInterval(HeartBeat, 1400);
                GetHYCache();

            }).catch(function (err) {
                isStrat = false;
                JSSignalrExceptionLog(UserName + "：Signalr连接失败！" + err.toString());
                if (HubStartTime != "") {
                    clearTimeout(HubStartTime);
                }
                HubStartTime = setTimeout(HubStart, 3000); //3秒后重新连接.
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
                ReUserName: "【网页时间：】" + getTime(),
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
              
            });
            HeartBeatCount++;
         /*   $("#labHeartBeatCount").html(HeartBeatCount);*/

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
            if (IsLog) {
                console.log(UserName + "发布日志：" + jsonStr);
            }
            //发布消息
            connection.invoke("redisFB", RoomId, jsonStr).catch(function (err) {
                if (HeartBeatTime != "") {
                    clearInterval(HeartBeatTime);
                }
                JSSignalrExceptionLog("【JS调用Hub的redisFB方法出错】" + "发布Json:【" + jsonStr+"】"+err.toString());
                if (fn) {
                    fn();
                }
                Reconnect();
              /*  return console.error(err.toString());*/
            });
            if (fn) {
                fn();
            }
        }
        function ShowServerErr(name, msg) {
            QTException++;
            $("#labQTException").html(QTException);
            if (IsTestStart) {
                parent.SetServerException(UserIndex);
            }
            //var htmlStr = "<tr>";
            //htmlStr += '<td>' + ($("#tabServerException tr").length + 1) + '</td>';
            //htmlStr += '<td>' + name + '</td>';
            //htmlStr += '<td>' + msg + '</td>';
            //htmlStr += "</tr>";
            //$("#tabServerException").append(htmlStr);

            if (window.WSLLZWinFromJSHelper) {
                WSLLZWinFromJSHelper.LogErr(UserIndex + UserName, "网页时间"+getTime() +"：" + name + err);
            }
        }

        function JSSignalrExceptionLog(err) {
            JSSignalrException++;
            $("#labJSSignalrException").html(JSSignalrException);
            if (IsTestStart) {
                parent.SetJSSignalrException(UserIndex);
            }
            //var htmlStr = "<tr>";
            //htmlStr += '<td>' + ($("#tabSignalrError tr").length + 1) + '</td>';
            //htmlStr += '<td>' + getTime() + '</td>';
            //htmlStr += '<td>' + err + '</td>';
            //htmlStr += "</tr>";
            //$("#tabSignalrError").append(htmlStr);
            if (window.WSLLZWinFromJSHelper) {
                WSLLZWinFromJSHelper.LogErr(UserIndex + UserName,"网页时间" + getTime() + "：" +  err);
            }

        }

        function Log(str) {
            if (window.WSLLZWinFromJSHelper) {
                WSLLZWinFromJSHelper.LogErr(UserIndex + UserName, "网页时间" + getTime() + "：" + str);
            } else {
                console.log(UserIndex + UserName, "网页时间" + getTime() + "：" + str);
            }
        }
        //获取会议缓存
        function GetHYCache() {
            //var data1 = {
            //    reCode: '11',
            //    ReUserid: '',
            //    ReUserQYBH: '',
            //    ReUserName: getTime(),
            //    SendUserID: UserID,
            //    SendUserName: UserName,
            //    Content: "",
            //    Data: {}
            //}
            ////console.log(UserName + "发布获取会议缓存：SendUserName:" + data1.SendUserName + " SendUserID:" + data1.SendUserID);
            //FBRedis(data1);
            $.ajax({
                url: '/Handler/RedisHandler.ashx',
                data: { "Infotype": "GetCache", "RoomId": RoomId },
                "type": "post",
                dataType: "json",
                async: true,
                success: function (res) {
                    if (res != null) {
                        parent.SetGetHYCache(UserIndex);
                    } else {
                        ShowServerErr("【获取会议缓存】"+getTime(), "获取会议缓存为null");
                    }
                },
                error: function (res) {
                    ShowServerErr("【获取会议缓存】" +getTime(), "获取会议缓存"+res);
                }
            });
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
