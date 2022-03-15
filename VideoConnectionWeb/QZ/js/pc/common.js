/**
 * 对视图进行处理
 */
async function viewsHandle() {
  // 处理布局相关
  layoutCompute();
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
        stream?.stop();
        stream?.play("box_" + user.ID);
        stream && videoHandle(true, user.ID);
      } else {
        videoHandle(true, ZJRID_);
      }
    }
  }
}
