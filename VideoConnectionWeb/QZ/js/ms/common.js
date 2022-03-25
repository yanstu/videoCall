/**
 * 对视图进行处理
 */
async function viewsHandle() {
  meetLayoutCompute();
  // 清空所有盒子
  resetViews();
  // 为当前页用户循环添加至网页上
  addView();
  if (rtc.isJoined_) {
    fanye();
  } else {
    await rtc.join();
    videoHandle(isCamOn, oneself_.CHID);
    // beiyongfangan();
  }
}

async function fanye() {
  if (!getUserInfoByMeet(oneself_.CHID)) {
    await rtc.localStream_.stop();
  } else {
    await rtc.localStream_.stop();
    await rtc.localStream_.play("box_" + oneself_.CHID, { mirror: false });
    // $("#mask_" + oneself_.CHID).hide();
    videoHandle(isCamOn, oneself_.CHID);
  }

  for (const user of roomDetail_.UserList) {
    const { ID } = user;
    if (ID == oneself_.CHID) {
      continue;
    }
    var stream = rtc.members_.get(ID);
    if (stream) {
      await stream.stop();
      await rtc.client_.unsubscribe(stream);
      await rtc.client_.subscribe(stream, {
        audio: true,
        video: !!getUserInfoByMeet(ID), // 在当前页的才订阅视频
      });
    }
  }

  setTimeout(() => {
    gengxinzhuangtai();
  }, 100);
}

async function addView() {
  for (let user_ of roomDetail_.UserList) {
    const { ID, UserName } = user_;
    $("#video-grid").append(videoBoxTemplate(ID, UserName));
    $("#box_" + ID).attr(
      "class",
      "w-full h-full video-box relative box-border border-[1px] border-[#393e4b]"
    );

    $("#video_" + ID).on(
      "click",
      clickProof(async () => {
        var stream = rtc.members_.get(ID);
        if (stream) {
          var isbofang = $(`#box_${ID} video`).length == 0;
          await stream.stop();
          await rtc.client_.unsubscribe(stream);
          await rtc.client_
            .subscribe(stream, {
              audio: true,
              video: isbofang,
            })
            .then(() => {
              $(`#video_${ID} > img`).attr(
                "src",
                `./img/video-${isbofang ? "on" : "off"}.png`
              );
            });
          setTimeout(async () => {
            let video = await rtc.client_.getRemoteVideoStats("main");
            Object.getOwnPropertyNames(video).forEach(function (key) {
              if (key == ID) {
                videoHandle(isbofang && video[key].bytesReceived != 0, ID);
              }
            });
          }, 100);
        } else {
          layer.msg("用户不在线，无法控制");
        }
      }, 2000)
    );

    !getUserInfoByMeet(ID) && $("#box_" + ID).hide();
  }
}

// 针对苹果端的备用方案
function beiyongfangan() {
  if (deviceType == DEVICE_TYPE_ENUM.MOBILE_IOS) {
    setTimeout(() => {
      if (rtc.localStream_) {
        rtc.localStream_.stop();
        rtc.localStream_.play("box_" + oneself_.CHID, { mirror: false });
      }
      for (const user of meet_layout.pageUserList) {
        if (user.ID != oneself_.CHID) {
          var stream = rtc.members_.get(roomDetail_.SpeakerID);
          if (stream) {
            stream.stop();
            stream.play("box_" + user.ID, { mirror: false });
          }
        }
      }
    }, 1000);
  }
}

// 查询房间是否包含该用户
function hasMe(userId) {
  var exits = roomDetail_.UserList.find((user) => user.ID == userId);
  return !!exits;
}

var startX = 0;
var startY = 0;

$("#mic_drag").on("touchstart", function (event) {
  var element = event.targetTouches[0];
  // 初始化位置
  startX = element.pageX - this.offsetLeft;
  startY = element.pageY - this.offsetTop;
  return false;
});

function touchMove(event) {
  var element = event.targetTouches[0];
  var x = element.clientX - startX;
  var y = element.clientY - startY;
  var dragWidth = $("#mic_drag").width();
  var dragHeight = $("#mic_drag").height();
  parentWidth = $("section").innerWidth();
  parentHeight = $("section").innerHeight();
  if (y <= 0) {
    y = 1;
  }
  if (y >= parentHeight - dragHeight) {
    y = parentHeight - dragHeight;
  }
  if (x <= 0) {
    x = 1;
  }
  if (x >= parentWidth - dragWidth) {
    x = parentWidth - dragWidth - 1;
  }
  $("#mic_drag").css({
    left: x + "px",
    top: y + "px",
  });
  return false;
}

function touchEnd(event) {
  $("section").unbind("mousemove");
  $("section").unbind("mouseup");
}
