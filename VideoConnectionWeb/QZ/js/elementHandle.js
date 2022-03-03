function showOrHide() {
  // 是否显示申请发言按钮
  var jiadezhujiangren =
    (ZJRID_ == oneself_.CHID && roomDetail_.SpeakerName != oneself_.XM) ||
    ZJRID_ != oneself_.CHID;
  if (roomDetail_.AllowProposer == "1" && !oneself_.IsZCR && jiadezhujiangren) {
    $("#shenqingfayan_btn").show();
  } else {
    $("#shenqingfayan_btn").hide();
  }

  // 非手机端不需要显示翻转相机按钮
  getOS().type === "mobile" && $("#fanzhuan_btn").show();

  // 如果是主持人的话主持人相关权限按钮显示
  if (oneself_.IsZCR) {
    $("#fayanliebiao_btn").show();
    $("#guanbimaikefeng_btn").show();
    $("#quxiaozhujiangren_btn").show();
    $("#fayanliebiao_btn").show();
    $(".shezhizhujiangren_btn").show();
    $(".tidiao_btn").show();
    $(".faxiaoxi_btn").show();
  }

  // 非本页的不需要摄像头按钮
  if (!hasMe(oneself_.CHID) && !oneself_.IsZCR && ZJRID_ != oneself_.CHID) {
    $("#video_btn").hide();
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

function videoHandle(on, userId) {
  console.log(
    `${getUserInfo(userId)?.UserName} ${on ? "打开" : "关闭"}了摄像头`
  );
  $("#member_" + userId)
    .find(".member-video_btn")
    .attr("src", `img/camera-${on ? "on" : "off"}.png`);
  !on && $(`#mask_${userId} img`).attr("src", `./img/camera-green.png`);

  if (userId == ZJRID_) {
    on ? $("#zjr_mask").hide() : $("#zjr_mask").show();
    on && $("#mask_" + ZJRID_).show();
    !on && $(`#zjr_mask img`).attr("src", `./img/camera-green.png`);
  } else {
    on ? $("#mask_" + userId).hide() : $("#mask_" + userId).show();
  }
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
        tidiao(ID);
      })
    );
    member.find(".faxiaoxi_btn").on("click", () => {
      fasonggeishei = ID;
      $("#xiaoxi_btn").click();
    });
  }
  member.find(".member-video_btn").on(
    "click",
    clickProof(() => {
      if (oneself_.IsZCR) {
        if (hasMe(ID)) {
          dakaiguanbishexiangtou(ID);
        } else {
          layer.msg("该用户不在当前页，无法控制摄像头。");
        }
      }
    })
  );
  member.find(".member-audio-btn").on(
    "click",
    clickProof(() => {
      if (oneself_.IsZCR) {
        dakaiguanbimaikefeng(ID);
      }
    })
  );
  member.find(".shezhizhujiangren_btn").on(
    "click",
    clickProof(() => {
      if (oneself_.IsZCR) {
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
  let box = $("#zjr_video").clone();
  box.attr("id", "box_" + ID);
  box.attr("class", "w-[99%] h-[99%] video-box relative");
  box.find("#zjr_mask").attr("id", "mask_" + ID);
  box.append(userInfoTemplate(ID, NickName));
  box.appendTo("#video-grid");
}

/**
 * 其他用户在线或者离线后页面的改变，不包括自己
 * @param {boolean} online 在线还是离线
 * @param {string} uid 用户id
 */
function onlineOrOfline(online, userId) {
  if (userId == ZJRID_) {
    online ? $("#zjr_mask").hide() : $("#zjr_mask").show();
    !online
      ? $(`#zjr_mask img`).attr("src", "./img/camera-gray.png")
      : $(`#zjr_mask img`).attr("src", "./img/camera-green.png");
  } else {
    online ? $("#mask_" + userId).hide() : $("#mask_" + userId).show();
  }
  $("#member_" + userId)
    .find(".member-id")
    .attr("style", `color: ${online ? "#ffffff" : "#7c7f85"};`);
  if (!online) {
    $(`#mic_main_${userId} .member-audio-btn`).attr("src", "img/mic-on.png");
    $(`#member_${userId} .member-audio-btn`).attr("src", "img/mic-on.png");
    $("#member_" + userId)
      .find(".member-video_btn")
      .attr("src", "img/camera-on.png");
    $(`#mask_${userId} img`).attr("src", "./img/camera-gray.png");
  }
}
