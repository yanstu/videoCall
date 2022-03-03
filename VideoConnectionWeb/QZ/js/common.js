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
      /*var isExit = confirm("解密失败！\n点击确定重新尝试，点击取消退出网页。");
      isExit ? location.reload() : leave();*/
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
async function viewsHandle() {
  // 处理布局相关
  layoutCompute();
  // 用于翻页、取消主讲人、更改主讲人的处理，清空用户下面再添加进去
  // resetViews();
  // 为当前页用户循环添加至网页上
  addViews();
  // 如果没有设置主讲人，将自己设置为假的主讲人
  ZJRID_ = roomDetail_.SpeakerID || oneself_.CHID;
  // 权限判断按钮显示或隐藏
  showOrHide();
  if (!rtc.isPublished_) {
    // 没有推送过，就是第一次进入房间
    rtc.join();
  }
}

function changeViews() {
  const loadIndex2 = layer.load(1);
  // 此处的ZJRID_代表上一个主讲人
  // 此处的newZJRID代表新的主讲人ID，没有的话设定自己为假主讲人
  var newZJRID = roomDetail_.SpeakerID || oneself_.CHID;
  if (ZJRID_ != newZJRID) {
    // 获取将要成为主讲人的那个远程流
    var zjr_streams =
      newZJRID == oneself_.CHID ? rtc.localStream_ : rtc.members_.get(newZJRID);
    zjr_streams?.stop();
    if (ZJRID_ == oneself_.CHID) {
      // 上一个主讲人是我，停止本地流
      test(rtc.localStream_, oneself_.CHID);
    } else {
      // 上一个主讲人是其他人，停止他的远程流
      test(rtc.members_.get(ZJRID_), ZJRID_);
    }
    function test(stream, ID) {
      stream?.stop();
      if (hasMe(ID)) {
        stream?.play("box_" + ID);
        // 如果远程流不存在，不在线，显示遮罩
        stream ? $("#mask_" + ID).hide() : $("#mask_" + ID).show();
      }
    }
    // 移除原主持人的相关信息
    $("#zjr_video [id^='profile_']").remove();
    $("#zjr_video [id^='player_']").remove();
    $("#zjr_video").append(
      userInfoTemplate(newZJRID, getUserInfo(newZJRID).UserName)
    );
    // 如果新的主持人也存在右侧小视频区域，右侧的小视频将显示遮罩
    hasMe(newZJRID) && $("#mask_" + newZJRID).show();
    zjr_streams?.play("zjr_video");
    zjr_streams ? $("#zjr_mask").hide() : $("#zjr_mask").show();
    $(`#zjr_mask img`).attr("src", `./img/camera-gray.png`);
  }
  // 将参与者列表清空
  for (let user_ of roomDetail_.UserList) {
    $("#member_" + user_.ID).remove();
  }
  // 重新添加至参与者列表，并进行排序
  addMember();
  !isMicOn && $("#mic_btn").click();
  !isCamOn && $("#video_btn").click();
  ZJRID_ = newZJRID;
  // 重新设定新主持人、群众的分辨率
  rtc.shezhifenbianlv();
  // 权限判断按钮显示或隐藏
  showOrHide();
  // 关闭加载中
  layer.close(loadIndex2);
}

function addViews() {
  for (let user_ of layout_.pageUserList) {
    const { ID, UserName } = user_;
    addVideoView(ID, UserName);
  }
  addMember();
  $("#zjr_video").append(
    userInfoTemplate(
      roomDetail_.SpeakerID || oneself_.CHID,
      getUserInfo(roomDetail_.SpeakerID || oneself_.CHID).UserName
    )
  );
}

// 其他地方会复用 所以独立出来
function addMember() {
  // 当主持人不是主讲人的时候显示第一个位置
  roomDetail_.SpeakerID != ZCRID_ &&
    addMemberView(ZCRID_, getUserInfo(ZCRID_).UserName);
  if (roomDetail_.SpeakerID) {
    // 主讲人显示第二个位置
    addMemberView(
      roomDetail_.SpeakerID,
      getUserInfo(roomDetail_.SpeakerID).UserName
    );
  }
  for (let user_ of roomDetail_.UserList) {
    // 跳过主持人和主讲人
    if (user_.ID == ZCRID_ || user_.ID == roomDetail_.SpeakerID) {
      continue;
    }
    const { ID, UserName } = user_;
    addMemberView(ID, UserName);
  }
  // 获取远程流用户的状态，能获取到的都是在线的，所以设定为在线状态
  let states = rtc.client_.getRemoteMutedState();
  for (let state of states) {
    $("#member_" + state.userId)
      .find(".member-id")
      .attr("style", `color: "#ffffff"`);
  }
  // 将自己设定为在线
  $("#member_" + oneself_.CHID)
    .find(".member-id")
    .attr("style", `color: "#ffffff"`);
}

function layoutCompute() {
  layout_.rows = roomDetail_.CHRY_ShowRows == 0 ? 5 : roomDetail_.CHRY_ShowRows;
  layout_.cols = roomDetail_.CHRY_ShowCols == 0 ? 5 : roomDetail_.CHRY_ShowCols;
  layout_.pageSize = layout_.rows * layout_.cols;
  layout_.percentage = 100 / layout_.rows;
  layout_.remainderPage = roomDetail_.UserList.length % layout_.pageSize;
  layout_.pageCount = roomDetail_.UserList.length / layout_.pageSize;
  layout_.pageUserList = roomDetail_.UserList.slice(
    layout_.pageNo * layout_.pageSize,
    ((layout_.pageNo + 1) * layout_.pageSize) % layout_.pageSize == 0
      ? (layout_.pageNo + 1) * layout_.pageSize
      : layout_.pageNo * layout_.pageSize + layout_.remainderPage
  );
  $("#video-grid")
    .css("grid-template-columns", "repeat(" + layout_.cols + ", 1fr)")
    .css(
      "grid-template-rows",
      "repeat(" + layout_.rows + ", " + layout_.percentage + "%)"
    );
}

/**function resetViews() {
  $("#profile_").remove();
  for (let user_ of roomDetail_.UserList) {
    const { ID } = user_;
    $("#box_" + ID).remove();
    $("#mask_" + ID).remove();
    $("#profile_" + ID).remove();
    $("#member_" + ID).remove();
  }
  $("#video_btn svg").html(`<use xlink:href="#icon-xiangji"></use>`);
  $("#mic_btn svg").html(`<use xlink:href="#icon-maikefeng"></use>`);
  $("#zjr_mask img").attr("src", "./img/camera-gray.png");
  $("#zjr_mask").show();
}*/

function hasMe(userId) {
  var exits = layout_.pageUserList.find((user) => user.ID == userId);
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
