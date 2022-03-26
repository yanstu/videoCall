class RtcClient {
  constructor(options) {
    this.sdkAppId_ = options.sdkAppId;
    this.userId_ = options.userId;
    this.userSig_ = options.userSig;
    this.roomId_ = options.roomId;

    this.isJoined_ = false;
    this.isPublished_ = false;
    this.localStream_ = null;
    this.remoteStreams_ = [];
    this.members_ = new Map();

    // 为RTC创建客户端
    this.client_ = TRTC.createClient({
      mode: "rtc",
      sdkAppId: this.sdkAppId_,
      userId: this.userId_,
      userSig: this.userSig_,
      // enableAutoPlayDialog: false,
    });

    this.startGetNetworkevel();

    // 客户端监听服务
    this.handleEvents();
  }

  /**
   * 加入房间
   */
  async join() {
    await this.client_.join({
      roomId: parseInt(this.roomId_),
    });

    this.isJoined_ = true;

    if (getCameraId() && getMicrophoneId()) {
      this.localStream_ = TRTC.createStream({
        audio: true,
        video: true,
        userId: this.userId_,
        cameraId: getCameraId(),
        microphoneId: getMicrophoneId(),
        mirror: false, // 是否开启镜像
      });
    } else {
      // 不指定 麦克风Id/摄像头Id，以避免过限制错误
      this.localStream_ = TRTC.createStream({
        audio: true,
        video: true,
        userId: this.userId_,
        mirror: false, // 是否开启镜像
      });
    }

    try {
      this.shezhifenbianlv();
      // 初始化本地流
      await this.localStream_.initialize();
    } catch (error) {
      console.error("无法初始化本地流initialize() ", error);
      videoHandle(false, oneself_.CHID);
    }

    // 推送本地流
    await this.publish();

    this.playVideo(this.localStream_, oneself_.CHID);

    // 权限判断按钮显示或隐藏
    showOrHide();
    // 关闭加载中

    // 开始获取音量
    this.startGetAudioLevel();
  }

  /**
   * 离开房间
   */
  async leave() {
    // 确保本地流在离开之前取消发布
    await this.unpublish();
    // 离开房间
    await this.client_.leave();
    this.isJoined_ = false;
    this.localStream_.stop();
    this.localStream_.close();
    this.localStream_ = null;
    // 停止获取音量
    this.stopGetAudioLevel();
  }

  /**
   * 推送
   */
  async publish() {
    if (this.isPublished_) return;
    try {
      await this.client_.publish(this.localStream_);
    } catch (error) {
      console.error("推送本地流失败publish()" + error);
      this.isPublished_ = false;
      if (
        JSON.stringify(error).includes("is not initialized or is") ||
        JSON.stringify(error).includes("publish() is ongoing") ||
        JSON.stringify(error).includes("timeout")
      ) {
        location.reload();
      }
    }
    this.isPublished_ = true;
  }

  /**
   * 取消推送
   */
  async unpublish() {
    if (!this.isPublished_) {
      console.warn("RtcClient.unpublish() 已经调用但未推送");
      return;
    }
    await this.client_.unpublish(this.localStream_);
    this.isPublished_ = false;
  }

  /**
   * Mute the local audio
   */
  muteLocalAudio() {
    this.localStream_.muteAudio();
  }

  /**
   * Unmute the local audio
   */
  unmuteLocalAudio() {
    this.localStream_.unmuteAudio();
  }

  /**
   * Mute the local video
   */
  muteLocalVideo() {
    this.localStream_.muteVideo();
  }

  /**
   * *Unmutes the local video.*
   */
  unmuteLocalVideo() {
    this.localStream_.unmuteVideo();
  }

  /**
   * Resumes the local and remote streams
   */
  resumeStreams() {
    this.localStream_.resume();
    for (let stream of this.remoteStreams_) {
      stream && stream.resume();
    }
  }

  /**
   * 切换摄像头
   */
  changeCameraId() {
    try {
      this.localStream_.switchDevice("video", cameraId).then(() => {
        console.log("切换摄像头成功");
      });
    } catch (error) {
      if (JSON.stringify(error).includes("Cannot read properties of null"))
        layer.msg(
          "暂时无法访问摄像头/麦克风，请确保系统授予当前浏览器摄像头/麦克风权限，并且没有其他应用占用摄像头/麦克风。"
        );
    }
  }

  /**
   * 切换麦克风
   */
  changeMicId() {
    this.localStream_.switchDevice("audio", micId).then(() => {
      console.log("切换麦克风成功");
    });
  }

  playVideo(stream, userId) {
    onlineOrOfline(true, oneself_.CHID);
    stream.stop();
    stream.play("box_" + userId, { mirror: false });
    /*stream.on("error", (error) => {
      if (error.getCode() === 0x4043) {
        deviceTestingInit();
        startDeviceConnect();
      }
    });*/
  }

  /**
   * 客户端监听服务
   */
  handleEvents() {
    /*this.client_.on("error", (err) => {
      location.reload();
    });*/

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
      console.log(
        getUserInfo(userId)
          ? getUserInfo(userId).UserName
          : "null" + " 加入了房间"
      );
    });

    // 当远程连接端离开房间时触发
    this.client_.on("peer-leave", (evt) => {
      const { userId } = evt;
      this.members_.delete(userId);
      onlineOrOfline(false, userId);
      console.log(getUserInfo(userId).UserName + " 离开了房间，或者掉线");
    });

    // 推送远程流时触发
    this.client_.on("stream-added", (evt) => {
      const remoteStream = evt.stream;
      const userId = remoteStream.getUserId();
      this.members_.set(userId, remoteStream);
      console.log(`${getUserInfo(userId).UserName} 推送远程流`);
      this.client_.subscribe(remoteStream, {
        audio: true,
        video: !!getUserInfoByMeet(userId), // 在当前页的才订阅视频
      });
    });

    // 在订阅远程流时触发
    this.client_.on("stream-subscribed", (evt) => {
      const remoteStream = evt.stream;
      const userId = remoteStream.getUserId();
      this.remoteStreams_.push(remoteStream);

      this.playVideo(remoteStream, userId);

      if (!remoteStream) {
        $("#mask_" + userId).show();
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
        // videoHandle(event.state == "PLAYING", userId);
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
      const userId = remoteStream.getUserId();
      const id = remoteStream.getId();
      remoteStream.stop();
      this.members_.set(userId, null);
      console.log(`${getUserInfo(userId).UserName} 取消推送远程流`);
      videoHandle(false, userId);
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

  getUidByStreamId(streamId) {
    for (let [uid, stream] of this.members_) {
      if (stream.getId() == streamId) {
        return uid;
      }
    }
  }

  /**
   * 监听音量回调事件，更新每个用户的音量图标
   */
  startGetAudioLevel() {
    this.client_.on("audio-volume", ({ result }) => {
      result.forEach(({ userId, audioVolume, stream }) => {
        if (audioVolume >= 5) {
          $(`#mic_main_${userId}`)
            .find(".volume-level")
            .css("height", `${audioVolume * 4}%`);
        } else {
          $(`#mic_main_${userId}`).find(".volume-level").css("height", `0%`);
        }

        if (audioVolume >= 5) {
          $(`#mic_drag`)
            .find(".nickname")
            .html(getUserInfo(userId).UserName + " 正在讲话");
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
      //console.log(`network-quality, uplinkNetworkQuality:${event.uplinkNetworkQuality}, downlinkNetworkQuality: ${event.downlinkNetworkQuality}`);
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

      isDisconnect = event.uplinkNetworkQuality == 6;

      this.shezhifenbianlv(event.uplinkNetworkQuality);
    });
  }

  shezhifenbianlv(uplinkNetworkQuality = 2) {
    // 如果网络极差，不管是不是主讲人也将分辨率调到极低
    if (uplinkNetworkQuality >= 4) {
      this.localStream_.setVideoProfile({
        width: 256, // 视频宽度
        height: 144, // 视频高度
        frameRate: 10, // 帧率
        bitrate: 200, // 比特率 kbps
      });
    } else {
      if (!roomDetail_.SpeakerID) {
        this.localStream_.setVideoProfile({
          width: 640, // 视频宽度
          height: 360, // 视频高度
          frameRate: 15, // 帧率
          bitrate: 550, // 比特率 kbps
        });
      } else if (roomDetail_.SpeakerID == oneself_.CHID) {
        this.localStream_.setVideoProfile({
          width: 1280, // 视频宽度
          height: 720, // 视频高度
          frameRate: 15, // 帧率
          bitrate: 1250, // 比特率 kbps
        });
      } else {
        var renshu = [9, 6, 4, 2, 0];
        var fenbianlv = [
          {
            width: 256, // 视频宽度
            height: 144, // 视频高度
            frameRate: 10, // 帧率
            bitrate: 250, // 比特率 kbps
          },
          {
            width: 320, // 视频宽度
            height: 180, // 视频高度
            frameRate: 15, // 帧率
            bitrate: 300, // 比特率 kbps
          },
          {
            width: 640, // 视频宽度
            height: 360, // 视频高度
            frameRate: 15, // 帧率
            bitrate: 550, // 比特率 kbps
          },
          {
            width: 960, // 视频宽度
            height: 540, // 视频高度
            frameRate: 15, // 帧率
            bitrate: 900, // 比特率 kbps
          },
          {
            width: 1280, // 视频宽度
            height: 720, // 视频高度
            frameRate: 15, // 帧率
            bitrate: 1250, // 比特率 kbps
          },
        ];
        for (var i = 0; i < renshu.length; i++) {
          if (roomDetail_.UserList.length >= renshu[i]) {
            this.localStream_.setVideoProfile(fenbianlv[i]);
            break;
          }
        }
      }
    }
  }

  fbl() {
    const videoTrack = this.localStream_.getVideoTrack();
    if (videoTrack) {
      var s = videoTrack.getSettings();
      console.log(`分辨率：${s.width} * ${s.height}, 帧率：${s.frameRate}`);
    }
  }

  // 停止获取流音量
  stopGetAudioLevel() {
    this.client_.enableAudioVolumeEvaluation(-1);
  }
}
