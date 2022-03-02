$.connection.hub.url = signalrUrl;
const chatHub = $.connection.chatHub;

if (!chatHub || !chatHub.client) {
  alert("请检查服务端是否启动");
  location.reload();
}

// 收听
chatHub.client.broadcastMessage = function (message, channelss) {
  if (channelss == oneself_.RoomId) {
    let mess = JSON.parse(message);
    switch (mess.reCode) {
      /*//设置主讲人
      case "01":
      case "20":
        ZJRID_ = mess.ReUserid;
        break;*/
      //踢出用户
      case "07":
        if (mess.ReUserid == oneself_.CHID) {
          layer.msg("您已被踢出房间", { icon: 2 });
          setTimeout(() => {
            leave();
          }, 1000);
        }
        break;
      //关闭所有人麦克风
      case "03":
        if (ZJRID_ != oneself_.CHID && !oneself_.IsZCR && isMicOn)
          $("#mic_btn").click();
        break;
      //设置主讲人
      case "01":
      case "20":
      //取消主讲人
      case "29":
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
      // 控制用户打开关闭摄像头
      case "05":
      // 关闭所有用户摄像头
      case "22":
        if (mess.ReUserid == oneself_.CHID) {
          $("#video_btn").click();
        }
        break;
      // 控制用户打开关闭麦克风
      case "06":
      // 关闭所有用户麦克风
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

//断开后处理
$.connection.hub.disconnected(function () {
  setTimeout(function () {
    console.log("断开尝试重新连接！");
    $.connection.hub.start();
  }, 3 * 1000);
});

//调用服务端方法
$.connection.hub
  .start()
  .done(function () {
    var RoomId = oneself_?.RoomId || queryParams("RoomId");
    chatHub.server.createRedis(RoomId);
    huoquhuiyihuancun();
    xintiaolianjie();
    // beiyongfangan(RoomId);
  })
  .fail(function (reason) {
    alert("SignalR connection failed: " + reason);
  });

//对象排序
function sortData(a, b) {
  undefined;
  return a.XUHAO - b.XUHAO;
}

function redisFB(data) {
  chatHub.server.redisFB(oneself_.RoomId, JSON.stringify(data));
}

// 收到申请发言的请求
function huoqushenqingfayan(mess) {
  if (!($("#fayan_" + mess.SendUserID)?.length > 0)) {
    let fayanren = $("#fayan_muban").clone();
    fayanren.attr("id", "fayan_" + mess.SendUserID);
    fayanren
      .find(".fayanrenxingming")
      .html(getUserInfo(mess.SendUserID).UserName);
    fayanren.appendTo($("#speakerList"));
    $("#speakerList").scrollTop(99999999);
    fayanren.show();

    fayanren.find(".yunxufayan").on("click", function () {
      yunxufayan(mess.SendUserID);
      shezhizhujiangren(mess.SendUserID);
      $("#fayan_" + mess.SendUserID).remove();
    });
    fayanren.find(".buyunxufayan").on("click", function () {
      $("#fayan_" + mess.SendUserID).remove();
    });

    $("#shenqingfayanliebiao").css("display") == "none" &&
      $("#fayan_jiaobiao").show();
  } else {
    mess.SendUserID != oneself_.CHID &&
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
  let message = $("#message_muban").clone();
  message.attr("id", "message_" + mess.SendUserID);
  message.find(".message_xingming").html(getUserInfo(mess.SendUserID).UserName);
  message.find(".message_time").html(getNowTime());
  message
    .find(".message_neirong")
    .html(
      mess.Content +
        " (发送到：" +
        (mess.SendUserID == ZCRID_
          ? mess.ReUserid
            ? getUserInfo(mess.ReUserid).UserName
            : "全部人"
          : "主持人") +
        ")"
    );
  message.appendTo($("#messageList"));
  if (mess.SendUserID != oneself_.CHID) {
    var touxiang = message.find(".message_touxiang");
    touxiang.prev().insertAfter(touxiang);
    message
      .find(".message_info")
      .removeClass("justify-end")
      .addClass("justify-start");
  }
  message.show();
  $("#messageList").scrollTop(99999999);
  $("#xiaoxiliebiao").css("display") == "none" && $("#xiaoxi_jiaobiao").show();
}

function huoquhuiyihuancunxinxi(mess) {
  if (!mess.ReUserid || mess.Data.VideoConferenceMess.UserList.length == 0) {
    location.reload();
  } else if (mess.ReUserid == oneself_.CHID) {
    roomDetail_ = mess.Data.VideoConferenceMess;
    roomDetail_.UserList.length == 0 && location.reload();
    // 如果没有设置主讲人，将自己设置为假的主讲人
    ZJRID_ = roomDetail_.SpeakerID || oneself_.CHID;
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
  setInterval(() => {
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

function beiyongfangan(RoomId) {
  ajaxMethod("RedisHandler", { Infotype: "GetInfo", RoomId }, (res) => {
    console.log("-----------------------");
    console.log(res);
  });
}
