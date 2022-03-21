/**
 * 对视图进行处理
 */
async function viewsHandle() {
  meetLayoutCompute();
  // 清空所有盒子
  resetViews();
  // 为当前页用户循环添加至网页上
  addView();
  if (rtc?.isJoined_) {
    fanye();
  } else {
    await rtc.join();
    videoHandle(isCamOn, oneself_.CHID);
  }

  if (deviceType == DEVICE_TYPE_ENUM.MOBILE_IOS) {
    beiyongfangan();
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
          await stream?.stop();
          await rtc.client_.unsubscribe(stream);
          await rtc.client_
            .subscribe(stream, {
              audio: true,
              video: isbofang,
            })
            .then(() => {
              gengxinzhuangtai();
            });
          setTimeout(() => {
            videoHandle(isbofang, ID);
          }, 100);
        } else {
          layer.msg("用户不在线，无法控制");
        }
      }, 2000)
    );

    if (!getUserInfoByMeet(ID)) {
      $("#box_" + ID).hide();
    }
  }
}

// 针对手机端的备用方案
function beiyongfangan() {
  setTimeout(() => {
    for (const user of meet_layout.pageUserList) {
      if (user.ID != oneself_.CHID) {
        var stream = rtc.members_.get(roomDetail_.SpeakerID);
        if (stream) {
          stream?.stop();
          stream?.play("box_" + user.ID);
        }
      }
    }
  }, 1000);
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
