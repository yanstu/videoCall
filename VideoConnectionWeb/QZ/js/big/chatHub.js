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
        viewsHandle();
        break;
      // 操作显示端切换显示模式
      case "32":
        switch (mess.Data.State) {
          case 1:
            $("#qiehuandashipin2_btn").click();
            break;
          case 2:
            $("#qiehuanchangguishipin2_btn").click();
            break;
        }
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
      chatHub.invoke("createRedis", RoomId).catch(function (err) {
        return console.error(err.toString());
      });
      huoquhuiyihuancun();
    })
    .catch(function (reason) {
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
    } else if (mess.ReUserid == oneself_.CHID) {
      // } else if (mess.ReUserid == oneself_.CHID || mess.ReUserid == ZCRID_) {
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
  meet_layout.rows = roomDetail_.CHRY_ShowRows;
  meet_layout.cols = roomDetail_.CHRY_ShowCols;
  meet_layout.pageNo = roomDetail_.CHDModel.Page - 1;
  display_layout.pageNo = roomDetail_.XSDModel.Page - 1;
  display_layout.cols = roomDetail_.XSDModel.XSPFormat.split("*")[0];
  display_layout.rows = roomDetail_.XSDModel.XSPFormat.split("*")[0];
  viewsHandle(mess);
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
