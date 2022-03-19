/**
 * 对视图进行处理
 */
async function viewsHandle() {
  meetLayoutCompute();
  // 清空所有盒子
  resetViews();
  // 为当前页用户循环添加至网页上
  addView();
  showOrHide();
  if (rtc?.isJoined_) {
    fanye();
  } else {
    await rtc.join();
  }
}

async function fanye() {
  if (!getUserInfoByMeet(oneself_.CHID)) {
    await rtc.localStream_.stop();
  } else {
    await rtc.localStream_.stop();
    await rtc.localStream_.play("box_" + oneself_.CHID);
    $("#mask_" + oneself_.CHID).hide();
  }

  for (const user of roomDetail_.UserList) {
    var stream = rtc.members_.get(user.ID);
    if (stream) {
      await stream?.stop();
      await rtc.client_.unsubscribe(stream);
      await rtc.client_.subscribe(stream, {
        audio: true,
        video: !!getUserInfoByMeet(user.ID), // 在当前页的才订阅视频
      });
    }
  }
}

async function addView() {
  for (let user_ of roomDetail_.UserList) {
    const { ID, UserName } = user_;
    $("#video-grid").append(videoBoxTemplate(ID, UserName));
    $("#box_" + ID).attr(
      "class",
      "w-full h-full video-box relative box-border border-[2px] border-[#5451]"
    );
    $("#video_" + ID).on("click", async () => {
      var stream = rtc.members_.get(ID);
      if (stream) {
        var isbofang = $(`#box_${ID} video`).length == 0;
        await stream?.stop();
        await rtc.client_.unsubscribe(stream);
        await rtc.client_.subscribe(stream, {
          audio: true,
          video: isbofang,
        });
        setTimeout(() => {
          // isbofang ? $(`#mask_${ID}`).hide() : $(`#mask_${ID}`).show();
          videoHandle(isbofang, ID);
        }, 700);
      } else {
        layer.msg("用户不在线，无法控制");
      }
    });
    if (!getUserInfoByMeet(ID)) {
      $("#box_" + ID).hide();
    }
  }
}

// 查询房间是否包含该用户
function hasMe(userId) {
  var exits = roomDetail_.UserList.find((user) => user.ID == userId);
  return !!exits;
}
