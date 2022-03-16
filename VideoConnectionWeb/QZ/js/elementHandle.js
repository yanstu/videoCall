// 根据当前用户权限显示或者隐藏按钮
function showOrHide() {
  // 是否显示申请发言按钮
  if (
    roomDetail_.AllowProposer == "1" &&
    !oneself_.IsZCR &&
    oneself_.CHID != roomDetail_.SpeakerID
  ) {
    $("#shenqingfayan_btn").show();
  } else {
    $("#shenqingfayan_btn").hide();
  }

  // 非安卓端不需要显示翻转相机按钮
  deviceType == DEVICE_TYPE_ENUM.MOBILE_ANDROID && $("#fanzhuan_btn").show();

  // 如果是主持人的话主持人相关权限按钮显示
  if (oneself_.IsZCR) {
    $("#fayanliebiao_btn").show();
    $("#guanbimaikefeng_btn").show();
    $("#shangyiye_btn").show();
    $("#xiayiye_btn").show();
    $("#fayanliebiao_btn").show();
    $(".tidiao_btn").show();
    $(".faxiaoxi_btn").show();
    // 参会端小视频模式主讲人不需要设置主讲人、取消主讲人按钮
    if (location.href.toLowerCase().includes("small")) {
      $(".shezhizhujiangren_btn").hide();
      $("#quxiaozhujiangren_btn").hide();
    } else {
      $(".shezhizhujiangren_btn").show();
      $("#quxiaozhujiangren_btn").show();
    }
  }

  // winform打开的视频连线不显示消息按钮
  window.WSLLZWinFrom && $("#xiaoxi_btn").hide();

  // 手机端没有授权摄像头的不能控制摄像头和翻转按钮
  if (!rtc || !rtc.localStream_) {
    $("#video_btn").hide();
    $("#fanzhuan_btn").hide();
  }
  // 没有麦克风设备的不能控制麦克风按钮和申请发言
  if (!rtc || !rtc.localStream_) {
    $("#mic_btn").hide();
    $("#shenqingfayan_btn").hide();
  }
}

// 设置取消主讲人的处理
async function changeViews() {
  // 此处的ZJRID_代表上一个主讲人
  // 此处的newZJRID代表新的主讲人ID，没有的话设定自己为假主讲人
  var newZJRID = roomDetail_.SpeakerID || oneself_.CHID;

  // 先停止上一个主持人的播放
  if (ZJRID_ == oneself_.CHID) {
    // 上一个主讲人是我，停止本地流
    rePlay(rtc.localStream_, oneself_.CHID);
  } else {
    // 上一个主讲人是其他人，停止他的远程流
    rePlay(rtc.members_.get(ZJRID_), ZJRID_);
  }
  function rePlay(stream, ID) {
    $("#img_" + ID).hide();
    stream?.stop();
    if (hasMe(ID)) {
      stream?.play("box_" + ID, { objectFit: "cover" });
      // 如果远程流不存在，不在线，显示遮罩
      stream ? $("#mask_" + ID).hide() : $("#mask_" + ID).show();
    }
  }
  // 获取将要成为主讲人的那个远程流
  var zjr_streams =
    newZJRID == oneself_.CHID ? rtc.localStream_ : rtc.members_.get(newZJRID);
  zjr_streams?.stop();

  // 移除原主持人的相关信息
  $(`#box_${newZJRID} .volume-level`).css("height", "0%");
  $("#zjr_video [id^='profile_']").remove();
  $("#zjr_video [id^='player_']").remove();
  $("#zjr_video").append(
    userInfoTemplate(newZJRID, getUserInfo(newZJRID).UserName)
  );
  // 如果新的主持人也存在右侧小视频区域，右侧的小视频将显示遮罩
  hasMe(newZJRID) && $("#mask_" + newZJRID).show();
  // 判断是否为手机设备
  var objectFit = getUserInfo(newZJRID).AspectRatio > 1 ? "contain" : "cover";
  if (objectFit == "contain") {
    $("#zjr_box").removeClass("w-full");
    $("#zjr_box").addClass("w-[80%]");
    $("#video-grid").addClass("bg-[#24292e]");
  } else {
    $("#zjr_box").removeClass("w-[80%]");
    $("#zjr_box").addClass("w-full");
    $("#video-grid").removeClass("bg-[#24292e]");
  }
  zjr_streams?.play("zjr_video", { objectFit }).then(() => {
    if (roomDetail_.SpeakerID == oneself_.CHID && meet_layout.aspectRatio > 1) {
      meet_layout.aspectRatio =
        $("#zjr_video").height() / $("#zjr_video").width();
      fasongchangkuanbi();
    }
  });
  tuisong();
  // 主讲人的未推送远程流的话显示遮罩
  zjr_streams ? $("#zjr_mask").hide() : $("#zjr_mask").show();
  // 为新的主讲人取帧
  zjr_streams && videoHandle(true, newZJRID);

  $(`#zjr_mask img`).attr("src", `./img/camera-gray.png`);

  // 将参与者列表清空
  for (let user_ of roomDetail_.UserList) {
    $("#member_" + user_.ID).remove();
  }
  // 重新添加至参与者列表，并进行排序
  addMember();
  !isMicOn && $("#mic_btn").click();
  !isCamOn && $("#video_btn").click();

  ZJRID_ = newZJRID;
  // 权限判断按钮显示或隐藏
  showOrHide();
}

