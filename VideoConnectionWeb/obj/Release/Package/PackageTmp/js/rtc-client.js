/* global $ TRTC getCameraId getMicrophoneId resetView isHidden shareUserId addMemberView removeView addVideoView setAnimationFrame clearAnimationFrame*/
class RtcClient {
    constructor(options) {
        this.sdkAppId_ = options.sdkAppId;
        this.userId_ = options.userId;
        this.userSig_ = options.userSig;
        this.roomId_ = options.roomId;
        this.privateMapKey_ = options.privateMapKey;
        this.roomName_ = options.roomName;
        this.XM_ = options.XM;

        this.isJoined_ = false;
        this.isPublished_ = false;
        this.isAudioMuted = false;
        this.isVideoMuted = false;
        this.localStream_ = null;
        this.remoteStreams_ = [];
        this.members_ = new Map();
        this.getAudioLevelTimer_ = -1;

        this.client_ = TRTC.createClient({
            mode: 'rtc',
            sdkAppId: this.sdkAppId_,
            userId: this.userId_,
            userSig: this.userSig_,
            enableAutoPlayDialog: false,
        });
        this.isIndexBtn_ = options.isIndexBtn;
    }

    //进入房间
    async join() {
        console.log('log_join');
        //添加10个小视频div
        for (var i = 0; i < userlistlength; i++) {
            let div = $('<div/>', {
                id: 'small-div'+i,
                class: 'video-box',
                style: 'justify-content: center;position: relative;'
            });
            div.appendTo('#video-grid');
            div.append('<div id="showUserName' + i + '" class="showUserNameOther">' + '<text id="text_' + i + '"  class="loaddiv" title="" style= "max-width: 70%;overflow: hidden;text-overflow: ellipsis;white-space: nowrap">' + i + '</text></div>');
            //添加声音显示
            let memberElm = $('#member-hh').clone();
            memberElm.attr('id', 'user_1');
            memberElm.attr('class', 'user_0');
            memberElm.css('display', 'flex');
            $('#showUserName' + i).append(memberElm);
            div.append('<div id="mask_1" style="width: 100%; height: 100%; position: relative;dispaly:none;"><div class="mask col-div"><div style="height: 100%; width: 100%; position: absolute; background-color: #D8D8D8; top: 0; left: 0;"></div><img style="width: 63px; height: 69px; z-index: 10;" src="./img/camera-max.png" alt=""><div style="height: 10px"></div></div></div>');
        }
        BDuser(0, userlistlength);
        //添加主讲人未登录时的遮罩和姓名
        var userobj = getUserObjByID(this.userId_);
        $('#main-video').append('<div id="showMain" class="showUserNameOther" >' + '<text id="text_' + this.userId_ + '" title="' + userobj.UserName + '" class="loaddiv" style= "max-width: 70%;overflow: hidden;text-overflow: ellipsis;white-space: nowrap">' + userobj.UserName + '</text></div>');
        $('#showMain').val($('#sendUserIDforZJR').val()); 
        //添加声音显示
        let memberElm = $('#member-hh').clone();
        memberElm.attr('id', 'user' + this.userId_);
        memberElm.attr('class', 'user_0');
        memberElm.css('display', 'flex');
        $('#showMain').append(memberElm);
        //绑定处理其他流方法
        this.handleEvents();
        if (this.isJoined_) {
            console.warn('duplicate RtcClient.join() observed');
            return;
        }
        try {
            await this.client_.join({
                roomId: parseInt(this.roomId_)
            });
            this.isJoined_ = true;
            if (getCameraId() && getMicrophoneId()) {
                this.localStream_ = TRTC.createStream({
                    audio: true,
                    video: true,
                    userId: this.userId_,
                    cameraId: getCameraId(),
                    microphoneId: getMicrophoneId(),
                    mirror: false
                });
            } else {
                this.localStream_ = TRTC.createStream({
                    audio: true,
                    video: true,
                    userId: this.userId_,
                    mirror: false
                });
            }
            try {
                //初始化本地流，该流将填充音频/视频，设置分辨率
                this.localStream_.setVideoProfile((this.userId_ == $('#sendUserIDforZJR').val()) ? '1080p' : '480p');
                await this.localStream_.initialize();
                this.localStream_.on('player-state-changed', event => {
                    //console.log(`local stream ${event.type} player is ${event.state}`);STOPPED
                    /*alert(event.state);*/
                });
            } catch (error) {
                //switch (error.name) {
                //    case 'NotReadableError':
                //        alert(
                //            '暂时无法访问摄像头/麦克风，请确保系统允许当前浏览器访问摄像头/麦克风，并且没有其他应用占用摄像头/麦克风'
                //        );
                //        return;
                //    case 'NotAllowedError':
                //        if (error.message === 'Permission denied by system') {
                //            alert('请确保系统允许当前浏览器访问摄像头/麦克风');
                //        } else {
                //            console.log('User refused to share the screen');
                //        }
                //        return;
                //    case 'NotFoundError':
                //        alert(
                //            '浏览器获取不到摄像头/麦克风设备，请检查设备连接并且确保系统允许当前浏览器访问摄像头/麦克风'
                //        );
                //        return;
                //    default:
                //        alert(
                //            '暂时无法访问摄像头/麦克风，请确保系统允许当前浏览器访问摄像头/麦克风，并且没有其他应用占用摄像头/麦克风'
                //        );
                //        return;
                //}
            }
            try {
                //播放自己用来获取长宽比  
                this.localStream_.play('div_ckb', { objectFit: 'cover' }).then(() => {
                    var vH = $("#video_" + this.localStream_.getId())[0].videoHeight;
                    var vW = $("#video_" + this.localStream_.getId())[0].videoWidth;
                    ckb = vH / vW;
                    $("#SendCKB").click();
                    this.localStream_.stop();
                }).catch((error) => {
                });
                //发布订阅
                await this.publish();
                //是否是主持人
                if ($('#IsZCR').val() == true && this.isIndexBtn_) {
                    let str = '';
                    str += '<div  style=" width: 28px; height: 28px; margin-left: 10px;" />';
                    str = str.replace("^", "'");
                    str = str.replace("&", "'");
                    str += '<div  style=" width: 28px; height: 28px; margin-left: 10px;"  />';
                    str = str.replace("^", "'");
                    str = str.replace("&", "'");
                    str += '<div ><button class="zcrbtn" onclick="ClickZCR(^' + this.userId_ + '&)">设置主讲人</button>';
                    str = str.replace("^", "'");
                    str = str.replace("&", "'");
                    str += '</div>';
                    $('#divZCR').html(str);
                    $('#divZCR').css('display', 'flex');
                }
                //播放自己的视频流
                if ($('#sendUserIDforZJR').val() != '' && $('#sendUserIDforZJR').val() != this.userId_) {
                    //修改主讲人展示名称和麦克风
                    ChangeZJRxx($('#sendUserIDforZJR').val());
                    if (GetStreamDiv(this.userId_) != 'no') {
                        this.PlayTheStream(GetStreamDiv(this.userId_), this.userId_);
                    }
                } else {
                    this.PlayTheStream('main-video', this.userId_);
                }

            } catch (error) {
                console.error('failed to publish local stream - ', error);
            }
            // 开始获取音量
            this.startGetAudioLevel();
        } catch (error) {
            console.error('join room failed! ' + error);
        }
        this.UpdateUserStates();
        //不是主持人和主讲人自动关闭麦克风
        if ($('#IsZCR').val() == false && $("#sendUserIDforZJR").val() != this.userId_) {
            $('#mic-btn').click();
        }
    }

