/**
 * 对视图进行处理
 */
async function viewsHandle() {
  // 处理布局相关
  meetLayoutCompute();
  displayLayoutCompute();
  // 用于翻页、取消主讲人、更改主讲人的处理，清空用户下面再添加进去
  resetViews();
  // 为当前页用户循环添加至网页上
  addViews();
  // 如果没有设置主讲人，将自己设置为假的主讲人
  ZJRID_ = roomDetail_.SpeakerID || oneself_.CHID;

  if (!rtc.isJoined_) {
    await rtc.join();
  } else {
    tuisong();
    for (const user of meet_layout.pageUserList) {
      if (ZJRID_ != user.ID) {
        var stream =
          user.ID == oneself_.CHID
            ? rtc.localStream_
            : rtc.members_.get(user.ID);
        await stream?.stop();
        await stream?.play("box_" + user.ID);
        $("#img_" + user.ID).hide();
      }
    }
    setTimeout(() => {
      gengxinzhuangtai();
    }, 700);
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
  var objectFit = objectFitHandle(newZJRID);

  zjr_streams?.play("zjr_video", { objectFit });

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

  ZJRID_ = newZJRID;
  
  // 权限判断按钮显示或隐藏
  showOrHide();

  setTimeout(() => {
    gengxinzhuangtai();
  }, 1000);
}