// 添加当前页用户到页面
function addViews() {
  for (let user_ of meet_layout.pageUserList) {
    const { ID, UserName } = user_;
    addVideoView(ID, UserName);
  }
  // 添加用户到参与者列表
  addMember();
  // 主持人左下角添加
  $("#zjr_video").append(
    userInfoTemplate(
      roomDetail_.SpeakerID || oneself_.CHID,
      getUserInfo(roomDetail_.SpeakerID || oneself_.CHID).UserName
    )
  );
}

// 添加发言人到发言人列表
function addSpeaker(fayanrenId) {
  let fayanren = $("#fayan_muban").clone();
  fayanren.attr("id", "fayan_" + fayanrenId);
  fayanren.find(".fayanrenxingming").html(getUserInfo(fayanrenId).UserName);
  fayanren.appendTo($("#speakerList"));
  $("#speakerList").scrollTop(99999999);
  fayanren.show();
  // 绑定允许发言事件，为按钮绑定ID
  fayanren.find(".yunxufayan").on("click", function () {
    yunxufayan(fayanrenId);
    shezhizhujiangren(fayanrenId);
    $("#fayan_" + fayanrenId).remove();
  });
  // 绑定不允许发言事件，为按钮绑定ID
  fayanren.find(".buyunxufayan").on("click", function () {
    $("#fayan_" + fayanrenId).remove();
  });
  // 如果申请发言列表为没有打开的状态，显示发言列表的角标提醒
  $("#shenqingfayanliebiao").css("display") == "none" &&
    $("#fayan_jiaobiao").show();
}

