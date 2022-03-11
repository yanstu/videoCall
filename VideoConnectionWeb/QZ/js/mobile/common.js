/**
 * 对视图进行处理
 */
async function viewsHandle(mess) {
  if (mess) {
    roomDetail_ = mess.Data.VideoConferenceMess;
    setTitle(roomDetail_.Title);
    roomDetail_.UserList.length == 0 && location.reload();
    roomDetail_.UserList = roomDetail_.UserList.sort(sortData);
    ZCRID_ = roomDetail_.UserList.find((item) => item.IsZCR == 1).ID;
  }
  // 修改主讲人
  rtc.isPublished_ && change();
  ZJRID_ = roomDetail_.SpeakerID || oneself_.CHID;
  // 初始化
  !rtc.isPublished_ && init();
}

async function change() {
  // 还原
  $("#video-grid").attr(
    "class",
    "box-border grid w-[9rem] h-[25%] absolute top-[8%] right-[1%] items-center justify-center z-10"
  );
  $("#zjr_box").attr("class", "w-full h-full video-box relative");
  // 如果当前没有主讲人，将主持人作为主讲人视角，如果主持人没有在线，将自己设为主讲人视角
  var newZJRID = roomDetail_.SpeakerID || oneself_.CHID;
  // 先停止上一个主讲人的远程流
  var old_streams = rtc.members_.get(ZJRID_);
  old_streams?.stop();
  // 再停止新的主讲人的远程流
  var new_streams =
    newZJRID == oneself_.CHID ? rtc.localStream_ : rtc.members_.get(newZJRID);
  new_streams?.stop();
  if (newZJRID == oneself_.CHID) {
    // 如果新的主讲人是我，清空小视频区域
    resetViews();
    if (!roomDetail_.SpeakerID) {
      var zcr_streams = rtc.members_.get(ZCRID_);
      zcr_streams?.stop();
      addVideoView(ZCRID_, getUserInfo(ZCRID_).UserName);
      $("#box_" + ZCRID_).attr("class", "w-[9rem] h-full video-box relative");
      zcr_streams.play("box_" + ZCRID_);
    }
  } else {
    if (ZJRID_ == oneself_.CHID) {
      resetViews();
      rtc.localStream_.stop();
      addVideoView(oneself_.CHID, oneself_.XM);
      $("#box_" + oneself_.CHID).attr(
        "class",
        "w-[9rem] h-full video-box relative"
      );
      $("#video-grid [id^='player_']").remove();
      rtc.localStream_.play("box_" + oneself_.CHID);
      $("#mask_" + oneself_.CHID).hide();
    }
  }
  $("#zjr_video [id^='profile_']").remove();
  $("#zjr_video [id^='player_']").remove();
  $("#zjr_video").append(
    userInfoTemplate(newZJRID, getUserInfo(newZJRID).UserName)
  );
  new_streams?.play("zjr_video", { objectFit: "cover" }).then(() => {
    if (roomDetail_.SpeakerID == oneself_.CHID) {
      layout_.aspectRatio = $("#zjr_video").height() / $("#zjr_video").width();
      fasongchangkuanbi();
    }
  });
  new_streams ? $("#zjr_mask").hide() : $("#zjr_mask").show();
  !isMicOn && $("#mic_btn").click();
  !isCamOn && $("#video_btn").click();
  showOrHide();
}

function init() {
  if (ZJRID_ == oneself_.CHID) {
    if (!roomDetail_.SpeakerID) {
      var zcr_streams = rtc.members_.get(ZCRID_);
      zcr_streams?.stop();
      addVideoView(ZCRID_, getUserInfo(ZCRID_).UserName);
      $("#box_" + ZCRID_).attr("class", "w-[9rem] h-full video-box relative");
    }
    $("#zjr_video").append(
      userInfoTemplate(ZJRID_, getUserInfo(ZJRID_).UserName)
    );
  } else {
    addVideoView(oneself_.CHID, oneself_.XM);
    $("#box_" + oneself_.CHID).append(
      userInfoTemplate(oneself_.CHID, oneself_.XM)
    );
    $("#box_" + oneself_.CHID).attr(
      "class",
      "w-[9rem] h-full video-box relative"
    );
    $("#zjr_video").append(
      userInfoTemplate(ZJRID_, getUserInfo(ZJRID_).UserName)
    );
  }
  rtc.join();
}

// 点击小视频切换大视频
$("#video-grid").on("click", () => {
  if ($("#video-grid > div").length > 0) {
    $("#video-grid").attr("class", "w-full h-full video-box relative");
    var uid = !roomDetail_.SpeakerID ? ZCRID_ : oneself_.CHID;
    $("#box_" + uid).attr("class", "w-full h-full video-box relative");
    $("#zjr_box").attr(
      "class",
      "box-border grid w-[9rem] h-[25%] absolute top-[8%] right-[1%] items-center z-10"
    );
  }
});
// 还原
$("#zjr_video").on("click", () => {
  if ($("#video-grid > div").length > 0) {
    $("#video-grid").attr(
      "class",
      "box-border grid w-[9rem] h-[25%] absolute top-[8%] right-[1%] items-center justify-center z-10"
    );
    var uid = !roomDetail_.SpeakerID ? ZCRID_ : oneself_.CHID;
    $("#box_" + uid).attr("class", "w-[9rem] h-full video-box relative");
    $("#zjr_box").attr("class", "w-full h-full video-box relative");
  }
});

// 查询当前页的用户列表是否包含该用户
function hasMe(userId) {
  var exits = layout_.pageUserList.find((user) => user.ID == userId);
  return !!exits;
}
