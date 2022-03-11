$.connection.hub.url = signalrUrl;
const chatHub = $.connection.chatHub;

if (!chatHub || !chatHub.client) {
  alert("请检查服务端是否启动");
  location.reload();
}

// 收听
chatHub.client.broadcastMessage = function (message, channelss) {
  var RoomId = oneself_?.RoomId || queryParams("RoomId");
  if (channelss == RoomId) {
    let mess = JSON.parse(message);
    if (mess.reCode != 25 && mess.reCode != 27 && mess.reCode != 26) {
      console.log("----------------------------------------");
      console.log(mess.reCode);
      console.log(mess);
    }
    switch (mess.reCode) {
      // 踢出用户
      case "07":
        if (mess.ReUserid == oneself_.CHID) {
          layer.msg("您已被踢出房间", { icon: 2 });
          setTimeout(() => {
            leave();
          }, 1000);
        }
        break;
      // 设置主讲人
      case "01":
      case "20":
      //取消主讲人
      case "29":
        roomDetail_.SpeakerID = mess.ReUserid;
        roomDetail_.SpeakerName = mess.ReUserName;
        changeViews();
        break;
      //获取会议缓存信息
      case "12":
        huoquhuiyihuancunxinxi(mess);
        break;
      //踢出所有用户
      case "28":
        layer.msg("您已被踢出房间", { icon: 2 });
        setTimeout(() => {
          leave();
        }, 1000);
        break;
    }
  }
};

// 断开后处理
$.connection.hub.disconnected(function () {
  setTimeout(function () {
    console.log("断开尝试重新连接！");
    $.connection.hub.start();
  }, 3 * 1000);
});

// 调用服务端方法
$.connection.hub
  .start()
  .done(function () {
    var RoomId = oneself_?.RoomId || queryParams("RoomId");
    chatHub.server.createRedis(RoomId);
    huoquhuiyihuancun();
  })
  .fail(function (reason) {
    alert("SignalR connection failed: " + reason);
  });

// 对象排序
function sortData(a, b) {
  undefined;
  return a.XUHAO - b.XUHAO;
}

/**
 * It sends a message to the redis server.
 * @param data - The data to be sent to the client.
 */
function redisFB(data) {
  chatHub.server.redisFB(oneself_.RoomId, JSON.stringify(data));
}

// 接收到获取会议缓存信息
function huoquhuiyihuancunxinxi(mess) {
  if (!mess.ReUserid || mess.Data.VideoConferenceMess.UserList.length == 0) {
    location.reload();
  } else if (mess.ReUserid == oneself_.CHID) {
    roomDetail_ = mess.Data.VideoConferenceMess;
    setTitle(roomDetail_.Title);
    roomDetail_.UserList.length == 0 && location.reload();
    roomDetail_.UserList = roomDetail_.UserList.sort(sortData);
    ZCRID_ = roomDetail_.UserList.find((item) => item.IsZCR == 1).ID;
    viewsHandle();
  }
}

/**
 * 发布获取会议缓存
 */
function huoquhuiyihuancun() {
  redisFB({
    reCode: "11",
    ReUserid: "",
    ReUserQYBH: "",
    ReUserName: "",
    SendUserID: oneself_.CHID,
    SendUserName: oneself_.UserName,
    Content: "",
    Data: {},
  });
}

function fanye(no) {
  roomDetail_.page = no;
  roomDetail_.type = 1;
  var VideoConferenceMess = roomDetail_;
  redisFB({
    reCode: "12",
    ReUserid: oneself_.CHID,
    ReUserQYBH: "",
    ReUserName: "",
    SendUserID: oneself_.CHID,
    SendUserName: oneself_.UserName,
    Content: "",
    Data: { VideoConferenceMess },
  });
}