    //更新成员状态
    UpdateUserStates() {
        let states = this.client_.getRemoteMutedState();
        for (let state of states) {
            if (state.audioMuted) {
                $('#' + state.userId)
                    .find('.member-audio-btn')
                    .attr('src', './img/mic-off.png');
            }
            if (state.videoMuted) {
                $('#' + state.userId)
                    .find('.member-video-btn')
                    .attr('src', './img/camera-off.png');
                $('#mask_' + this.members_.get(state.userId).getId()).show();
            }
        }
    }
    //退出
    async leave() {
        if (!this.isJoined_) {
            console.warn('leave() - please join() firstly');
            return;
        }
        //取消发布本地流
        await this.unpublish();
        // leave the room
        await this.client_.leave();
        this.localStream_.stop();
        this.localStream_.close();
        this.localStream_ = null;
        this.isJoined_ = false;
        // 停止获取音量
        this.stopGetAudioLevel();
    }
    //发布本地流
    async publish() {
        if (!this.isJoined_) {
            return;
        }
        if (this.isPublished_) {
            return;
        }
        try {
            await this.client_.publish(this.localStream_);
        } catch (error) {
            this.isPublished_ = false;
        }
        this.isPublished_ = true;
    }
    //取消发布本地流
    async unpublish() {
        if (!this.isJoined_) {
            console.warn('unpublish() - please join() firstly');
            return;
        }
        if (!this.isPublished_) {
            console.warn('RtcClient.unpublish() called but not published yet');
            return;
        }
        await this.client_.unpublish(this.localStream_);
        this.isPublished_ = false;
    }
    //禁用音频
    muteLocalAudio() {
        this.localStream_.muteAudio();
    }
    //启用音频
    unmuteLocalAudio() {
        this.localStream_.unmuteAudio();
    }
    //禁用视频
    muteLocalVideo() {
        $('#mask_' + this.localStream_.getId()).show();
        this.localStream_.muteVideo();
    }
    //启用视频
    unmuteLocalVideo() {
        this.localStream_.unmuteVideo();
        $('#mask_' + this.localStream_.getId()).hide();
    }
    //重新加载流
    resumeStreams() {
        this.localStream_.resume();
        for (let stream of this.remoteStreams_) {
            stream.resume();
        }
    }
    //修改分辨率
    changeFBL(zjrID, oldzjrID) {
        if (this.userId_ == zjrID) {
            this.localStream_.setVideoProfile('1080p');
        } else if (this.userId_ == oldzjrID) {
            this.localStream_.setVideoProfile('480p');
        }
    }
    //切换摄像头
    ChangeCameraId() {
        this.localStream_.switchDevice('video', cameraId).then(() => {
        });
    }
    //切换麦克风
    ChangeMicId() {
        this.localStream_.switchDevice('audio', micId).then(() => {
        });
    }
    //订阅流
    async SubscribeTheStream(userid, divid) {
        const remoteStream = this.members_.get(userid);
        if (remoteStream != undefined && !remoteStream.isPlaying_) {
            await this.client_.unsubscribe(remoteStream);
            await this.client_.subscribe(remoteStream); 
        } else if (userid == this.userId_ && this.localStream_ != null && $('#sendUserIDforZJR').val() != userid && $('#sendUserIDforZJR').val()!= '') {
            this.PlayTheStream(divid, userid);
        }
    }
    //取消订阅所有流
    UNSubscribeTheStream() {
        //显示所有遮罩
        for (var i = 0; i < userlistlength; i++) {
            $('#small-div' + i).find('div#mask_1').show();
        }
        //当自己不在大视频显示时，停止播放
        if ($('#sendUserIDforZJR').val() != this.userId_ && (this.localStream_ == null ? false : this.localStream_.isPlaying_) && GetStreamDiv(this.userId_) == 'no' && $('#sendUserIDforZJR').val() != '') {
            this.localStream_.stop();
        } else if ($('#sendUserIDforZJR').val() != this.userId_ && $('#sendUserIDforZJR').val() != '') {
            $('#' + GetStreamDiv(this.userId_)).find('div#mask_1').hide();
        }
        for (var i = 0; i < this.remoteStreams_.length; i++) {
            //主讲人的不取消订阅
            if ($('#showMain').val() == this.remoteStreams_[i].userId_ ) {
                continue;
            }
            //在当前页继续播放的流不取消
            if (GetStreamDiv(this.remoteStreams_[i].userId_) != 'no') {
                $('#' + GetStreamDiv(this.remoteStreams_[i].userId_)).find('div#mask_1').hide();
                continue;
            }
            if (this.remoteStreams_[i].isPlaying_) {
                this.remoteStreams_[i].stop();
            }
            this.client_.unsubscribe(this.remoteStreams_[i]);
        }
    }
    //将上一个主讲人移动至小视频
    MoveStreamToSmall(userid) {
        //避免重复设置主讲人
        if ($('#showMain').val() != userid) {
            var smallid = GetStreamDiv(userid);
            if (smallid != 'no') {
                $('#' + smallid).find('div#mask_1').show();
            }
            //判断是自己还是上一个主讲人
            var olduserid = ($('#showMain').val() == this.userId_ || $('#showMain').val() == undefined) ? this.userId_ : $('#showMain').val();
            //无主讲人时为自己
            olduserid = $('#showMain').val() == '' ? this.userId_ : $('#showMain').val();
            var smalloldid = GetStreamDiv(olduserid);
            if (smalloldid != 'no' ) {
                this.PlayTheStream(smalloldid, olduserid);
            } else if (olduserid == this.userId_) {
                this.localStream_.stop();
            } else {
                const remoteStream = this.members_.get(olduserid);
                if (remoteStream != undefined) {
                    remoteStream.stop();
                    this.client_.unsubscribe(remoteStream);
                }
            }
            //修改主讲人展示名称和麦克风
            ChangeZJRxx(userid);
            $('#showMain').val(userid);
        }
    }
    //设置主讲人
    async SetUserForZJR(userid) {
        if (userid == this.userId_) {
            //设置自己为主讲人
            if ($('#showMain').val() == '') {
                $('#showMain').val(userid);
            } else {
                this.MoveStreamToSmall(this.userId_);
            }
            this.PlayTheStream('main-video', this.userId_);
            //设置音频视频打开
            if (!isCamOn) {
                $('#video-btn').click();
            }
            if (!isMicOn) {
                $('#mic-btn').click();
            }
        } else {
            //设置其他人为主讲人
            const remoteStream = this.members_.get(userid);
            if (remoteStream != undefined) {
                await this.client_.unsubscribe(remoteStream);
                await this.client_.subscribe(remoteStream);
            }
        }
    }
    //停止播放某个流
    StopPlayStream(userid) {
        const remoteStream = this.members_.get(userid);
        if (remoteStream != undefined && remoteStream.isPlaying_) {
            remoteStream.stop();
        }
    }
    //播放视频流
    PlayTheStream(divid, userid) {
        const remoteStream = userid == this.userId_ ? this.localStream_ : this.members_.get(userid);
        //如果主讲人不在不播放该流
        if (remoteStream == undefined) {
            return;
        } else {
            if (divid != 'main-video') {
                $('#' + divid).find('div#mask_1').hide();
            }
        }
        var id = remoteStream.getId();
        if (remoteStream.isPlaying_) {
            remoteStream.stop();
        }
        //判断是否剪裁
        var cover = 'cover';
        for (var i = 0; i < UserList.length; i++) {
            if (UserList[i].ID == userid && UserList[i].AspectRatio > 1 && divid == 'main-video') {
                cover = 'contain';
            }
        }
        remoteStream.play(divid, { objectFit: cover}).catch(error => { });
        remoteStream.on('error', error => {
            if (error.getCode() === 0x4043) {
                $("#streamReId").show();
            } else if (error.getCode() === 0x4044) {
                const newStream = TRTC.createStream({ userId: userid, audio: true, video: true });
                try {
                    newStream.initialize();
                    // 获取摄像头和麦克风 track
                    const videoTrack = newStream.getVideoTrack();
                    const audioTrack = newStream.getAudioTrack();
                    // 分别替换摄像头和麦克风 track
                    remoteStream.replaceTrack(videoTrack);
                    remoteStream.replaceTrack(audioTrack);
                } catch (err) {
                }
            }
        });
        //添加“摄像头未打开”遮罩
        let mask = divid == 'main-video' ? $('#mask_main2').clone(): $('#mask_main').clone();
        mask.attr('id', 'mask_' + id);
        mask.appendTo($('#player_' + id));
        mask.hide();
        if (this.userId_ != userid && !remoteStream.hasVideo()) {
            mask.show();
            $('#' + remoteStream.getUserId())
                .find('.member-video-btn')
                .attr('src', 'img/camera-off.png');
        }
    }

