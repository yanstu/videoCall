class RtcClient {
  constructor(options) {
    this.sdkAppId_ = options.sdkAppId;
    this.userId_ = options.userId;
    this.userSig_ = options.userSig;
    this.roomId_ = options.roomId;

    this.isJoined_ = false;
    this.remoteStreams_ = [];
    this.members_ = new Map();

    // 为RTC创建客户端
    this.client_ = TRTC.createClient({
      mode: "rtc",
      sdkAppId: this.sdkAppId_,
      userId: this.userId_,
      userSig: this.userSig_,
    });

    // 开始获取网络质量
    this.startGetNetworkevel();
    // 客户端监听服务
    this.handleEvents();
    // 开始获取音量
    this.startGetAudioLevel();
  }

  /**
   * 加入房间
   */
  async join() {
    await this.client_.join({
      roomId: parseInt(this.roomId_),
    });
    this.isJoined_ = true;
    // 关闭加载中
    
  }

  /**
   * 离开房间
   */
  async leave() {
    // 停止获取音量
    this.isJoined_ = false;
    await this.client_?.leave();
    this.client_?.enableAudioVolumeEvaluation(-1);
  }

  /**
   * 客户端监听服务
   */
  handleEvents() {
    this.client_.on("error", (err) => {
      location.reload();
    });

    this.client_.on("client-banned", () => {
      if (!isHidden()) {
        layer.msg("您已被挤下线", { icon: 2 });
        setTimeout(() => {
          leave();
        }, 1000);
      } else {
        document.addEventListener(
          "visibilitychange",
          () => {
            if (!isHidden()) {
              layer.msg("您已被挤下线", { icon: 2 });
              setTimeout(() => {
                leave();
              }, 1000);
            }
          },
          false
        );
      }
    });

    // 当用户加入房间时触发
    this.client_.on("peer-join", (evt) => {
      const { userId } = evt;
      this.members_.set(userId, null);
      onlineOrOfline(true, userId);
      console.log(getUserInfo(userId)?.UserName + " 加入了房间");
    });

    // 当远程连接端离开房间时触发
    this.client_.on("peer-leave", (evt) => {
      const { userId } = evt;
      this.members_.delete(userId);
      onlineOrOfline(false, userId);
      console.log(getUserInfo(userId)?.UserName + " 离开了房间，或者掉线");
    });

    // 推送远程流时触发
    this.client_.on("stream-added", (evt) => {
      const remoteStream = evt.stream;
      const userId = remoteStream.getUserId();
      this.members_.set(userId, remoteStream);
      console.log(`${getUserInfo(userId)?.UserName} 推送远程流`);

      if (display_layout.mode == 1 && userId != roomDetail_.SpeakerID) {
        if (userId == ZCRID_ && !roomDetail_.SpeakerID) {
          this.client_.subscribe(remoteStream);
        }
        return;
      }
      this.client_.subscribe(remoteStream);
    });

    // 在订阅远程流时触发
    this.client_.on("stream-subscribed", (evt) => {
      const remoteStream = evt.stream;
      const userId = remoteStream.getUserId();
      this.remoteStreams_.push(remoteStream);

      this.playVideo(remoteStream, userId);

      if (!remoteStream) {
        $("#mask_" + userId).show();
        userId == ZJRID_ && $("#zjr_mask").show();
      }

      remoteStream.on("player-state-changed", (event) => {
        console.log(
          `${getUserInfo(userId).UserName} 的 ${
            event.type == "audio" ? "麦克风" : "摄像头"
          } 状态改变为 ${event.state == "PAUSED" ? "停止" : "播放"}`
        );
        // 如果能监听到有人恢复播放的通知，说明网络连接已恢复
        if (event.state == "PLAYING") {
          isDisconnect = false;
        }
        videoHandle(event.state == "PLAYING", userId);
        try {
          event.state === "PAUSED" && this.resumeStreams();
        } catch (error) {}
      });
    });

    // 当远程流被删除时触发，例如：远程用户调用 Client.unpublish()
    /* This code is listening for a stream-removed event. When a stream is removed, it stops the stream
    and removes the stream from the list of remote streams. */
    this.client_.on("stream-removed", (evt) => {
      const remoteStream = evt.stream;
      const userId = remoteStream?.getUserId();
      const id = remoteStream?.getId();
      remoteStream?.stop();
      this.members_.set(userId, null);
      console.log(`${getUserInfo(userId)?.UserName} 取消推送远程流`);
      this.remoteStreams_ = this.remoteStreams_.filter((stream) => {
        return stream.getId() !== id;
      });
    });

    /* This code is listening for a mute-audio event from the client. When it receives the event, it
    calls the audioHandle function with the parameters false and the userId. */
    this.client_.on("mute-audio", ({ userId }) => {
      audioHandle(false, userId);
    });

    /* This code is listening for the "unmute-audio" event and then calling the audioHandle function. */
    this.client_.on("unmute-audio", ({ userId }) => {
      audioHandle(true, userId);
    });

    /* The above code is listening for a mute-video event from the client. When the event is received,
    it calls the videoHandle function with the userId of the user who sent the event. */
    this.client_.on("mute-video", ({ userId }) => {
      videoHandle(false, userId);
    });

    /* Adding an event listener to the client that listens for the "unmute-video" event. When the event
    is triggered, it calls the function videoHandle with the arguments true and userId. */
    this.client_.on("unmute-video", ({ userId }) => {
      videoHandle(true, userId);
    });
  }

  playVideo(stream, userId) {
    if (
      (!roomDetail_.SpeakerID && userId == ZCRID_) ||
      userId == roomDetail_.SpeakerID
    ) {
      var objectFit =
        getUserInfo(userId).AspectRatio > 1 && userId == ZJRID_
          ? "contain"
          : "cover";
      stream?.play("zjr_video", { objectFit });
      videoHandle(true, userId);
    } else if (hasMe(userId)) {
      stream?.play("box_" + userId);
    }
  }

  /**
   * 监听音量回调事件，更新每个用户的音量图标
   */
  startGetAudioLevel() {
    this.client_.on("audio-volume", ({ result }) => {
      result.forEach(({ userId, audioVolume, stream }) => {
        if (audioVolume >= 10) {
          $(`#mic_main_${userId}`)
            .find(".volume-level")
            .css("height", `${audioVolume * 4}%`);
        } else {
          $(`#mic_main_${userId}`).find(".volume-level").css("height", `0%`);
        }
      });
    });
    this.client_.enableAudioVolumeEvaluation(100);
  }

  /**
   * 监听自己的网络质量级别，并改变视频画质
   */
  startGetNetworkevel() {
    this.client_.on("network-quality", (event) => {
      // console.log(`network-quality, uplinkNetworkQuality:${event.uplinkNetworkQuality}, downlinkNetworkQuality: ${event.downlinkNetworkQuality}`);
      //'0': '未知', '1': '极佳', '2': '较好', '3': '一般', '4': '差', '5': '极差', '6': '断开'

      var title = {
        0: "未知",
        1: "极佳",
        2: "较好",
        3: "一般",
        4: "差",
        5: "极差",
        6: "断开",
      };

      $(`#network-down`)
        .attr(
          "src",
          `./img/network/down/network_${
            event.downlinkNetworkQuality == 6 || isDisconnect
              ? 6
              : event.downlinkNetworkQuality
          }.png`
        )
        .attr("title", "下行速度：" + title[event.downlinkNetworkQuality]);
      $(`#network-up`)
        .attr(
          "src",
          `./img/network/up/network_${
            event.uplinkNetworkQuality == 6 || isDisconnect
              ? 6
              : event.uplinkNetworkQuality
          }.png`
        )
        .attr("title", "上行速度：" + title[event.uplinkNetworkQuality]);

      isDisconnect = event.downlinkNetworkQuality == 6;
      if (
        event.downlinkNetworkQuality == 4 ||
        event.downlinkNetworkQuality == 5
      ) {
        layer.msg("当前网络极差，请注意保持良好的网络连接", { icon: 5 });
      }
    });
  }
}
