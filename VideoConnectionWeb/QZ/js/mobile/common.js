let video_grid =
  "box-border grid w-[9rem] !h-[25%] absolute top-[8%] right-[1%] items-center justify-center z-10";
let zjr_box = "w-full h-full video-box relative";

/**
 * 对视图进行处理
 */
async function viewsHandle() {
  meetLayoutCompute();
  displayLayoutCompute();
  // 修改主讲人
  rtc?.isJoined_ && change();
  ZJRID_ = roomDetail_.SpeakerID || oneself_.CHID;
  // 初始化
  (!rtc || !rtc.isJoined_) && init();
}

async function change() {
  // 还原主讲人与我的位置
  $("#video-grid").attr("class", video_grid);
  $("#zjr_box").attr("class", zjr_box);

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
      rtc.client_.subscribe(zcr_streams);
      // zcr_streams?.play("box_" + ZCRID_);
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

  // 移除原主持人相关信息、添加新的主持人相关信息
  $("#zjr_video [id^='profile_']").remove();
  $("#zjr_video [id^='player_']").remove();
  $("#zjr_video").append(
    userInfoTemplate(newZJRID, getUserInfo(newZJRID).UserName)
  );
  showOrHide();

  if (newZJRID != oneself_.CHID) {
    rtc.client_.subscribe(new_streams);
  } else {
    // 将新主讲人播放到主讲人容器
    new_streams?.play("zjr_video", { objectFit: "cover" });
  }

  new_streams ? $("#zjr_mask").hide() : $("#zjr_mask").show();

  tuisong();

  setTimeout(() => {
    gengxinzhuangtai();
  }, 1000);
}

// 第一次进入的初始化
async function init() {
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
  await rtc.join();
}

// 点击小视频切换大视频
$("#video-grid").on("click", () => {
  if ($("#video-grid > div").length > 0) {
    $("#video-grid").attr("class", zjr_box);
    $("[id^='box_']").attr("class", zjr_box);
    $("#zjr_box").attr(
      "class",
      "box-border grid w-[9rem] !h-[25%] absolute top-[8%] right-[1%] items-center z-10"
    );
  }
});
// 还原
$("#zjr_video").on("click", () => {
  if ($("#video-grid > div").length > 0) {
    $("#video-grid").attr("class", video_grid);
    $("[id^='box_']").attr("class", "w-[9rem] h-full video-box relative");
    $("#zjr_box").attr("class", zjr_box);
  }
});
