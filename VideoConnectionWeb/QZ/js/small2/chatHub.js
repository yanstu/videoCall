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
      // 关闭除主讲人和主持人外所有的麦克风
      case "03":
        if (
          roomDetail_.SpeakerID != oneself_.CHID &&
          !oneself_.IsZCR &&
          isMicOn
        )
          $("#mic_btn").click();
        break;
      // 关闭除主讲人和主持人外所有的麦克风
      case "04":
        if (!oneself_.IsZCR && isMicOn) $("#mic_btn").click();
        break;
      // 设置主讲人
      case "01":
      case "20":
        roomDetail_.SpeakerID = mess.ReUserid;
        roomDetail_.SpeakerName = mess.ReUserName;
        changeViews();
        // huoquhuiyihuancun();
        break;
      //取消主讲人
      case "29":
        roomDetail_.SpeakerID = mess.ReUserid;
        roomDetail_.SpeakerName = mess.ReUserName;
        changeViews();
        // huoquhuiyihuancun();
        break;
      // 关闭发言申请
      case "15":
      // 允许发言
      case "17":
        huoquhuiyihuancun();
        break;
      //获取会议缓存信息
      case "12":
        huoquhuiyihuancunxinxi(mess);
        break;
      //获取消息 所有人接收
      case "08":
      //获取消息 指定接收用户
      case "09":
        huoquxiaoxi(mess);
        break;
      //获取申请发言，有人点了申请发言，主持人收到做出处理
      case "10":
        huoqushenqingfayan(mess);
        break;
      // 用户打开/关闭自己的摄像头
      case "05":
      // 打开/关闭用户的摄像头
      case "22":
        if (mess.ReUserid == oneself_.CHID) {
          $("#video_btn").click();
        }
        break;
      // 用户打开/关闭自己的麦克风
      case "06":
      // 打开/关闭用户的麦克风
      case "23":
        if (mess.ReUserid == oneself_.CHID) {
          $("#mic_btn").click();
        }
        break;
      //允许发言
      case "18":
        if (mess.Data.State == "1" && !oneself_.IsZCR) {
          $("#shenqingfayan_btn").show();
        } else {
          $("#shenqingfayan_btn").hide();
        }
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
    xintiaolianjie();
    // 备用方案，防止redis缓存卡了
    // beiyongfangan(RoomId);
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

// 收到申请发言的请求
function huoqushenqingfayan(mess) {
  // 发言列表中不存在此用户的申请
  if (!($("#fayan_" + mess.SendUserID)?.length > 0)) {
    addSpeaker(mess.SendUserID);
  } else {
    // 重复提交发言提醒
    oneself_.IsZCR &&
      layer.msg(getUserInfo(mess.SendUserID).UserName + "再次申请发言");
  }
}

// 收到别人发送的消息
function huoquxiaoxi(mess) {
  if (
    mess.ReUserid &&
    mess.ReUserid != oneself_.CHID &&
    mess.SendUserID != oneself_.CHID
  )
    return;
  addMessage(mess.SendUserID, mess.ReUserid, mess.Content);
}

