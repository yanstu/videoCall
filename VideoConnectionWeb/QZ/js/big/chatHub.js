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
    switch (mess.reCode) {
      // 设置主讲人
      case "01":
      case "20":
      //取消主讲人
      case "29":
        roomDetail_.SpeakerID = mess.ReUserid;
        roomDetail_.SpeakerName = mess.ReUserName;
        viewsHandle();
        break;
      //获取会议缓存信息
      case "12":
        huoquhuiyihuancunxinxi(mess);
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
    viewsHandle(mess);
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
