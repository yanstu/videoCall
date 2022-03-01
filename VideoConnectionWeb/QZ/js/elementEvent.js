(() => {
  window.addEventListener("online", function () {
    layer.msg("网络连接已恢复！", { icon: 6 });
    isDisconnect = false;
  });
  window.addEventListener("offline", function () {
    layer.msg("当前网络已断开", { icon: 5 });
    isDisconnect = true;
  });

  /*window.setInterval(() => {
    {
      menuHideTimer.count++;
      if (menuHideTimer.count == menuHideTimer.time) {
        $("#toolbar").hide();
        menuHideTimer.count = 0;
      }
    }
  }, 1000);

  //监听鼠标
  document.onmousemove = function (event) {
    var x1 = event.clientX;
    var y1 = event.clientY;
    if (menuHideTimer.x != x1 || menuHideTimer.y != y1) {
      $("#toolbar").show();
      menuHideTimer.count = 0;
    }
    menuHideTimer.x = x1;
    menuHideTimer.y = y1;
  };

  //监听键盘
  document.onkeydown = function () {
    menuHideTimer.count = 0;
    $("#toolbar").show();
  };*/

  $("#testing_btn").on("click", (e) => {
    startDeviceConnect();
  });

  //回车事件绑定
  $("#xiaoxineirong").bind("keyup", function (event) {
    if (event.keyCode == "13") {
      $("#fasongxiaoxi").click();
    }
  });

  // 用户列表点击事件
  $("#canyuzhe_btn").on("click", (event) => {
    $("#yonghuliebiao").fadeToggle();

    // 关闭其他窗口
    $("#shenqingfayanliebiao").hide();
    $("#xiaoxiliebiao").hide();
  });

  $("#fayanliebiao_btn").on("click", (e) => {
    $("#shenqingfayanliebiao").fadeToggle();
    $("#fayan_jiaobiao").hide();

    // 关闭其他窗口
    $("#yonghuliebiao").hide();
    $("#xiaoxiliebiao").hide();
  });

  $("#xiaoxi_btn").on("click", () => {
    $("#xiaoxiliebiao").toggle();
    $("#xiaoxi_jiaobiao").hide();
    if ($("#xiaoxiliebiao").css("display") == "none") {
      fasonggeishei = "";
      $("#xiaoxiliebiao").find(".modalbox-title").html("消息列表");
    } else {
      if (fasonggeishei) {
        /*for (let xiaoxi of $("#messageList").children()) {
          if ($(xiaoxi).attr("id") != "message_muban") $(xiaoxi).remove();
        }*/
        $("#xiaoxiliebiao")
          .find(".modalbox-title")
          .html(`消息列表 (${getUserInfo(fasonggeishei).UserName})`);
      }
    }

    // 关闭其他窗口
    $("#yonghuliebiao").hide();
    $("#shenqingfayanliebiao").hide();
  });

  // 发送消息
  $("#fasongxiaoxi").on(
    "click",
    clickProof(() => {
      if ($("#xiaoxineirong").val()) {
        fasongxiaoxi();
      }
    })
  );

  // 主持人关闭所有麦克风
  $("#guanbimaikefeng_btn").on(
    "click",
    clickProof(() => {
      if (oneself_.IsZCR) {
        guanbisuoyourenmaifekeng();
      } else {
        layer.msg("您不是主持人");
      }
    })
  );

  // 主持人取消当前主讲人
  $("#quxiaozhujiangren_btn").on(
    "click",
    clickProof(() => {
      if (oneself_.IsZCR) {
        quxiaozhujiangren();
      } else {
        layer.msg("您不是主持人");
      }
    })
  );

  // 退出按钮事件
  $("#exit-btn").on({
    click: function () {
      layer.confirm(
        "确定退出视频连线？",
        {
          btn: ["确定", "取消"],
        },
        () => {
          leave();
        }
      );
    },
  });

  // 工具栏显示隐藏
  $("#mean_btn").on({
    click: function () {
      $("#toolbar").fadeToggle();
    },
  });

  // 翻转相机点击事件
  $("#shenqingfayan_btn").on(
    "click",
    clickProof(() => {
      shenqingfayan();
    })
  );

  // 翻转相机点击事件
  $("#fanzhuan_btn").on(
    "click",
    clickProof(() => {
      if (!isCamOn) {
        layer.msg("请先打开摄像头再切换");
        return;
      }
      $("#fanzhuan_btn i").toggleClass("animate-[spin_1s_linear_1]");
      setTimeout(() => {
        $("#fanzhuan_btn i").toggleClass("animate-[spin_1s_linear_1]");
      }, 1000);
      for (let data of cameraData) {
        if (cameraId != data) {
          cameraId = data;
          rtc.changeCameraId();
          return;
        }
      }
      layer.msg("设备没有其他的摄像头");
    }, 1200)
  );

  //打开或关闭摄像机
  $("#video_btn").on(
    "click",
    clickProof(() => {
      videoHandle(!isCamOn, oneself_.CHID);
      if (isCamOn) {
        $("#video_btn svg").toggleClass("text-white");
        $("#video_btn,#video_btn svg").addClass("text-red");
        muteVideo();
      } else {
        $("#video_btn svg").toggleClass("text-white");
        $("#video_btn,#video_btn svg").removeClass("text-red");
        unmuteVideo();
      }
      if (oneself_.CHID == ZJRID_) {
        if (isCamOn) $(`#zjr_mask img`).attr("src", `./img/camera-green.png`);
        /*$("#zjr_video .nicknamespan").css(
          "color",
          `${isCamOn ? "#ffffff" : "#000000"}`
        );*/
        /*$(`#zjr_video img.member-audio-btn`).attr(
          "style",
          `filter:invert(${isCamOn ? "0" : "100"}%);`
        );*/
      }
      isCamOn = !isCamOn;
    })
  );

  //打开或关闭麦克风
  $("#mic_btn").click(
    "click",
    clickProof(() => {
      audioHandle(!isMicOn, oneself_.CHID);
      if (isMicOn) {
        $("#mic_btn svg").toggleClass("text-white");
        $("#mic_btn, #mic_btn svg").addClass("text-red");
        muteAudio();
      } else {
        $("#mic_btn svg").toggleClass("text-white");
        $("#mic_btn, #mic_btn svg").removeClass("text-red");
        unmuteAudio();
      }
      isMicOn = !isMicOn;
    })
  );
  //logout
  $("#logout-btn").on("click", () => {
    leave();
    $("#room-root").hide();
    $("#login-root").show();
  });
  //chrome60以下不支持popover，防止error
  if (getBrowser().browser == "Chrome" && getBrowser().version < "60") return;
  if (getBrowser().browser === "Firefox" && getBrowser().version < "56") return;
  if (getBrowser().browser === "Edge" && getBrowser().version < "80") return;
  //开启popover
  $(function () {
    $('[data-toggle="popover"]').popover();
  });
  $("#camera").popover({
    html: true,
    content: () => {
      return $("#camera-option").html();
    },
  });
  $("#microphone").popover({
    html: true,
    content: () => {
      return $("#mic-option").html();
    },
  });

  $("#camera").on("click", () => {
    $("#microphone").popover("hide");
    $(".popover-body").find("div").attr("onclick", "setCameraId(this)");
  });

  $("#microphone").on("click", () => {
    $("#camera").popover("hide");
    $(".popover-body").find("div").attr("onclick", "setMicId(this)");
  });

  //点击body关闭popover
  $("body").click(() => {
    $("#camera").popover("hide");
    $("#microphone").popover("hide");
  });

  //popover事件
  $("#camera").on("show.bs.popover", () => {
    $("#camera").attr("src", "./img/camera-popover.png");
  });

  $("#camera").on("hide.bs.popover", () => {
    $("#camera").attr("src", "./img/camera.png");
  });

  $("#microphone").on("show.bs.popover", () => {
    $("#microphone").attr("src", "./img/mic-popover.png");
  });

  $("#microphone").on("hide.bs.popover", () => {
    $("#microphone").attr("src", "./img/mic.png");
  });
})();
