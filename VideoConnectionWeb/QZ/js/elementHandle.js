function showOrHide() {
  $("#video-grid").removeClass("w-[0%]");
  $("#video-grid").addClass("w-[30%]");
  $("#zjr_box").removeClass("w-[100%]");
  $("#zjr_box").addClass("w-[70%]");

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
    (ID == ZJRID_
      ? `<svg class="icon text-[0.9rem] text-[#ffa500] mr-1" aria-hidden="true">
          <use xlink:href="#icon-zhujiangren"></use>
        </svg>`
      : "") + UserName
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
        if (ID != ZJRID_) {
          shezhizhujiangren(ID);
        } else {
          layer.msg("该用户已经是主讲人了。");
        }
      }
    })
  );
  member.appendTo($("#member-list"));
  member.show();
}

/**
 * 添加“摄像头未打开”遮罩
 */
function addMaskView(ID) {
  let mask = $("#zjr_mask").clone();
  mask.attr("id", "mask_" + ID);
  mask.appendTo($("#box_" + ID));
  mask.show();
}

/**
 * 添加视频占位
 * Add a video box to the video grid
 * @param userId - The user ID of the user you want to add.
 * @param nickName - the nickName of the user
 */
function addVideoView(userId, nickName) {
  let div = $("<div/>", {
    id: "box_" + userId,
    class: "video-box relative",
    style: "justify-content: center",
  });
  div.append(userInfoTemplate(userId, nickName));
  div.appendTo("#video-grid");
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
  }
  $("#member_" + userId)
    .find(".member-id")
    .attr("style", `color: ${online ? "#ffffff" : "#7c7f85"};`);
  if (ZJRID_ != userId) {
    online ? $("#mask_" + userId).hide() : $("#mask_" + userId).show();
  }
  if (!online) {
    $(`#mic_main_${userId} .member-audio-btn`).attr("src", "img/mic-on.png");
    $(`#member_${userId} .member-audio-btn`).attr("src", "img/mic-on.png");
    $("#member_" + userId)
      .find(".member-video_btn")
      .attr("src", "img/camera-on.png");
    $(`#mask_${userId} img`).attr("src", "./img/camera-gray.png");
  }
}
