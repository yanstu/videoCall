<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="TestStart.aspx.cs" Inherits="VideoConnectionWeb.TestStart" %>

<!DOCTYPE html>

<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <title>启动测试</title>
    <script src="js/jquery-3.2.1.min.js"></script>
    <script src="js/layui/layui.js"></script>
    <link href="js/layui/css/layui.css" rel="stylesheet" />
<%--    <script src="https://testvideo.gzshifang.com:9031/lib/aspnet/signalr/dist/browser/signalr.js"></script>--%>
    <script>
        var vueApp = "";
        $(function () {
            ShowCount();
        })
        function ClickStart() {
            var NumPage = Number($("#txtNumPage").val());
            var UserCount = Number($("#txtNumPageUserCount").val());

            //直接for循环只能打开一个窗口
            //for (var i = 0; i < NumPage; i++) {
            //    window.open("Test.aspx?HYID=" + $("#txtHYID").val() + "&StartNum=" + (i + 1) * UserCount + "&EndNum=" + ((i + 2) * UserCount - 1));
            //}
            OpenIndex = Number($("#txtDQPageNum").val()) - 1;
            OpenTestPage();
        }

        var OpenIndex = 0;
        function OpenTestPage() {
            var NumPage = Number($("#txtNumPage").val());
            var UserCount = Number($("#txtNumPageUserCount").val());
            if (OpenIndex < NumPage) {
                window.open("Test.aspx?HYID=" + $("#txtHYID").val() + "&StartNum=" + (OpenIndex * UserCount) + "&EndNum=" + ((OpenIndex + 1) * UserCount - 1));
                OpenIndex++;

            }
            if (OpenIndex < NumPage) {
                $("#btnStart").html("启第" + (OpenIndex + 1) + "个页面");
                $("#txtDQPageNum").val(OpenIndex + 1);
                $("#btnStart").show();
            } else {
                $("#btnStart").hide();
            }
        }

        function ClickOpenIframe() {
            IframeCount = Number($("#txtIframeCount").val());
            indexIframeIndex = Number($("#txtIframeUserStartNum").val());
            indexIframe = 0;
            //Signal连接成功数
            SignalCount = 0;

            //发布Redis发布超时次数
            FBTimeOut = 0;

            //服务端其他异常次数
            ServerException = 0;

            //JS Signalr异常次数
            JSSignalrException = 0;

            $("#IframeList").html("");
            if (LoginInfo != "") {
                FindVideoConferenceById(function () {
                    setTimeout(CreateIframe, 1000);
                });
            } else {
                ApiLogin(function () {
                    setTimeout(CreateIframe, 1000);
                });
            }

        }
        var indexIframeIndex = 0;
        var IframeCount = 0;
        var indexIframe = 0
        function CreateIframe() {
            var strHtml = "";
            var tempHYID = $("#txtHYID").val();
            var aspxName = "TestItemCore.aspx";
            if ($("#selSignalrVersion").val() == "") {
                aspxName = "TestItem.aspx";
            }
            
            for (var i = indexIframe; i < indexIframe + 1; i++) {
                if (indexIframe >= UserList.length) {
                    break;
                }
                var src = aspxName+"?RoomId=" + UserList[i].RoomId + "&UserID=" + UserList[i].UserID + "&UserName=" + escape(UserList[i].UserName) + "&XUHAO=" + UserList[i].XUHAO + "&UserIndex=" + i;
                strHtml += '<div><iframe id="iframe_' + UserList[i].UserID + '" src="' + src + '" style="height:500px;width:1920px;"></iframe></div>';
                indexIframe++;
            }
            $("#IframeList").append(strHtml);
            if (indexIframe < IframeCount) {
                setTimeout(CreateIframe, 3000);
            }
        }

        var TestStart = true;
        function ShowCount() {
            $("#labSignalCount").html(SignalCount);
            $("#labFBTimeOut").html(FBTimeOut);
            $("#labServerException").html(ServerException);
            $("#labJSSignalrException").html(JSSignalrException);
            $("#labGetUserListCount").html(GetUserListCount);
            setTimeout(ShowCount, 1000);
        }
        //Signal连接成功数
        var SignalCount = 0;

        //发布Redis发布超时次数
        var FBTimeOut = 0;

        //服务端其他异常次数
        var ServerException = 0;

        //JS Signalr异常次数
        var JSSignalrException = 0;

        //成功获取用户列表数
        var GetUserListCount = 0;

        function SetSignalState(UserIndex, state) {
            SignalCount++;
            UserList[UserIndex].SignalState = state;
            SetTdState($("#user_" + UserList[UserIndex].UserID).children(".tdSignalState"), UserList[UserIndex].SignalState, '', '已连接');
        }

        function SetFBTimeOut(UserIndex) {
            FBTimeOut++;
            UserList[UserIndex].FBTimeOut++;
            $("#user_" + UserList[UserIndex].UserID).children(".tdFBTimeOut").html(UserList[UserIndex].FBTimeOut);
        }

        function SetServerException(UserIndex) {
            ServerException++;
            UserList[UserIndex].ServerException++;
            $("#user_" + UserList[UserIndex].UserID).children(".tdServerException").html(UserList[UserIndex].ServerException);
        }

        function SetJSSignalrException(UserIndex) {
            JSSignalrException++;
            UserList[UserIndex].JSSignalrException++;
            $("#user_" + UserList[UserIndex].UserID).children(".tdJSSignalrException").html(UserList[UserIndex].JSSignalrException);
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

        var UserList = new Array();
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
                            var VCModel = res.Data;
                            UserList = new Array();
                            RoomId = VCModel.VideoConference.RoomId;
                            $("title").html(VCModel.VideoConference.Title + "【" + indexIframeIndex + "-" + IframeCount+"】");
                            var maxI = IframeCount;
                            if (maxI >= VCModel.VideoConferenceCHRY.length) {
                                maxI = VCModel.VideoConferenceCHRY.length - 1;
                            }
                            for (var i = indexIframeIndex; i <= maxI; i++) {
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
                                    SignalState: 0,
                                    FBTimeOut: 0,//发布Redis发布超时次数
                                    ServerException: 0,//服务端其他异常次数
                                    JSSignalrException: 0,//JS Signalr异常次数
                                    UserListCount: 0,//获取用户数
                                    IsZJR: "",//是否主讲人
                                    IsTC: "",//是否被踢出
                                    GetHYCache: 0,//是否获取会议缓存
                                    MessageList: new Array(),
                                    YXFY: "",
                                    QXZJRCount: 0
                                };
                                UserList.push(tempModel);
                            }
                            ShowUserList();
                            fn();
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

        function ShowUserList() {
            $("#tabUserList").html("");
            var htmlStr = "";
            var tempGetUserListCount = 0;
            for (var i = 0; i < UserList.length; i++) {
                htmlStr += "<tr id='user_" + UserList[i].UserID + "'>";
                htmlStr += '<td><input type="checkbox" name="cboUser" value="' + i + '"/>' + (i + 1) + '</td>';
                htmlStr += '<td>' + UserList[i].UserName + '</td>';
                htmlStr += GetStateTdHtml("tdCameraState", UserList[i].CameraState, "已关闭", "已打开");
                htmlStr += GetStateTdHtml("tdMicState", UserList[i].MicState, "已关闭", "已打开");
                htmlStr += GetStateTdHtml("tdSignalState", UserList[i].SignalState, "", "已连接");
                htmlStr += '<td class="tdFBTimeOut">' + UserList[i].FBTimeOut + '</td>';
                htmlStr += '<td class="tdServerException">' + UserList[i].ServerException + '</td>';
                htmlStr += '<td class="tdJSSignalrException">' + UserList[i].JSSignalrException + '</td>';
                htmlStr += '<td class="tdUserListCount">' + UserList[i].UserListCount + '</td>';
                htmlStr += '<td class="tdIsZJR">' + UserList[i].IsZJR + '</td>';
                htmlStr += '<td class="tdIsTC">' + UserList[i].IsTC + '</td>';
                htmlStr += '<td class="tdGetHYCache">' + UserList[i].GetHYCache + '</td>';
                htmlStr += '<td class="tdMessageList">收到消息：' + UserList[i].MessageList.length + '</td>';
                htmlStr += '<td class="tdYXFY">' + UserList[i].YXFY + '</td>';
                htmlStr += '<td class="tdQXZJRCount">' + UserList[i].QXZJRCount + '</td>';
                htmlStr += "</tr>";
                if (UserList[i].UserListCount > 0) {
                    tempGetUserListCount++;
                }
                GetUserListCount = tempGetUserListCount;
            }
            $("#tabUserList").html(htmlStr);
        }

        function ClickCXDK(i) {
            var tempIframe = $("#iframe_" + UserList[i].UserID);
            var tempSrc = tempIframe.attr("src");
            tempIframe.attr("src", "");
            tempIframe.attr("src", tempSrc);
        }

        function GetStateTdHtml(className, val, show0, show1) {
            var StateStr = show0;
            var StateClass = "";
            if (val == 1) {
                StateStr = show1;
                StateClass = " color_Open";
            }
            return '<td class="' + className + StateClass + '">' + StateStr + '</td>';
        }

        function SetTdState(tdObj, val, show0, show1) {
            var StateStr = show0;
            var StateClass = "";
            tdObj.removeClass("color_Open");
            if (val == 1) {
                StateStr = show1;
                StateClass = "color_Open";
                tdObj.addClass("color_Open");
            }
            tdObj.html(StateStr);
        }

        //设置摄像头状态
        function SetCameraState(UserIndex, state) {
            UserList[UserIndex].CameraState = state;
            SetTdState($("#user_" + UserList[UserIndex].UserID).children(".tdCameraState"), UserList[UserIndex].CameraState, '已关闭', '已打开');
        }

        //设置麦克风状态
        function SetMicState(UserIndex, state) {
            UserList[UserIndex].MicState = state;
            SetTdState($("#user_" + UserList[UserIndex].UserID).children(".tdMicState"), UserList[UserIndex].MicState, '已关闭', '已打开');
        }

        //设置获取用户数
        function SetUserListCount(UserIndex, count) {
            if (UserList[UserIndex].UserListCount != count) {
                UserList[UserIndex].UserListCount = count;
                ShowUserList();
                $("#user_" + UserList[UserIndex].UserID).children(".tdUserListCount").html(count);
            }
        }

        //设置主讲人
        function SetZJR(UserIndex, UserID) {
            if (UserList[UserIndex].IsZJR == "是主讲人") {
                if (UserList[UserIndex].UserID != UserID) {
                    UserList[UserIndex].IsZJR = "";
                    $("#user_" + UserList[UserIndex].UserID).children(".tdIsZJR").html(UserList[UserIndex].IsZJR);
                }
            } else {
                if (UserList[UserIndex].UserID == UserID) {
                    UserList[UserIndex].IsZJR = "是主讲人";
                    $("#user_" + UserList[UserIndex].UserID).children(".tdIsZJR").html(UserList[UserIndex].IsZJR);
                }
            }
        }

        //踢出用户
        function SetUserOut(UserIndex) {
            UserList[UserIndex].IsTC = "被踢出";
            $("#user_" + UserList[UserIndex].UserID).children(".tdIsTC").html(UserList[UserIndex].IsTC);
        }

        //设置获取会议缓存
        function SetGetHYCache(UserIndex) {
            UserList[UserIndex].GetHYCache++;
            $("#user_" + UserList[UserIndex].UserID).children(".tdGetHYCache").html(UserList[UserIndex].GetHYCache);
        }

        //收到发送消息
        function SetMessage(UserIndex, Time, FSR, NR) {
            UserList[UserIndex].MessageList.push({ Time: Time, FSR: FSR, NR: NR });
            $("#user_" + UserList[UserIndex].UserID).children(".tdMessageList").html("收到消息：" + UserList[UserIndex].MessageList.length);
        }

        //设置允许发言
        function SetYXFY(UserIndex, State) {
            if (State == 1) {
                UserList[UserIndex].YXFY = "允许";
            } else {
                UserList[UserIndex].YXFY = "";
            }
            $("#user_" + UserList[UserIndex].UserID).children(".tdYXFY").html(UserList[UserIndex].YXFY);
        }

        //取消主讲人
        function SetQXZJR(UserIndex) {
            UserList[UserIndex].QXZJRCount++;
            $("#user_" + UserList[UserIndex].UserID).children(".tdQXZJRCount").html(UserList[UserIndex].QXZJRCount);
            for (var i = 0; i < UserList.length; i++) {
                if (UserList[i].IsZJR == "是主讲人") {
                    UserList[i].IsZJR = "";
                    $("#user_" + UserList[i].UserID).children(".tdIsZJR").html(UserList[i].IsZJR);
                }
            }
        }

        function ChangeAllCbo(obj) {
            var $cboList = $("input[type=checkbox][name=cboUser]");
            if ($(obj).is(':checked')) {
                for (var i = 0; i < $cboList.length; i++) {
                    $cboList.eq(i).prop("checked", true);
                }
            } else {
                for (var i = 0; i < $cboList.length; i++) {
                    $cboList.eq(i).prop("checked", false);
                }
            }
        }

        //获取会议缓存
        function GetHYCache() {
            var $cboList = $("input[type=checkbox][name=cboUser]:checked");
            if ($cboList.length == 0) {
                alert("请选择用户！");
                return;
            }
            for (var i = 0; i < $cboList.length; i++) {
                var tempUID = UserList[$cboList.eq(i).val()].UserID;
                $("#iframe_" + tempUID)[0].contentWindow.GetHYCache();
            }
        }

        //申请发言
        function SQFY() {
            var $cboList = $("input[type=checkbox][name=cboUser]:checked");
            if ($cboList.length == 0) {
                alert("请选择用户！");
                return;
            }
            for (var i = 0; i < $cboList.length; i++) {
                var tempUID = UserList[$cboList.eq(i).val()].UserID;
                $("#iframe_" + tempUID)[0].contentWindow.SQFY();
            }
        }

        function SendMessage() {
            var msg = $("#txtMsg").val();
            if (msg == "") {
                alert("请输入消息内容！");
                return;
            }
            var $cboList = $("input[type=checkbox][name=cboUser]:checked");
            if ($cboList.length == 0) {
                alert("请选择用户！");
                return;
            }
            for (var i = 0; i < $cboList.length; i++) {
                var tempUID = UserList[$cboList.eq(i).val()].UserID;
                $("#iframe_" + tempUID)[0].contentWindow.SendMessage(msg);
            }
        }

        function ChangeCameraState(s) {
            var $cboList = $("input[type=checkbox][name=cboUser]:checked");
            if ($cboList.length == 0) {
                alert("请选择用户！");
                return;
            }
            for (var i = 0; i < $cboList.length; i++) {
                var tempUID = UserList[$cboList.eq(i).val()].UserID;
                $("#iframe_" + tempUID)[0].contentWindow.ChangeCameraState(s);
            }
        }

        function ChangeMicState(s) {
            var $cboList = $("input[type=checkbox][name=cboUser]:checked");
            if ($cboList.length == 0) {
                alert("请选择用户！");
                return;
            }
            for (var i = 0; i < $cboList.length; i++) {
                var tempUID = UserList[$cboList.eq(i).val()].UserID;
                $("#iframe_" + tempUID)[0].contentWindow.ChangeMicState(s);
            }
        }

        //var connection = new signalR.HubConnectionBuilder().withUrl("https://testvideo.gzshifang.com:9031/chatHub").build();
        //connection.on("ReceiveMessage", function (user, message) {
        //    alert(user + "：" + message);
        //});
        //$(function () {
        //    connection.start().then(function () {


        //    }).catch(function (err) {
        //        return console.error(err.toString());
        //    });

        //    document.getElementById("sendButton").addEventListener("click", function (event) {
        //        connection.invoke("SendMessage", "1", "测试").catch(function (err) {
        //            return console.error(err.toString());
        //        });
        //        event.preventDefault();
        //    });
        //})

        var lockResolver;
        if (navigator && navigator.locks && navigator.locks.request) {
            alert("支持locks");
            const promise = new Promise((res) => {
                lockResolver = res;
            });

            navigator.locks.request('unique_lock_name', { mode: "shared" }, () => {
                return promise;
            });
        } else {
            alert("不支持locks");
        }
    </script>
    <style>
        .color_Open {
            color: dodgerblue;
        }

        .color_Warning {
            color: red;
        }
    </style>