// 接收到获取会议缓存信息
function huoquhuiyihuancunxinxi(mess) {
  if (!mess.ReUserid || mess.Data.VideoConferenceMess.UserList.length == 0) {
    location.reload();
  } else if (mess.ReUserid == oneself_.CHID) {
    roomDetail_ = mess.Data.VideoConferenceMess;
    setTitle(roomDetail_.Title);
    if (ZJRID_ && roomDetail_.SpeakerID) return;
    roomDetail_.UserList.length == 0 && location.reload();
    roomDetail_.UserList = roomDetail_.UserList.sort(sortData);
    ZCRID_ = roomDetail_.UserList.find((item) => item.IsZCR == 1).ID;
    if (rtc.isPublished_) {
      return;
    }
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

// 向redis发布申请发言人
function shenqingfayan() {
  redisFB({
    reCode: "10",
    ReUserid: oneself_.CHID,
    ReUserQYBH: "",
    ReUserName: "",
    SendUserID: oneself_.CHID,
    SendUserName: oneself_.XM,
    Content: "",
    Data: {},
  });
}

// 发送消息
function fasongxiaoxi() {
  redisFB({
    reCode: oneself_.IsZCR ? "08" : "09",
    ReUserid: oneself_.IsZCR ? fasonggeishei || "" : ZCRID_,
    ReUserQYBH: "",
    ReUserName: "",
    SendUserID: oneself_.CHID,
    SendUserName: oneself_.XM,
    Content: $("#xiaoxineirong").val(),
    Data: {},
  });
  $("#xiaoxineirong").val("");
}

// 设置主讲人
function shezhizhujiangren(ReUserid) {
  redisFB({
    reCode: "01",
    ReUserid,
    ReUserQYBH: "",
    ReUserName: getUserInfo(ReUserid).UserName,
    SendUserID: oneself_.CHID,
    SendUserName: oneself_.XM,
    Content: "",
    Data: {},
  });
}

// 允许发言
function yunxufayan(ReUserid) {
  redisFB({
    reCode: "18",
    ReUserid,
    ReUserQYBH: "",
    ReUserName: "",
    SendUserID: oneself_.CHID,
    SendUserName: oneself_.XM,
    Content: "",
    Data: {
      State: 1,
    },
  });
}

// 关闭所有人麦克风
function guanbisuoyourenmaifekeng() {
  redisFB({
    reCode: "03",
    ReUserid: "",
    ReUserQYBH: "",
    ReUserName: "",
    SendUserID: oneself_.CHID,
    SendUserName: oneself_.XM,
    Content: "",
    Data: {},
  });
}

// 取消主讲人
function quxiaozhujiangren() {
  redisFB({
    reCode: "29",
    ReUserid: "",
    ReUserQYBH: "",
    ReUserName: "",
    SendUserID: oneself_.CHID,
    SendUserName: oneself_.XM,
    Content: "",
    Data: {},
  });
}

// 踢掉某人
function tidiao(ReUserid) {
  redisFB({
    reCode: "07",
    ReUserid,
    ReUserQYBH: "",
    ReUserName: "",
    SendUserID: oneself_.CHID,
    SendUserName: oneself_.XM,
    Content: "",
    Data: {},
  });
}

// 打开/关闭 摄像头
function dakaiguanbishexiangtou(ReUserid) {
  redisFB({
    reCode: "05",
    ReUserid,
    ReUserQYBH: "",
    ReUserName: getUserInfo(ReUserid).UserName,
    SendUserID: oneself_.CHID,
    SendUserName: oneself_.XM,
    Content: "",
    Data: {
      State: isCamOn ? 1 : 0,
    },
  });
}

// 打开/关闭 麦克风
function dakaiguanbimaikefeng(ReUserid) {
  redisFB({
    reCode: "06",
    ReUserid,
    ReUserQYBH: "",
    ReUserName: getUserInfo(ReUserid).UserName,
    SendUserID: oneself_.CHID,
    SendUserName: oneself_.XM,
    Content: "",
    Data: {
      State: isCamOn ? 1 : 0,
    },
  });
}

// 心跳
function xintiaolianjie() {
  xintiaoTimer = setInterval(() => {
    redisFB({
      reCode: "25",
      ReUserid: oneself_.CHID,
      ReUserQYBH: oneself_.QYBH,
      ReUserName: oneself_.UserName,
      SendUserID: oneself_.CHID,
      SendUserName: oneself_.XM,
      Content: "",
      Data: {
        State: "0",
        CameraState: isCamOn ? "1" : 0,
        MicState: isMicOn ? "1" : "0",
      },
    });
  }, 2 * 1000);
}

function fasongchangkuanbi() {
  redisFB({
    reCode: "30",
    ReUserid: "",
    ReUserQYBH: "",
    ReUserName: "",
    SendUserID: oneself_.CHID,
    SendUserName: oneself_.XM,
    Content: "",
    Data: {
      AspectRatio: layout_.aspectRatio,
    },
  });
}

function beiyongfangan(RoomId) {
  ajaxMethod("RedisHandler", { Infotype: "GetInfo", RoomId }, (res) => {
    console.log("-----------------------");
    console.log(res);
  });
}
