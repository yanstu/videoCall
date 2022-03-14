const chatHub = new signalR.HubConnectionBuilder().withUrl(hubsUrl).build();

if (!chatHub || !signalR) {
  alert("请检查服务端是否启动");
  location.reload();
}

// 收听
chatHub.on("broadcastMessage", function (message, channelss) {
  var RoomId = queryParams("RoomId");
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
      // 获取用户缓存
      case "14":
        roomDetail_.UserList = mess.Data.UserList;
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
});

// 断开后处理
chatHub.connection.onclose(function () {
  console.log("断开尝试重新连接！");
  setTimeout(function () {
    startChathub();
  }, 3000); //3秒后重新连接.
});

startChathub();

// 调用服务端方法
function startChathub() {
  chatHub
    .start()
    .then(function () {
      var RoomId = queryParams("RoomId");
      chatHub.server.createRedis(RoomId);
      huoquhuiyihuancun();
    })
    .fail(function (reason) {
      alert("SignalR connection failed: " + reason);
    });
}

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
  var RoomId = queryParams("RoomId");
  chatHub.invoke("redisFB", RoomId, JSON.stringify(data));
}

// 接收到获取会议缓存信息
function huoquhuiyihuancunxinxi(mess) {
  if (mess.reCode) {
    if (!mess.ReUserid || mess.Data.VideoConferenceMess.UserList.length == 0) {
      location.reload();
      // } else if (mess.ReUserid == oneself_.CHID) {
    } else if (mess.ReUserid == oneself_.CHID || mess.ReUserid == ZCRID_) {
      roomDetail_ = mess.Data.VideoConferenceMess;
    } else {
      return;
    }
  } else {
    roomDetail_ = mess;
  }
  setTitle(roomDetail_.Title);
  roomDetail_.UserList.length == 0 && location.reload();
  roomDetail_.UserList = roomDetail_.UserList.sort(sortData);
  ZCRID_ = roomDetail_.UserList.find((item) => item.IsZCR == 1).ID;
  viewsHandle();
}

/**
 * 发布获取会议缓存
 */
function huoquhuiyihuancun() {
  var RoomId = queryParams("RoomId");
  ajaxMethod("RedisHandler", { Infotype: "GetCache", RoomId }, (res) => {
    huoquhuiyihuancunxinxi(res);
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
