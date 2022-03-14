(() => {
  window.addEventListener("online", function () {
    layer.msg("网络连接已恢复！", { icon: 6 });
    isDisconnect = false;
  });
  window.addEventListener("offline", function () {
    layer.msg("当前网络已断开", { icon: 5 });
    isDisconnect = true;
  });

  window.setInterval(() => {
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
  };

  $("#testing_btn").on("click", (e) => {
    startDeviceConnect();
  });

  //回车事件绑定
  $("#xiaoxineirong").bind("keyup", function (event) {
    if (event.keyCode == "13") {
      $("#fasongxiaoxi").click();
    }
  });

  // 切换视图按钮点击事件
  $("#qiehuanshitu_btn").on("click", () => {
    $("#qiehuanshitu_mianban").fadeToggle();
  });

  // 点击事件
  $("#qiehuanchangguishipin_btn").on("click", () => {
    if (location.href.toLowerCase().includes("index")) {
      $("#video-grid").fadeIn();
    } else {
      location.replace(
        location.origin +
          location.pathname.substring(
            0,
            location.pathname.lastIndexOf("/") + 1
          ) +
          "index.html" +
          location.href.substring(location.href.indexOf("?"))
      );
    }
  });

  $("#qiehuanchangguishipin2_btn").on("click", () => {
    $("#video-grid").fadeIn();
  });

  $("#qiehuandashipin2_btn").on("click", () => {
    $("#video-grid").fadeOut();
  });

  // 点击事件
  $("#qiehuandashipin_btn").on("click", () => {
    if (location.href.toLowerCase().includes("index")) {
      $("#video-grid").fadeOut();
    } else {
      location.replace(
        location.origin +
          location.pathname.substring(
            0,
            location.pathname.lastIndexOf("/") + 1
          ) +
          "index.html" +
          location.href.substring(location.href.indexOf("?")) +
          "&h=1"
      );
    }
  });

  // 点击事件
  $("#qiehuanbigshipin_btn").on("click", () => {
    if (roomDetail_.UserList > 25) {
      layer.msg("当前房间用户超过25人，不能使用此模式");
    } else {
      location.replace(
        location.origin +
          location.pathname.substring(
            0,
            location.pathname.lastIndexOf("/") + 1
          ) +
          "big.html" +
          location.href.substring(location.href.indexOf("?"))
      );
    }
  });

  // 切换小视频点击事件
  $("#qiehuanxiaoshipin_btn").on("click", () => {
    if (roomDetail_.UserList.length > 25) {
      layer.msg("当前房间用户超过25人，不能使用此模式");
    } else {
      location.replace(
        location.origin +
          location.pathname.substring(
            0,
            location.pathname.lastIndexOf("/") + 1
          ) +
          "small.html" +
          location.href.substring(location.href.indexOf("?"))
      );
    }
  });

  // 切换视图关闭按钮点击事件
  $("#qiehuanshitu_close_btn").on("click", () => {
    $("#qiehuanshitu_btn").click();
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
        // 清空消息列表
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

  // 点击上一页
  $("#shangyiye_btn").on(
    "click",
    clickProof(() => {
      if (oneself_.IsZCR || location.href.toLowerCase().includes("small2")) {
        var layout = location.href.toLowerCase().includes("small2")
          ? display_layout
          : meet_layout;
        if (layout.pageNo == 0) {
          layer.msg("不能再向上翻了");
        } else {
          fanye(layout.pageNo - 1);
        }
      } else {
        layer.msg("无权限");
      }
    })
  );

  // 点击上一页
  $("#xiayiye_btn").on(
    "click",
    clickProof(() => {
      if (oneself_.IsZCR || location.href.toLowerCase().includes("small2")) {
        var layout = location.href.toLowerCase().includes("small2")
          ? display_layout
          : meet_layout;
        if (layout.pageNo + 1 == layout.pageCount) {
          layer.msg("不能再向下翻了");
        } else {
          fanye(layout.pageNo + 1);
        }
      } else {
        layer.msg("无权限");
      }
    })
  );

  // 退出按钮事件
  $("#exit-btn").on({
    click: function () {
      leave();
    },
  });

  // 工具栏显示隐藏
  $("#mean_btn").on({
    click: function () {
      $("#toolbar").fadeToggle();
    },
  });

  // 申请发言按钮点击事件
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
        // 切换到关闭摄像头状态
        $("#video_btn svg").html(
          `<use xlink:href="#icon-guanbixiangji"></use>`
        );
        muteVideo();
      } else {
        // 切换到打开摄像头状态
        $("#video_btn svg").html(`<use xlink:href="#icon-xiangji"></use>`);
        unmuteVideo();
      }
      if (oneself_.CHID == ZJRID_) {
        if (isCamOn) $(`#zjr_mask img`).attr("src", `./img/camera-green.png`);
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
        $("#mic_btn svg").html(`<use xlink:href="#icon-jingyin"></use>`);
        muteAudio();
      } else {
        $("#mic_btn svg").html(`<use xlink:href="#icon-maikefeng"></use>`);
        unmuteAudio();
      }
      isMicOn = !isMicOn;
    })
  );
})();
