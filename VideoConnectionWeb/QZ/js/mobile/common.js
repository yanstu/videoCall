// SDK demo变量
let isCamOn = true;
let isMicOn = true;
let rtc = null;
let cameraId = "";
let micId = "";
var cameraData = new Array();
var micData = new Array();

// 自定义变量
let oneself_ = {
  // userid
  CHID: "3ed11cbd7d3c4d769fa6e177f8f5b034",
  // 房间id
  ID: "3c646b7421f84fe5811b295df5f5a1c2",
  IsLZ: false,
  // 是否主持人
  IsZCR: false,
  // 区域编码
  QYBH: "00",
  // 房间id
  RoomId: "7",
  SDKAppID: "1400575117",
  Title: "视频连线测试2",
  UserSig:
    "eJwtjM0KgkAYRd9ltoXO5-yZ0CaiDCwINWipzkwMqehkoUXvnpjLe*4994OSKHZeyqIAeQ5GyykbqerOaDNhoiRAkUshSUGl4CudcQVCaF*zHBM6Ow95z5rGyNEAijETDEDMneobYxUKOKY*xn-WmWokwOm4JJyz*cXcxoPLgiehddtzFQ-hsbV9WZMyja7es3Pf6VZEG*WeLrDbD4c1*v4AXaU4QQ__",
  XM: "严鑫",
};
let roomDetail_ = {
  // 需要申请发言 0否/1是
  AllowProposer: 1,
  // 允许录制 0否/1是
  AllowREC: 0,
  // 显示列数
  CHRY_ShowCols: 2,
  // 显示行数
  CHRY_ShowRows: 5,
  // 不用开摄像头的听众
  MessList: [],
  // 在线列表
  ProposerList: [],
  // 主讲人UD
  SpeakerID: "fe130caac11a4d60b4357713c7d03415",
  // 主讲人姓名
  SpeakerName: "刘世荣",
  // 房间名
  Title: "视频连线测试2",
  // 参加会议人员列表
  UserList: [],
};
let layout_ = {
  // 行数
  rows: 5,
  // 列数
  cols: 2,
  // 页面视频数
  pageSize: 10,
  // 总页数
  pageCount: 0,
  // 余数
  remainderPage: 0,
  // 当前第几页
  pageNo: 0,
  // 当前页的用户列表
  pageUserList: [],
  // 百分比
  percentage: 100 / 5,
  // 长宽比
  aspectRatio: 0,
};
let ZCRID_ = "";
let ZJRID_ = "";
let fasonggeishei = "";
// 10秒鼠标键盘无操作将隐藏菜单栏
let menuHideTimer = {
  count: 0,
  time: 10, //秒
  x: 0,
  y: 0,
};

/**
 * 解密获取房间信息
 * @param { string } JMStr 密钥
 */
function login(JMStr) {
  ajaxMethod("checkJRHYInfo", { JMStr }, (res) => {
    if (!res.Data) {
      alert("解密失败，请检查链接。");
      leave();
    }
    oneself_ = res.Data;
    $("title").html(res.Data.Title);
    $("#roomTitle").html(res.Data.Title);

    rtc = new RtcClient({
      nickName: res.Data.XM,
      userId: res.Data.CHID,
      sdkAppId: parseInt(res.Data.SDKAppID),
      userSig: res.Data.UserSig,
      roomId: res.Data.RoomId,
    });

    trtcPreliminaryDetection();
  });
}

/**
 * 对视图进行处理
 */
async function viewsHandle(mess) {
  if (mess) {
    roomDetail_ = mess.Data.VideoConferenceMess;
    roomDetail_.UserList.length == 0 && location.reload();
    roomDetail_.UserList = roomDetail_.UserList.sort(sortData);
    ZCRID_ = roomDetail_.UserList.find((item) => item.IsZCR == 1).ID;
  }
  if (ZJRID_ && roomDetail_.SpeakerID && ZJRID_ == roomDetail_.SpeakerID)
    return;

  rtc.isPublished_ && change();

  // 如果没有设置主讲人，将自己设置为假的主讲人
  ZJRID_ = roomDetail_.SpeakerID || oneself_.CHID;

  !rtc.isPublished_ && init();
}

async function change() {
  $("#video-grid").attr(
    "class",
    "box-border grid w-[35%] h-[25%] absolute top-[8%] right-[1%] items-center justify-center z-10"
  );
  $("#zjr_box").attr("class", "w-full h-full video-box relative");
  var newZJRID = roomDetail_.SpeakerID || oneself_.CHID;
  var old_streams = rtc.members_.get(ZJRID_);
  old_streams?.stop();
  var new_streams =
    newZJRID == oneself_.CHID ? rtc.localStream_ : rtc.members_.get(newZJRID);
  new_streams & new_streams.stop();
  if (newZJRID == oneself_.CHID) {
    resetViews();
  } else {
    if (ZJRID_ == oneself_.CHID) {
      resetViews();
      rtc.localStream_.stop();
      addVideoView(oneself_.CHID, oneself_.XM);
      $("#box_" + oneself_.CHID).append(
        userInfoTemplate(oneself_.CHID, oneself_.XM)
      );
      rtc.localStream_.play("box_" + oneself_.CHID);
      $("#mask_" + oneself_.CHID).hide();
    }
  }
  $("#zjr_video [id^='profile_']").remove();
  $("#zjr_video [id^='player_']").remove();
  $("#zjr_video").append(
    userInfoTemplate(newZJRID, getUserInfo(newZJRID).UserName)
  );
  new_streams?.play("zjr_video", { objectFit: "cover" });
  new_streams ? $("#zjr_mask").hide() : $("#zjr_mask").show();
  rtc.shezhifenbianlv();
}