// 增加消息到消息列表
function addMessage(fasongren, jieshouren, neirong) {
  let message = $("#message_muban").clone();
  message.attr("id", "message_" + fasongren);
  message.find(".message_xingming").html(getUserInfo(fasongren).UserName);
  message.find(".message_time").html(getNowTime());
  message
    .find(".message_neirong")
    .html(
      neirong +
        " (发送到：" +
        (fasongren == ZCRID_
          ? jieshouren
            ? getUserInfo(jieshouren).UserName
            : "全部人"
          : "主持人") +
        ")"
    );
  message.appendTo($("#messageList"));
  if (fasongren != oneself_.CHID) {
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
  for (let member of rtc.members_) {
    $("#member_" + member[0])
      .find(".member-id")
      .attr("style", `color: "#ffffff"`);
  }
  // 将自己设定为在线
  $("#member_" + oneself_.CHID)
    .find(".member-id")
    .attr("style", `color: "#ffffff"`);
}

// 布局计算，手机端不改变小视频区域网格布局
function layoutCompute() {
  meet_layout.pageSize = meet_layout.rows * meet_layout.cols;
  meet_layout.percentage = 100 / meet_layout.rows;
  meet_layout.remainder = roomDetail_.UserList.length % meet_layout.pageSize;
  meet_layout.pageCount = Math.ceil(
    roomDetail_.UserList.length / meet_layout.pageSize
  );
  meet_layout.count = roomDetail_.UserList.length;
  meet_layout.pageUserList = roomDetail_.UserList.slice(
    meet_layout.pageNo * meet_layout.pageSize,
    ((meet_layout.pageNo + 1) * meet_layout.pageSize) % meet_layout.pageSize ==
      0
      ? (meet_layout.pageNo + 1) * meet_layout.pageSize
      : meet_layout.pageNo * meet_layout.pageSize + meet_layout.remainder
  );
  if (
    location.href.toLowerCase().includes("index") ||
    location.href.toLowerCase().includes("big")
  ) {
    $("#video-grid")
      .css("grid-template-columns", "repeat(" + meet_layout.cols + ", 1fr)")
      .css(
        "grid-template-rows",
        "repeat(" + meet_layout.rows + ", " + meet_layout.percentage + "%)"
      );
  }
}

// 展示端布局计算，手机端不改变小视频区域网格布局
function displayLayoutCompute() {
  display_layout.pageSize = display_layout.rows * display_layout.cols;
  display_layout.percentage = 100 / display_layout.rows;
  display_layout.remainder =
    roomDetail_.UserList.length % display_layout.pageSize;
  display_layout.pageCount = Math.ceil(
    roomDetail_.UserList.length / display_layout.pageSize
  );
  display_layout.count = roomDetail_.UserList.length;
  display_layout.pageUserList = roomDetail_.UserList.slice(
    display_layout.pageNo * display_layout.pageSize,
    ((display_layout.pageNo + 1) * display_layout.pageSize) %
      display_layout.pageSize ==
      0
      ? (display_layout.pageNo + 1) * display_layout.pageSize
      : display_layout.pageNo * display_layout.pageSize +
          display_layout.remainder
  );
}

// 清空小视频和主讲人盒子
function resetViews() {
  $("#profile_").remove();
  for (let user_ of roomDetail_.UserList) {
    const { ID } = user_;
    $("#box_" + ID).remove();
    $("#mask_" + ID).remove();
    $("#profile_" + ID).remove();
    $("#member_" + ID).remove();
  }
}

// 麦克风开关状态控制
function audioHandle(on, userId) {
  console.log(
    `${getUserInfo(userId)?.UserName} ${on ? "打开" : "关闭"}了麦克风`
  );
  $("#member_" + userId)
    .find(".member-audio-btn")
    .attr("src", `img/mic-${on ? "on" : "off"}.png`);
  $(`#mic_main_${userId} .member-audio-btn`).attr(
    "src",
    `img/mic-${on ? "on" : "off"}.png`
  );
}

// 视频开关状态控制
function videoHandle(on, userId) {
  var zjr =
    roomDetail_.SpeakerID ||
    (location.href.toLowerCase().includes("big.html") ? ZCRID_ : oneself_.CHID);
  console.log(
    `${getUserInfo(userId)?.UserName} ${on ? "打开" : "关闭"}了摄像头`
  );
  $("#member_" + userId)
    .find(".member-video_btn")
    .attr("src", `img/camera-${on ? "on" : "off"}.png`);
  !on && $(`#mask_${userId} img`).attr("src", `./img/camera-green.png`);

  if (userId == zjr) {
    on ? $("#zjr_mask").hide() : $("#zjr_mask").show();
    // on && $("#mask_" + userId).show();
    !on && $(`#zjr_mask img`).attr("src", `./img/camera-green.png`);
    if (location.href.toLowerCase().includes("small")) {
      on ? $("#mask_" + userId).hide() : $("#mask_" + userId).show();
    }
    if (on) {
      videoImgTimer && clearInterval(videoImgTimer);
      var stream =
        userId == oneself_.CHID ? rtc?.localStream_ : rtc.members_.get(userId);
      $("#mask_" + userId).hide();
      var img = "";
      function getImg() {
        setTimeout(() => {
          img = stream?.getVideoFrame();
          if (img != "data:,") {
            $("#mask_" + userId).hide();
            $("#img_" + userId)
              .attr("src", img)
              .show();
          } else {
            $("#mask_" + userId).show();
            setTimeout(() => {
              getImg();
            }, 1000);
          }
        }, 100);
      }
      stream && getImg();

      videoImgTimer = setInterval(() => {
        $("#img_" + userId)
          .attr("src", stream?.getVideoFrame())
          .show();
      }, 60 * 1000);
    } else {
      videoImgTimer && clearInterval(videoImgTimer);
      $("#img_" + userId).hide();
      $("#mask_" + userId).show();
    }
  } else {
    on ? $("#mask_" + userId).hide() : $("#mask_" + userId).show();
  }
}

function setTitle(Title) {
  $("title").html(Title);
  $("#roomTitle").html(Title);
}

/**
 * 添加成员列表
 * Add a member to the member list
 * @param ID - The ID of the member to add.
 * @param UserName - The name of the user to add to the member list.
 */
function addMemberView(ID, UserName) {
  let member = $("#member-me").clone();
  member.attr("id", "member_" + ID);
  member.find(".member-id").html(
    (ID == roomDetail_.SpeakerID
      ? `<svg class="icon text-[0.9rem] text-[#ffa500] mr-1" aria-hidden="true">
          <use xlink:href="#icon-zhujiangren"></use>
        </svg>`
      : `<span class="mr-[1.15rem]"></span>`) + UserName
  );
  if (ID == ZCRID_) {
    member.find(".faxiaoxi_btn").remove();
    member.find(".tidiao_btn").remove();
  } else {
    member.find(".tidiao_btn").on(
      "click",
      clickProof(() => {
        if (member.find(".member-id").attr("style").indexOf("7c7f85") > -1) {
          layer.msg("不能对离线用户进行操作");
          return;
        }
        tidiao(ID);
      })
    );
    member.find(".faxiaoxi_btn").on("click", () => {
      if (member.find(".member-id").attr("style").indexOf("7c7f85") > -1) {
        layer.msg("不能对离线用户进行操作");
        return;
      }
      fasonggeishei = ID;
      $("#xiaoxi_btn").click();
    });
  }
  member.find(".member-video_btn").on(
    "click",
    clickProof(() => {
      if (oneself_.IsZCR) {
        if (member.find(".member-id").attr("style").indexOf("7c7f85") > -1) {
          layer.msg("不能对离线用户进行操作");
          return;
        }
        /*if (!rtc.members_.get(ID) && ZCRID_ != ID) {
          layer.msg("用户设备异常，不能操作摄像头");
          return;
        }*/
        dakaiguanbishexiangtou(ID);
      }
    })
  );
  member.find(".member-audio-btn").on(
    "click",
    clickProof(() => {
      if (oneself_.IsZCR) {
        if (member.find(".member-id").attr("style").indexOf("7c7f85") > -1) {
          layer.msg("不能对离线用户进行操作");
          return;
        }
        /*if (!rtc.members_.get(ID) && ZCRID_ != ID) {
          layer.msg("用户设备异常，不能操作麦克风");
          return;
        }*/
        dakaiguanbimaikefeng(ID);
      }
    })
  );
  member.find(".shezhizhujiangren_btn").on(
    "click",
    clickProof(() => {
      if (oneself_.IsZCR) {
        if (member.find(".member-id").attr("style").indexOf("7c7f85") > -1) {
          layer.msg("不能对离线用户进行操作");
          return;
        }
        /*if (!rtc.members_.get(ID) && ZCRID_ != ID) {
          layer.msg("用户设备异常，不能设为主讲人");
          return;
        }*/
        shezhizhujiangren(ID);
      }
    }, 1200)
  );
  member.appendTo($("#member-list"));
  member.show();
}

/**
 * 添加视频占位
 * Add a video box to the video grid
 * @param userId - The user ID of the user you want to add.
 * @param nickName - the nickName of the user
 */
function addVideoView(ID, NickName) {
  $("#video-grid").append(videoBoxTemplate(ID, NickName));
}

/**
 * 其他用户在线或者离线后页面的改变，不包括自己
 * @param {boolean} online 在线还是离线
 * @param {string} uid 用户id
 */
function onlineOrOfline(online, userId) {
  var zjr = roomDetail_.SpeakerID || oneself_.CHID;
  // 针对主讲人在线或离线时的状态改变
  if (userId == zjr) {
    if (rtc.members_.get(userId) && online) {
      $("#zjr_mask").hide();
    } else {
      $("#zjr_mask").show();
    }
    if (oneself_.CHID == userId) {
      online ? $("#zjr_mask").hide() : $("#zjr_mask").show();
    }
    online
      ? $(`#zjr_mask img`).attr("src", "./img/camera-green.png")
      : $(`#zjr_mask img`).attr("src", "./img/camera-gray.png");
  } else {
    if (rtc.members_.get(userId) && online) {
      $("#mask_" + userId).hide();
    } else {
      $("#mask_" + userId).show();
    }
    if (oneself_.CHID == userId) {
      online ? $("#mask_" + userId).hide() : $("#mask_" + userId).show();
    }
  }
  // 改变遮罩摄像头图片颜色
  online
    ? $(`#mask_${userId} img`).attr("src", "./img/camera-green.png")
    : $(`#mask_${userId} img`).attr("src", "./img/camera-gray.png");
  // 改变用户列表用户在线状态颜色
  $("#member_" + userId)
    .find(".member-id")
    .attr("style", `color: ${online ? "#ffffff;" : "#7c7f85;"};`);
  // 只针对离线的改变
  if (!online) {
    $(`#mic_main_${userId} .member-audio-btn`).attr("src", "img/mic-on.png");
    $(`#member_${userId} .member-audio-btn`).attr("src", "img/mic-on.png");
    $("#member_" + userId)
      .find(".member-video_btn")
      .attr("src", "img/camera-on.png");
    // $(`#mask_${userId} img`).attr("src", "./img/camera-gray.png");
    $(`#mic_main_${userId} .volume-level`).css("height", "0%");
    $(`#fayan_${userId}`).remove();
    if ($("#speakerList > div").length == 1) {
      $("#fayan_jiaobiao").hide();
    }
  }
}

// 展示端切换显示模式
function zhanshiduan_mode(state) {
  switch (state) {
    case 1:
      // 展示端切换到主讲人模式
      if (location.href.toLowerCase().includes("big")) {
        $("#video-grid").fadeOut();
      } else {
        location.replace(
          location.origin +
            location.pathname.substring(
              0,
              location.pathname.lastIndexOf("/") + 1
            ) +
            "big.html" +
            location.href.substring(location.href.indexOf("?")) +
            "&h=1"
        );
      }
      break;
    case 2:
      // 展示端切换到主讲人+小视频模式
      if (location.href.toLowerCase().includes("big")) {
        $("#video-grid").fadeIn();
      } else {
        location.replace(
          location.origin +
            location.pathname.substring(
              0,
              location.pathname.lastIndexOf("/") + 1
            ) +
            "big.html" +
            location.href.substring(location.href.indexOf("?"))
        );
      }
      break;
    case 3:
      // 参会端切换到小视频模式
      if (!location.href.toLowerCase().includes("small2")) {
        location.replace(
          location.origin +
            location.pathname.substring(
              0,
              location.pathname.lastIndexOf("/") + 1
            ) +
            "small2.html" +
            location.href.substring(location.href.indexOf("?"))
        );
      }
      break;
  }
}
