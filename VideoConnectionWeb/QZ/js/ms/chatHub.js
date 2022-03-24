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
      //取消主讲人
      case "29":
        roomDetail_.SpeakerID = mess.ReUserid;
        roomDetail_.SpeakerName = mess.ReUserName;
        showOrHide();
        gengxinzhuangtai();
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
      // 允许发言
      case "18":
        if (mess.Data.State == "1" && !oneself_.IsZCR) {
          $("#shenqingfayan_btn").show();
        } else {
          $("#shenqingfayan_btn").hide();
        }
        break;
      // 踢出所有用户
      case "28":
        layer.msg("您已被踢出房间", { icon: 2 });
        setTimeout(() => {
          leave();
        }, 1000);
        break;
      // 操作所有用户切换显示模式
      case "35":
        meet_layout.mode = mess.Data.State;
        chanhuiduan_mode(meet_layout.mode);
        break;
      // 更新用户的长宽比
      case "30":
        var AspectRatio = mess.Data.AspectRatio;
        var SendUserID = mess.SendUserID;
        if (AspectRatio) {
          var user = roomDetail_.UserList.find((item) => item.ID == SendUserID);
          if (user) {
            user.AspectRatio = AspectRatio;
          }
        }
        break;
      // 是否允许非主持人主讲人控制麦克风
      case "38":
        roomDetail_.AllowOpenMic = mess.Data.State;
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
    chatHub.invoke("createRedis", RoomId)
    huoquchangkuanbi();
    huoquhuiyihuancun();
    xintiaolianjie();
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
      // redisFB(data);
      startChathub();
    }, 1000);
  });
}

chatHub.on("errorServer", function (name) {
  console.error(name);
});

// 收到申请发言的请求
function huoqushenqingfayan(mess) {
  // 发言列表中不存在此用户的申请
  if (!($("#fayan_" + mess.SendUserID).length > 0)) {
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
  var me = roomDetail_.UserList.find((item) => item.ID == oneself_.CHID);
  Array.prototype.indexOf = function (val) {
    for (var i = 0; i < this.length; i++) {
      if (this[i] == val) return i;
    }
    return -1;
  };
  Array.prototype.remove = function (val) {
    var index = this.indexOf(val);
    if (index > -1) {
      this.splice(index, 1);
    }
  };
  roomDetail_.UserList.remove(me);
  roomDetail_.UserList = [me, ...roomDetail_.UserList];
  ZCRID_ = roomDetail_.UserList.find((item) => item.IsZCR == 1).ID;
  meet_layout.rows = 3;
  meet_layout.cols = 2;
  meet_layout.pageNo = 0;
  meet_layout.mode = roomDetail_.CHDModel.Model;
  if (meet_layout.mode != 4) {
    chanhuiduan_mode(meet_layout.mode);
  }
  /*meet_layout.mode = 3;
  chanhuiduan_mode(3);*/
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
  xintiaoTimer && clearInterval(xintiaoTimer);
  xintiaoTimer = setInterval(() => {
    huoqudingyueshu().then((Data) => {
      redisFB({
        reCode: "25",
        ReUserid: oneself_.CHID,
        ReUserQYBH: oneself_.QYBH,
        ReUserName: oneself_.UserName,
        SendUserID: oneself_.CHID,
        SendUserName: oneself_.XM,
        Content: "",
        Data,
      });
    });
  }, 1500);
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
      AspectRatio: meet_layout.aspectRatio,
    },
  });
}