    //远端流方法
    handleEvents() {
        this.client_.on('error', err => {
            // 当出现客户端错误后，请调用 Client.leave() 退房并尝试通过 Client.join() 重新进房恢复通话。
            this.client_.leave();
            this.client_.join();
        });
        //重复用户登录
        this.client_.on('client-banned', err => {
            console.error('client has been banned for ' + err);
            window.close();
            if (!isHidden()) {
                //alert('您已被踢出连线');
            } else {
                document.addEventListener(
                    'visibilitychange',
                    () => {
                        if (!isHidden()) {
                            //alert('您已被踢出连线');
                        }
                    },false
                );
            }
        });
        //远程对方加入房间
        this.client_.on('peer-join', evt => {
            const userId = evt.userId;
            if (userId !== shareUserId) {
                SetUserLine(userId);
            }
        });
        //远程对方离开房间
        this.client_.on('peer-leave', evt => {
            const userId = evt.userId;
            removeView(userId);
        });
        //添加远程流
        this.client_.on('stream-added', evt => {
            const remoteStream = evt.stream;
            const userId = remoteStream.getUserId();
            this.members_.set(userId, remoteStream);
            //判断是否订阅当前流
            JudgeSubscribeStream(userId);
        });
        //订阅远程流成功
        this.client_.on('stream-subscribed', evt => {
            const remoteStream = evt.stream;
            if (this.remoteStreams_.indexOf(remoteStream) == -1) {
                this.remoteStreams_.push(remoteStream);
            }
            //判断是否是主讲人，主讲人在大视频显示,非主讲人在小视频显示
            var smallid = remoteStream.userId_ == $('#sendUserIDforZJR').val() ? 'main-video' : GetStreamDiv(remoteStream.userId_);
            //播放主讲人视频流时，将当前主视频的视频流移动到小视频上
            if (smallid == 'main-video') {
                this.MoveStreamToSmall(remoteStream.userId_);
            }
            //播放视频流
            this.PlayTheStream(smallid, remoteStream.userId_);
        });
        //删除远程流时激发
        this.client_.on('stream-removed', evt => {
            const remoteStream = evt.stream;
            const id = remoteStream.getId();
            remoteStream.stop();
            this.remoteStreams_ = this.remoteStreams_.filter(stream => {
                return stream.getId() !== id;
            });
            $('#' + remoteStream.getUserId())
                .find('.member-audio-btn')
                .attr('src', 'img/mic-on.png');
            $('#' + remoteStream.getUserId())
                .find('.member-video-btn')
                .attr('src', 'img/camera-on.png');
            //const userId = remoteStream.userId_;
            //removeView(userId);
        });
        //远端流更新
        this.client_.on('stream-updated', evt => {
            const remoteStream = evt.stream;
            let uid = this.getUidByStreamId(remoteStream.getId());
            if (!remoteStream.hasVideo()) {
                $('#' + uid)
                    .find('.member-video-btn')
                    .attr('src', 'img/camera-off.png');
            }
        });
        //远端关闭声音
        this.client_.on('mute-audio', evt => {
            $('#' + evt.userId)
                .find('.member-audio-btn')
                .attr('src', 'img/mic-off.png');
        });
        //远端开启声音
        this.client_.on('unmute-audio', evt => {
            $('#' + evt.userId)
                .find('.member-audio-btn')
                .attr('src', 'img/mic-on.png');
        });
        //远端关闭视频
        this.client_.on('mute-video', evt => {
            $('#' + evt.userId)
                .find('.member-video-btn')
                .attr('src', 'img/camera-off.png');
            const remoteStream = this.members_.get(evt.userId);
            if (remoteStream) {
                let streamId = remoteStream.getId();
                if (streamId) {
                    $('#mask_' + streamId).show();
                }
            }
        });
        //远端开启视频
        this.client_.on('unmute-video', evt => {
            $('#' + evt.userId)
                .find('.member-video-btn')
                .attr('src', 'img/camera-on.png');
            const stream = this.members_.get(evt.userId);
            if (stream) {
                let streamId = stream.getId();
                if (streamId) {
                    $('#mask_' + streamId).hide();
                }
            }
        });
        //监听网络
        this.client_.on('network-quality', event => {
            //console.log(`network-quality, uplinkNetworkQuality:${event.uplinkNetworkQuality}, downlinkNetworkQuality: ${event.downlinkNetworkQuality}`);
            //'0': '未知', '1': '极佳', '2': '较好', '3': '一般', '4': '差', '5': '极差', '6': '断开'
            if ($("#sendUserIDforZJR").val() == this.userId_) {
                if (event.uplinkNetworkQuality >= 4 && NetworkStatus != 5) {
                    NetworkStatus = 5;
                    this.localStream_.setVideoProfile('480p');
                } else if (event.uplinkNetworkQuality < 4 && NetworkStatus != 1) {
                    NetworkStatus = 1;
                    this.localStream_.setVideoProfile('1080p');
                }
            }
        });
    }
    //根据流ID获取userID
    getUidByStreamId(streamId) {
        for (let [uid, stream] of this.members_) {
            if (stream.getId() == streamId) {
                return uid;
            }
        }
    }
    // 监听音量回调事件，更新每个用户的音量图标
    startGetAudioLevel() {
        this.client_.on('audio-volume', ({ result }) => {
            result.forEach(({ userId, audioVolume }) => {
                if (audioVolume >= 10) {
                    $(`#${userId === this.userId_ ? 'member-me' :  userId}`)
                        .find('.volume-level')
                        .css('height', `${audioVolume * 4}%`);

                    $(`#${userId === this.userId_ ? 'member-hh' : 'user' + userId}`)
                        .find('.volume-level')
                        .css('height', `${audioVolume * 4}%`);

                    $(`#${userId === this.userId_ ? 'user' + userId : 'member-hh'}`)
                        .find('.volume-level')
                        .css('height', `${audioVolume * 4}%`);
                } else {
                    $(`#${userId === this.userId_ ? 'member-me' :  userId}`)
                        .find('.volume-level')
                        .css('height', `0%`);

                    $(`#${userId === this.userId_ ? 'member-hh' : 'user' + userId}`)
                        .find('.volume-level')
                        .css('height', `0%`);


                    $(`#${userId === this.userId_ ? 'user' + userId : 'member-hh'}`)
                        .find('.volume-level')
                        .css('height', `0%`);
                }
            });
        });
        this.client_.enableAudioVolumeEvaluation(100);
    }
    // 停止获取流音量
    stopGetAudioLevel() {
        this.client_.enableAudioVolumeEvaluation(-1);
    }

}