function init() {
  if (ZJRID_ == oneself_.CHID) {
    $("#zjr_video").append(
      userInfoTemplate(ZJRID_, getUserInfo(ZJRID_).UserName)
    );
  } else {
    addVideoView(oneself_.CHID, oneself_.XM);
    $("#box_" + oneself_.CHID).append(
      userInfoTemplate(oneself_.CHID, oneself_.XM)
    );
    $("#zjr_video").append(
      userInfoTemplate(ZJRID_, getUserInfo(ZJRID_).UserName)
    );
  }
  rtc.join();
}

$("#video-grid").on("click", () => {
  if ($("#video-grid > div").length > 0) {
    $("#video-grid").attr("class", "w-full h-full video-box relative");
    $("#zjr_box").attr(
      "class",
      "box-border grid w-[35%] h-[25%] absolute top-[8%] right-[1%] items-center z-10"
    );
  }
});
$("#zjr_video").on("click", () => {
  if ($("#video-grid > div").length > 0) {
    $("#video-grid").attr(
      "class",
      "box-border grid w-[35%] h-[25%] absolute top-[8%] right-[1%] items-center justify-center z-10"
    );
    $("#zjr_box").attr("class", "w-full h-full video-box relative");
  }
});

// 查询当前页的用户列表是否包含该用户
function hasMe(userId) {
  var exits = roomDetail_.UserList.find((user) => user.ID == userId);
  return !!exits;
}

/**
 * 查询用户信息
 * @param {string} ID 需要查询的用户id
 * @returns 用户对象
 */
function getUserInfo(ID) {
  return roomDetail_.UserList.find((item) => item.ID == ID);
}

/**
 * It returns the user information for the user with the specified name.
 * @param UserName - The name of the user you want to get information about.
 * @returns The user object.
 */
function getUserInfoByName(UserName) {
  return roomDetail_.UserList.find((item) => item.UserName == UserName);
}

/**
 * 离开房间并关闭网页
 */
function leave() {
  rtc && rtc.leave();
  let hasPre = false;
  if (window.history.length > 1) hasPre = true;
  function closeWindow() {
    if (window.WeixinJSBridge) {
      window.WeixinJSBridge.call("closeWindow");
    } else {
      if (
        navigator.userAgent.indexOf("Firefox") != -1 ||
        navigator.userAgent.indexOf("Chrome") != -1
      ) {
        window.location.href = "about:blank";
        window.close();
      } else {
        try {
          window.opener = null;
          window.open("", "_self");
          window.close();
        } catch (error) {
          window.open(location, "_self").close();
        }
      }
    }
  }
  hasPre ? window.history.go(-1) : closeWindow();
}

/**
 * Mute the local audio stream
 */
function muteAudio() {
  rtc && rtc.muteLocalAudio();
}

/**
 * Unmute the local audio
 */
function unmuteAudio() {
  rtc && rtc.unmuteLocalAudio();
}

/**
 * Mute the local video
 */
function muteVideo() {
  rtc && rtc.muteLocalVideo();
}

/**
 * Unmute the local video
 */
function unmuteVideo() {
  rtc && rtc.unmuteLocalVideo();
}

/**
 * * Set the cameraId variable to the value of the id attribute of the div element that was clicked
 * @param thisDiv - the div that was clicked on
 */
function setCameraId(thisDiv) {
  cameraId = $(thisDiv).attr("id");
  console.log("setCameraId: " + cameraId);
}

/**
 * * Set the micId variable to the id of the div that was clicked
 * @param thisDiv - The div that was clicked.
 */
function setMicId(thisDiv) {
  micId = $(thisDiv).attr("id");
  console.log("setMicId: " + micId);
}

/**
 * It returns the cameraId.
 * @returns The camera ID.
 */
function getCameraId() {
  console.log("选择摄像头: " + cameraId);
  return cameraId;
}

/**
 * It returns the id of the microphone that is currently selected.
 * @returns the value of the variable micId.
 */
function getMicrophoneId() {
  console.log("选择麦克风: " + micId);
  return micId;
}

/**
 * 防止频繁点击和防止断网点击
 */
function clickProof(callback, delay = 500) {
  // 默认值不要是Date.now() ==> 第1次事件立即调用
  let pre = 0;
  return function (event) {
    if (window.WeixinJSBridge) {
      window.WeixinJSBridge.invoke("getNetworkType", (e) => {
        if (e.err_msg.indexOf("fail") > -1) isDisconnect = true;
      });
    }
    if (isDisconnect || !navigator.onLine) {
      layer.msg("当前网络已断开", { icon: 5 });
    } else {
      // 节流函数/真正的事件回调函数   this是发生事件的标签
      const current = Date.now();
      if (current - pre > delay) {
        // 只有离上一次调用callback的时间差大于delay
        // 调用真正处理事件的函数, this是事件源, 参数是event
        callback.call(this, event);
        // 记录此次调用的时间
        pre = current;
      } else {
        layer.msg("请勿频繁操作");
      }
    }
  };
}