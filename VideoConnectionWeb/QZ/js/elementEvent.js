(() => {
  $(window).resize(() => {
    changeTitleFontSize();
  });

  window.addEventListener("online", function () {
    layer.msg("网络连接已恢复，正在恢复房间状态", { icon: 6 });
    setTimeout(() => {
      this.location.reload();
    }, 1000);
  });
  window.addEventListener("offline", function () {
    layer.msg("当前网络已断开", { icon: 5 });
    isDisconnect = true;
  });

  window.setInterval(() => {
    {
      menuHideTimer.count++;
      if (menuHideTimer.count == menuHideTimer.time) {
        !location.href.toLowerCase().includes("ms") &&
          !location.href.toLowerCase().includes("mobile") &&
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
    deviceTestingInit();
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

  // 手机端切换到主讲人模式
  $("#qiehuanzhujiangrenshipin_btn").on("click", () => {
    if (
      meet_layout.mode == 1 ||
      meet_layout.mode == 2 ||
      meet_layout.mode == 4
    ) {
      if (!location.href.toLowerCase().includes("mobile")) {
        tiaozhuandao("mobile");
      }
    } else {
      layer.msg("非自由模式，不能随意切换");
    }
    $("#qiehuanshitu_mianban").fadeOut();
  });

  // 手机端切换到小视频模式
  $("#qiehuanxiaoshipin_sm_btn").on("click", () => {
    if (meet_layout.mode == 3 || meet_layout.mode == 4) {
      if (!location.href.toLowerCase().includes("ms")) {
        if (roomDetail_.UserList.length > 25) {
          layer.msg("当前房间用户超过25人，不能使用此模式");
        } else {
          tiaozhuandao("ms");
        }
      }
    } else {
      layer.msg("非自由模式，不能随意切换");
    }
    $("#qiehuanshitu_mianban").fadeOut();
  });

  // 参会端切换到主讲人+小视频模式
  $("#qiehuanchangguishipin_btn").on("click", () => {
    if (meet_layout.mode == 2 || meet_layout.mode == 4) {
      if (location.href.toLowerCase().includes("index")) {
        $("#video-grid").fadeIn();
      } else {
        tiaozhuandao("index");
      }
    } else {
      layer.msg("非自由模式，不能随意切换");
    }
    $("#qiehuanshitu_mianban").fadeOut();
  });

  // 参会端切换到主讲人模式
  $("#qiehuandashipin_btn").on("click", () => {
    if (meet_layout.mode == 1 || meet_layout.mode == 4) {
      if (location.href.toLowerCase().includes("index")) {
        $("#video-grid").fadeOut();
      } else {
        tiaozhuandao("index", true);
      }
    } else {
      layer.msg("非自由模式，不能随意切换");
    }
    $("#qiehuanshitu_mianban").fadeOut();
  });

  // 参会端切换到小视频模式
  $("#qiehuanxiaoshipin_btn").on("click", () => {
    if (meet_layout.mode == 3 || meet_layout.mode == 4) {
      if (!location.href.toLowerCase().includes("small")) {
        if (roomDetail_.UserList.length > 25) {
          layer.msg("当前房间用户超过25人，不能使用此模式");
        } else {
          tiaozhuandao("small");
        }
      }
    } else {
      layer.msg("非自由模式，不能随意切换");
    }
    $("#qiehuanshitu_mianban").fadeOut();
  });

  // 切换视图关闭按钮点击事件
  $("#qiehuanshitu_close_btn").on("click", () => {
    $("#qiehuanshitu_btn").click();
  });

  // 用户列表点击事件
  $("#canyuzhe_btn").on("click", () => {
    $("#yonghuliebiao").fadeToggle();

    // 关闭其他窗口
    $("#shenqingfayanliebiao").hide();
    $("#xiaoxiliebiao").hide();
  });

  $("#fayanliebiao_btn").on("click", () => {
    $("#shenqingfayanliebiao").fadeToggle();
    $("#fayan_jiaobiao").hide();

    // 关闭其他窗口
    $("#yonghuliebiao").hide();
    $("#xiaoxiliebiao").hide();
  });

  $("#xiaoxi_btn").on("click", () => {
    oneself_.IsZCR
      ? $("#fasong_tip").html("发向所有人")
      : $("#fasong_tip").html("发向管理员");
    $("#xiaoxiliebiao").toggle();
    $("#xiaoxi_jiaobiao").fadeOut();
    $(".gundongxiaoxi").fadeOut();
    if ($("#xiaoxiliebiao").css("display") == "none") {
      fasonggeishei = "";
      $("#xiaoxiliebiao").find(".modalbox-title").html("消息列表");
      oneself_.IsZCR
        ? $("#fasong_tip").html("发向所有人")
        : $("#fasong_tip").html("发向管理员");
    } else {
      if (fasonggeishei) {
        // 清空消息列表
        /*for (let xiaoxi of $("#messageList").children()) {
          if ($(xiaoxi).attr("id") != "message_muban") $(xiaoxi).remove();
        }*/
        $("#xiaoxiliebiao")
          .find(".modalbox-title")
          .html(`消息列表 (${getUserInfo(fasonggeishei).UserName})`);
        $("#fasong_tip").hide();
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
  $("#shangyiye_btn").on("click", () => {
    if (!fanyeHandler.disabled) {
      fanyeHandler.disabled = true;
      var layout =
        location.href.toLowerCase().includes("small2") ||
        location.href.toLowerCase().includes("big")
          ? display_layout
          : meet_layout;
      if (layout.pageNo == 0) {
        layer.msg("不能再向上翻了");
      } else {
        fanye(layout.pageNo - 1);
      }
      fanyeHandler.timer = setInterval(doLoop, 1000);
    }
  });

  // 点击上一页
  $("#xiayiye_btn").on("click", () => {
    if (!fanyeHandler.disabled) {
      fanyeHandler.disabled = true;
      var layout =
        location.href.toLowerCase().includes("small2") ||
        location.href.toLowerCase().includes("big")
          ? display_layout
          : meet_layout;
      if (layout.pageNo + 1 == layout.pageCount) {
        layer.msg("不能再向下翻了");
      } else {
        fanye(layout.pageNo + 1);
      }
      fanyeHandler.timer = setInterval(doLoop, 1000);
    }
  });

  // 手机端小视频点击上一页
  $("#shangyiye_ms_btn").on("click", () => {
    if (meet_layout.pageNo == 0) {
      layer.msg("不能再向上翻了");
    } else {
      meet_layout.pageNo--;
      viewsHandle();
    }

    /*if (!fanyeHandler.disabled) {
      fanyeHandler.disabled = true;
      if (meet_layout.pageNo == 0) {
        layer.msg("不能再向上翻了");
      } else {
        meet_layout.pageNo--;
        viewsHandle();
      }
      fanyeHandler.timer = setInterval(doLoop, 1000);
    }*/
  });

  // 手机端小视频点击上一页
  $("#xiayiye_ms_btn").on("click", () => {
    if (meet_layout.pageNo + 1 == meet_layout.pageCount) {
      layer.msg("不能再向下翻了");
    } else {
      meet_layout.pageNo++;
      viewsHandle();
    }

    /*if (!fanyeHandler.disabled) {
      fanyeHandler.disabled = true;
      if (meet_layout.pageNo + 1 == meet_layout.pageCount) {
        layer.msg("不能再向下翻了");
      } else {
        meet_layout.pageNo++;
        viewsHandle();
      }
      fanyeHandler.timer = setInterval(doLoop, 1000);
    }*/
  });

  function doLoop() {
    fanyeHandler.num--;
    if (fanyeHandler.num > 0) {
      $("#shangyiye_btn span").html(`上一页(${fanyeHandler.num})`);
      $("#xiayiye_btn span").html(`下一页(${fanyeHandler.num})`);
      $("#shangyiye_ms_btn span").html(`上页(${fanyeHandler.num})`);
      $("#xiayiye_ms_btn span").html(`下页(${fanyeHandler.num})`);
    } else {
      clearInterval(fanyeHandler.timer); //清除js定时器
      fanyeHandler.disabled = false;
      $("#shangyiye_btn span").html(`上一页`);
      $("#xiayiye_btn span").html(`下一页`);
      $("#shangyiye_ms_btn span").html(`上页`);
      $("#xiayiye_ms_btn span").html(`下页`);
      fanyeHandler.num = fanyeHandler.shichang;
    }
  }

  // 退出按钮事件
  $("#roomTitle").on({
    click: function () {
      var currentTime = new Date().getTime();
      // 计算两次相连的点击时间间隔
      enableVconsole.count =
        currentTime - enableVconsole.lastTime < enableVconsole.waitTime
          ? enableVconsole.count + 1
          : 1;
      enableVconsole.lastTime = new Date().getTime();
      clearTimeout(enableVconsole.timer);
      enableVconsole.timer = setTimeout(function () {
        clearTimeout(enableVconsole.timer);
        if (enableVconsole.count > 4) {
          enableVconsole.vconsole = new window.VConsole();
        }
      }, enableVconsole.waitTime + 10);
    },
  });
  // 退出按钮事件
  $("#exit-btn").on({
    click: function () {
      leave();
    },
  });

  // 工具栏显示隐藏
  $("#mean_btn").on({
    click: function () {
      $("#toolbar").toggle();
    },
  });

  // 申请发言按钮点击事件
  $("#shenqingfayan_btn").on(
    "click",
    clickProof(() => {
      layer.msg("已提交申请发言");
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
      if (
        roomDetail_.AllowOpenMic == 1 ||
        oneself_.IsZCR ||
        roomDetail_.SpeakerID == oneself_.CHID
      ) {
        micClick();
      } else {
        layer.msg("会场临时关闭麦克风");
      }
    })
  );
})();
