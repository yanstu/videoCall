/**
 * 对视图进行处理
 */
async function viewsHandle() {
  // 处理布局相关
  meetLayoutCompute();
  displayLayoutCompute();
  // 用于翻页、取消主讲人、更改主讲人的处理，清空用户下面再添加进去
  resetViews();
  // 如果没有设置主讲人，设定主持人为主讲人视角
  ZJRID_ = roomDetail_.SpeakerID || ZCRID_;
  // 为当前页用户循环添加至网页上
  for (let user of roomDetail_.UserList) {
    const { ID, UserName } = user;
    addVideoView(ID, UserName);
    !getUserInfoByDisplay(ID) && $("#box_" + ID).hide();
  }
  $("#zjr_video").append(
    userInfoTemplate(ZJRID_, getUserInfo(ZJRID_).UserName)
  );
  if (!rtc.isJoined_) {
    await rtc.join();
  } else {
    for (const user of display_layout.pageUserList) {
      if (ZJRID_ != user.ID) {
        var stream =
          user.ID == oneself_.CHID
            ? rtc.localStream_
            : rtc.members_.get(user.ID);
        stream?.stop();
        stream?.play("box_" + user.ID);
      }
    }
    setTimeout(() => {
      gengxinzhuangtai();
    }, 700);
  }
}

// 取消、修改主讲人的处理
async function change() {
  // 此处的ZJRID_代表上一个主讲人
  // 此处的newZJRID代表新的主讲人ID，没有的话设定主持人为主讲人视角
  var newZJRID = roomDetail_.SpeakerID || ZCRID_;
  if (newZJRID == ZJRID_) return;
  // 先停止上一个主持人的播放
  rePlay(rtc.members_.get(ZJRID_), ZJRID_);
  async function rePlay(stream, ID) {
    $("#img_" + ID).hide();
    stream?.stop();
    // 如果是主讲人模式，则取消订阅
    if (display_layout.mode == 1) {
      await rtc.client_.unsubscribe(stream);
      return;
    }
    if (hasMe(ID)) {
      stream?.play("box_" + ID, { objectFit: "cover" });
      // 如果远程流不存在，不在线，显示遮罩
      stream ? $("#mask_" + ID).hide() : $("#mask_" + ID).show();
    }
  }
  // 获取将要成为主讲人的那个远程流
  var zjr_streams = rtc.members_.get(newZJRID);
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
  var objectFit = objectFitHandle(newZJRID);

  // 如果是主讲人模式，订阅新的主讲人的流
  if (display_layout.mode == 1) {
    await rtc.client_.subscribe(zjr_streams);
  } else {
    zjr_streams?.play("zjr_video", { objectFit });
  }
  zjr_streams ? $("#zjr_mask").hide() : $("#zjr_mask").show();
  // 为新的主讲人取帧
  zjr_streams && videoHandle(true, newZJRID);
  $(`#zjr_mask img`).attr("src", `./img/camera-gray.png`);
  ZJRID_ = newZJRID;
  // 权限判断按钮显示或隐藏
  showOrHide();

  setTimeout(() => {
    gengxinzhuangtai();
  }, 1000);
}
