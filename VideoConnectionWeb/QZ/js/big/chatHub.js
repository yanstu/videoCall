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
    switch (mess.reCode) {
      // 设置主讲人
      case "01":
      case "20":
      //取消主讲人
      case "29":
        roomDetail_.SpeakerID = mess.ReUserid;
        roomDetail_.SpeakerName = mess.ReUserName;
        change();
        break;
      //获取会议缓存信息
      case "12":
        huoquhuiyihuancunxinxi(mess);
        break;
      // 改变参会端当前分页
      case "37":
        var pageNo = mess.Data.State;
        meet_layout.pageNo = pageNo - 1;
        break;
      // 改变当前分页
      case "34":
        var pageNo = mess.Data.State;
        display_layout.pageNo = pageNo - 1;
        viewsHandle();
        break;
      // 操作显示端切换显示模式
      case "32":
        display_layout.mode = mess.Data.State;
        zhanshiduan_mode(mess.Data.State);
        break;
      // 更新用户的长宽比
      case "30":
        var AspectRatio = mess.Data.AspectRatio;
        var SendUserID = mess.Data.SendUserID;
        if (AspectRatio) {
          var user = roomDetail_.UserList.find((item) => item.ID == SendUserID);
          if (user) {
            user.AspectRatio = AspectRatio;
          }
        }
        break;
    }
  }
});

// 断开后处理
chatHub.connection.onclose(function () {
  chathubReConnect();
});

function chathubReConnect() {
  breakCount++;
  console.log("断开尝试重新连接！");
  setTimeout(function () {
    startChathub();
  }, 2000);
  if (breakCount > 5) {
    location.reload();
  }
}

startChathub();

// 调用服务端方法
function startChathub() {
  chatHub.start().then(function () {
    var RoomId = queryParams("RoomId");
    chatHub.invoke("createRedis", RoomId).catch(function (err) {
      return console.error(err.toString());
    });
    huoquhuiyihuancun();
  });
}

/**
 * It sends a message to the redis server.
 * @param data - The data to be sent to the client.
 */
function redisFB(data) {
  var RoomId = queryParams("RoomId");
  chatHub.invoke("redisFB", RoomId, JSON.stringify(data)).catch(function (err) {
    setTimeout(() => {
      redisFB(data);
    }, 1000);
  });
}

// 接收到获取会议缓存信息
function huoquhuiyihuancunxinxi(mess, reconnect) {
  if (mess.reCode) {
    if (!mess.ReUserid || mess.Data.VideoConferenceMess.UserList.length == 0) {
      location.reload();
    } else if (mess.ReUserid == oneself_.CHID) {
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
  display_layout.mode = roomDetail_.XSDModel.Model;
  initFenye();
  zhanshiduan_mode(roomDetail_.XSDModel.Model);
  viewsHandle(reconnect);
}

/**
 * 发布获取会议缓存
 */
function huoquhuiyihuancun(reconnect) {
  var RoomId = queryParams("RoomId");
  ajaxMethod("RedisHandler", { Infotype: "GetCache", RoomId }, (res) => {
    huoquhuiyihuancunxinxi(res, reconnect);
  });
}

/**
 * 发布获取主讲人信息
 */
function huoquzhujiangren() {
  var RoomId = queryParams("RoomId");
  getZJRTimer = setInterval(() => {
    $.post(
      "/Handler/RedisHandler.ashx",
      { Infotype: "GetInfo", RoomId },
      (res) => {
        if (localStorage.getItem("ZJRID") != res) {
          localStorage.setItem("ZJRID", res);
          roomDetail_.SpeakerID = res;
          roomDetail_.SpeakerName = getUserInfo(res)?.UserName;
          change();
        }
      }
    );
  }, 2000);
}

function fanye(no) {
  redisFB({
    reCode: "34",
    ReUserid: "",
    ReUserQYBH: "",
    ReUserName: "",
    SendUserID: oneself_.CHID,
    SendUserName: oneself_.UserName,
    Content: "",
    Data: { State: no + 1 },
  });
}