</head>
<body>
    <div style="margin-top: 10px;">会议ID：<input id="txtHYID" type="text" class="layui-input" style="width: 150px; display: inline-block;" value="d982d65e370c417abe0e7c6c21bb9d3f" /></div>
    <div style="margin-top: 10px;display:none;">
        <div>每个页面用的一个Signal连接ID</div>
        最大启动页数：<input id="txtNumPage" type="number" class="layui-input" style="width: 60px; display: inline-block;" value="13" />
        &nbsp;&nbsp;&nbsp;&nbsp;每页用户数：<input id="txtNumPageUserCount" type="number" class="layui-input" style="width: 60px; display: inline-block;" value="25" />

        <button class="layui-btn" onclick="OpenIndex = 0;ClickStart()">重新启动</button>
        &nbsp;&nbsp;&nbsp;&nbsp;当前启动页：<input id="txtDQPageNum" type="number" class="layui-input" style="width: 60px; display: inline-block;" value="1" />
          <button id="btnStart" class="layui-btn" onclick="ClickStart()" style="">启第1个页面</button>
        <button id="sendButton">测试SignalrCore</button>
    </div>

    <div style="margin-top: 10px;">
        <div>每个用户创建一个Iframe，每个用户用一个Signal连接ID</div>
        &nbsp;&nbsp;&nbsp;&nbsp;打开Iframe用户开始下标：<input id="txtIframeUserStartNum" type="number" class="layui-input" style="width: 60px; display: inline-block;" value="0" />
        &nbsp;&nbsp;&nbsp;&nbsp;打开Iframe用户截至下标：<input id="txtIframeCount" type="number" class="layui-input" style="width: 60px; display: inline-block;" value="199" />
        Signalr版本：
        <select id="selSignalrVersion"  class="layui-input"  style="width: 180px; display: inline-block;">
              <option value="Core">ASP.NET Core SignalR</option>
            <option value="">ASP.NET SignalR</option>
        </select>
        <button class="layui-btn" onclick="ClickOpenIframe()">打开Iframe</button>
        &nbsp;&nbsp;&nbsp;&nbsp;连接Signal成功数：<label id="labSignalCount"></label>
        &nbsp;&nbsp;&nbsp;&nbsp;服务端发布超时次数：<label id="labFBTimeOut"></label>
        &nbsp;&nbsp;&nbsp;&nbsp;其他异常服务端异常：<label id="labServerException"></label>
        &nbsp;&nbsp;&nbsp;&nbsp;JS Signalr调用服务端异常：<label id="labJSSignalrException"></label>
        &nbsp;&nbsp;&nbsp;&nbsp;成功获取用户列表的人数：<label id="labGetUserListCount"></label>

    </div>
    <div style="margin: 10px;">
        批量操作： 
        <button id="" class="layui-btn" onclick="GetHYCache()" style="">获取会议缓存</button>
        <button id="" class="layui-btn" onclick="SQFY()" style="">申请发言</button>
        <button id="" class="layui-btn" onclick="ChangeCameraState(1)" style="">打开摄像头</button>
        <button id="" class="layui-btn" onclick="ChangeCameraState()" style="">关闭摄像头</button>
        <button id="" class="layui-btn" onclick="ChangeMicState(1)" style="">打开麦克风</button>
        <button id="" class="layui-btn" onclick="ChangeMicState(0)" style="">关闭麦克风</button>
        消息内容：<input id="txtMsg" type="text" class="layui-input" style="width: 100px; display: inline-block;" value="" />
        <button id="" class="layui-btn" onclick="SendMessage()" style="">发送消息</button>
    </div>
    <div>
        <div id="divUserList" style="height: 600px; width: 1900px; overflow-y: auto; display: inline-block; margin-top: 20px;">
            <table class="layui-table">
                <thead>
                    <tr>
                        <th style="width: 40px;">
                            <input type="checkbox" onchange="ChangeAllCbo(this)" />序号</th>
                        <th>姓名</th>
                        <th>摄像头</th>
                        <th>麦克风</th>
                        <th>Signal状态</th>
                        <th>服务端发布超时次数</th>
                        <th>其他异常服务端异常</th>
                        <th>JS Signalr调用服务端异常</th>
                        <th>获取用户列表</th>
                        <th>主讲人</th>
                        <th>是否被踢出</th>
                        <th>是否获取会议缓存</th>
                        <th>收到消息</th>
                        <th>允许发言</th>
                        <th>收到取消主讲人次数</th>
                    </tr>
                </thead>
                <tbody id="tabUserList">
                </tbody>
            </table>
        </div>
    </div>
    <div id="IframeList">
    </div>
</body>
</html>
