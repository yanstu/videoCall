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
  rtc.isJoined_ && change();
  ZJRID_ = roomDetail_.SpeakerID || ZCRID_;
  // 初始化
  !rtc.isJoined_ && init();
}

async function change() {
  // 如果当前没有主讲人，将主持人作为主讲人视角，如果主持人没有在线，将自己设为主讲人视角
  var newZJRID = roomDetail_.SpeakerID || ZCRID_;
  // 先停止上一个主讲人的远程流
  var old_streams = rtc.members_.get(ZJRID_);
  old_streams?.stop();
  // 再停止新的主讲人的远程流
  var new_streams = rtc.members_.get(newZJRID);
  new_streams?.stop();
  $("#zjr_video [id^='profile_']").remove();
  $("#zjr_video [id^='player_']").remove();
  $("#zjr_video").append(
    userInfoTemplate(newZJRID, getUserInfo(newZJRID).UserName)
  );
  var objectFit = getUserInfo(newZJRID).AspectRatio > 1 ? "contain" : "cover";
  new_streams?.play("zjr_video", { objectFit });
  new_streams ? $("#zjr_mask").hide() : $("#zjr_mask").show();
}

function init() {
  $("#zjr_video").append(
    userInfoTemplate(ZJRID_, getUserInfo(ZJRID_).UserName)
  );
  rtc.join();
}
