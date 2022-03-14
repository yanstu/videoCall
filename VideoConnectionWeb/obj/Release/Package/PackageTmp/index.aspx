<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="index.aspx.cs" Inherits="VideoConnectionWeb.index" %>

<!DOCTYPE html>

<html xmlns="http://www.w3.org/1999/xhtml">
<head>
    <title>视频连线</title>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=0.7, user-scalable=no, shrink-to-fit=no" />
    <link rel="stylesheet" href="./css/bootstrap-material-design.min.css" />
    <link rel="stylesheet" href="./css/index.css?v=20211203_14" />
    <link rel="stylesheet" href="./css/room.css?v=20211203_10" />
    <script src="js/ApiHelper.js?v=20211126_26"></script>
    <style>
        body {
            display: none;
        }

        .showUserNameOther {
            position: absolute;
            bottom: 0px;
            left: 5px;
            z-index: 99;
            color: white;
            font-weight: blod;
            font-size: 15px;
            width: 85%;
        }

        .tcbtn {
            background-color: #FA585E;
            width: 85px;
            color: #fff !important;
            border-radius: 20px;
            border: 1px;
            height: 30px;
            margin-right: 20px;
        }

        .zcrbtn {
            border: none;
            color: white;
            background: #999;
            padding: 4px;
            font-size: 14px;
            border-radius: 4px;
            margin-left: 10px;
        }
    </style>
</head>

<body>
    <div id="root">
        <!-- 登录页面 -->
        <div id="login-root" style="display: none;">
            <!-- 登录卡片 -->
            <div id="login-card" class="card">
                <!-- 用户名 视频连线 登录按钮-->
                <div class="col-div" style="width: 320px;">
                    <div class="form-group bmd-form-group is-filled" style="width: 100%; height: 80px">
                        <label for="userId" class="bmd-label-floating">用户名:</label>
                        <input type="text" class="form-control" name="userId" id="userId" maxlength="18">
                    </div>
                    <div class="form-group bmd-form-group is-filled" style="width: 100%; height: 80px">
                        <label for="roomId" class="bmd-label-floating">视频连线:</label>
                        <input type="text" class="form-control" name="roomId" id="roomId" maxlength="18">
                    </div>
                    <div style="height: 24px"></div>
                    <!-- 登录 -->
                    <button id="login-btn" type="button" class="btn btn-raised btn-primary"
                        style="width: 100%; height: 40px">
                        进入房间
                        <div class="ripple-container"></div>
                    </button>
                    <!-- 摄像头 麦克风 -->
                    <div class="row-div" style="width: 100%; height: 105px; justify-content: center;">
                        <img id="camera" style="height: 27px" src="./img/camera.png" onclick="event.cancelBubble = true"
                            data-toggle="popover" data-placement="top" title="" data-content="">
                        <!-- 选择摄像头 -->
                        <div id="camera-option" style="display: none"></div>
                        <div style="width: 100px"></div>
                        <img id="microphone" style="height: 27px" src="./img/mic.png"
                            onclick="event.cancelBubble = true" data-toggle="popover" data-placement="top" title=""
                            data-content="">
                        <!-- 选择麦克风 -->
                        <div id="mic-option" style="display: none"></div>
                    </div>
                    <!-- 设备检测按钮 -->
                    <div id="device-testing-btn" class="device-testing-btn">
                        <div class="device-icon">
                            <svg class="icon" aria-hidden="true">
                                <use xlink:href="#icon-device"></use>
                            </svg>
                        </div>
                        设备检测
                    </div>
                    <div id="device-connect-list" class="device-connect-list" style="display: none;">
                        <div id="connect-camera" class="connect icon-normal">
                            <svg class="icon" aria-hidden="true">
                                <use xlink:href="#icon-cameraIcon"></use>
                            </svg>
                        </div>
                        <div id="connect-voice" class="connect icon-normal">
                            <svg class="icon" aria-hidden="true">
                                <use xlink:href="#icon-voice"></use>
                            </svg>
                        </div>
                        <div id="connect-mic" class="connect icon-normal">
                            <svg class="icon" aria-hidden="true">
                                <use xlink:href="#icon-microphone"></use>
                            </svg>
                        </div>
                        <div id="connect-network" class="connect icon-normal">
                            <svg class="icon" aria-hidden="true">
                                <use xlink:href="#icon-network"></use>
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <!-- 设备检测界面弹窗 -->
        <div id="device-testing-root" style="display: none;">
            <!-- 设备检测卡片 -->
            <div class="device-testing-card">
                <!-- 设备检测准备界面 -->
                <div id="device-testing-prepare" class="device-testing-prepare">
                    <div class="testing-title">设备连接</div>
                    <div class="testing-prepare-info">设备检测前请务必给当前页面开放摄像头，麦克风权限哦~</div>
                    <div class="device-display">
                        <div id="device-camera" class="device icon-normal">
                            <svg class="icon" aria-hidden="true">
                                <use xlink:href="#icon-cameraIcon"></use>
                            </svg>
                        </div>
                        <div id="device-voice" class="device icon-normal">
                            <svg class="icon" aria-hidden="true">
                                <use xlink:href="#icon-voice"></use>
                            </svg>
                        </div>
                        <div id="device-mic" class="device icon-normal">
                            <svg class="icon" aria-hidden="true">
                                <use xlink:href="#icon-microphone"></use>
                            </svg>
                        </div>
                        <div id="device-network" class="device icon-normal">
                            <svg class="icon" aria-hidden="true">
                                <use xlink:href="#icon-network"></use>
                            </svg>
                        </div>
                    </div>
                    <div id="device-loading" class="loading-background">
                        <div class="device-loading"></div>
                    </div>
                    <!-- 连接结果提示 -->
                    <div class="connect-info">
                        <!-- 连接结果 -->
                        <div id="connect-info" style="max-width: 60%;"></div>
                        <!-- 错误icon及错误解决指引 -->
                        <div id="connect-attention-container" class="connect-attention-container" style="display: none;">
                            <div id="connect-attention-icon" class="connect-attention-icon">
                                <svg class="icon" aria-hidden="true">
                                    <use xlink:href="#icon-warn"></use>
                                </svg>
                            </div>
                            <div id="connect-attention-info" class="connect-attention-info" style="display: none;">
                            </div>
                        </div>
                    </div>
                    <!-- 设备连接页面button -->
                    <div class="testing-btn-display">
                        <div id="start-test-btn" class="test-btn start-test start-gray">开始检测</div>
                        <div id="start-test-btn-tc" class="test-btn start-test start-gray" style="margin-left: 15px;" onclick="GBtest()">关闭</div>
                        <div id="connect-again-btn" class="test-btn connect-again" style="display: none; margin-left: 15px;">重新连接</div>
                    </div>
                </div>
                <!-- 设备检测tab页 -->
                <div id="device-testing" class="device-testing" style="display: none;">
                    <div class="device-testing-title">
                        <div id="camera-testing" class="testing icon-gray">
                            <svg class="icon" aria-hidden="true">
                                <use xlink:href="#icon-cameraIcon"></use>
                            </svg>
                        </div>
                        <div id="voice-testing" class="testing icon-gray">
                            <svg class="icon" aria-hidden="true">
                                <use xlink:href="#icon-voice"></use>
                            </svg>
                        </div>
                        <div id="mic-testing" class="testing icon-gray">
                            <svg class="icon" aria-hidden="true">
                                <use xlink:href="#icon-microphone"></use>
                            </svg>
                        </div>
                        <div id="network-testing" class="testing icon-gray">
                            <svg class="icon" aria-hidden="true">
                                <use xlink:href="#icon-network"></use>
                            </svg>
                        </div>
                    </div>
                    <!-- 设备检测-摄像头检测 -->
                    <div id="camera-testing-body" class="testing-body" style="display: none;">
                        <div class="device-list camera-device-list">
                            <div class="select-title" style="display: block;">摄像头选择</div>
                            <div class="select-list" style="display: block;">
                                <select name="select" id="camera-select" class="device-select"></select>
                            </div>
                        </div>
                        <div id="camera-video" class="camera-video"></div>
                        <div class="testing-info-container">
                            <div class="testing-info">是否可以清楚的看到自己？</div>
                            <div class="button-list">
                                <div id="camera-fail" class="fail-button">看不到</div>
                                <div id="camera-success" class="success-button">可以看到</div>
                            </div>
                        </div>
                    </div>
                    <!-- 设备检测-播放器检测 -->
                    <div id="voice-testing-body" class="testing-body" style="display: none;">
                        <div class="device-list camera-device-list">
                            <div class="select-title" style="display: block;">扬声器选择</div>
                            <div class="select-list" style="display: block;">
                                <select name="select" id="voice-select" class="device-select"></select>
                            </div>
                        </div>
                        <div class="audio-control">
                            <div class="audio-control-info">请调高设备音量, 点击播放下面的音频试试～</div>
                            <audio id="audio-player" src="https://web.sdk.qcloud.com/trtc/webrtc/assets/bgm-test.mp3" controls></audio>
                        </div>
                        <div class="testing-info-container">
                            <div class="testing-info">是否可以听到声音？</div>
                            <div class="button-list">
                                <div id="voice-fail" class="fail-button">听不到</div>
                                <div id="voice-success" class="success-button">可以听到</div>
                            </div>
                        </div>
                    </div>
                    <!-- 设备检测-麦克风检测 -->
                    <div id="mic-testing-body" class="testing-body" style="display: none;">
                        <div class="device-list camera-device-list">
                            <div class="select-title" style="display: block;">麦克风选择</div>
                            <div class="select-list" style="display: block;">
                                <select name="select" id="mic-select" class="device-select"></select>
                            </div>
                        </div>
                        <div class="mic-testing-container">
                            <div class="mic-testing-info">对着麦克风说'哈喽'试试～</div>
                            <div id="mic-bar-container" class="mic-bar-container"></div>
                            <div id="audio-container"></div>
                        </div>
                        <div class="testing-info-container">
                            <div class="testing-info">是否可以看到音量图标跳动？</div>
                            <div class="button-list">
                                <div id="mic-fail" class="fail-button">看不到</div>
                                <div id="mic-success" class="success-button">可以看到</div>
                            </div>
                        </div>
                    </div>
                    <!-- 设备检测-硬件及网速检测 -->
                    <div id="network-testing-body" class="testing-body" style="display: none;">
                        <div class="testing-index-list">
                            <div class="testing-index-group">
                                <div class="testing-index">操作系统</div>
                                <div id="system"></div>
                            </div>
                            <div class="testing-index-group">
                                <div class="testing-index">浏览器版本</div>
                                <div id="browser"></div>
                            </div>
                            <!-- <div class="testing-index-group">
                                <div class="testing-index">IP地址</div>
                                <div id="ip"></div>
                            </div> -->
                            <div class="testing-index-group">
                                <div class="testing-index">屏幕共享能力</div>
                                <div id="screen-share"></div>
                            </div>
                            <div class="testing-index-group">
                                <div class="testing-index">网络延迟</div>
                                <div id="network-rtt" class="network-loading"></div>
                            </div>
                            <div class="testing-index-group">
                                <div class="testing-index">上行网络质量</div>
                                <div id="uplink-network" class="network-loading"></div>
                            </div>
                            <div class="testing-index-group">
                                <div class="testing-index">下行网络质量</div>
                                <div id="downlink-network" class="network-loading"></div>
                            </div>
                            <div class="testing-index-group">
                                <div class="testing-index">检测剩余时间</div>
                                <div id="count-down"></div>
                            </div>
                        </div>
                        <div class="testing-footer">
                            <div id="testing-report-btn" class="test-btn">查看检测报告</div>
                        </div>
                    </div>
                </div>
                <!-- 设备检测报告 -->
                <div id="device-testing-report" class="device-testing-report" style="display: none;">
                    <div class="testing-title">检测报告</div>
                    <!-- 检测报告内容 -->
                    <div class="device-report-list">
                        <!-- 摄像头报告信息 -->
                        <div class="device-report camera-report">
                            <div class="device-info">
                                <div class="report-icon">
                                    <svg class="icon" aria-hidden="true">
                                        <use xlink:href="#icon-cameraIcon"></use>
                                    </svg>
                                </div>
                                <div id="camera-name" class="device-name"></div>
                            </div>
                            <div id="camera-testing-result" class="camera-testing-result"></div>
                        </div>
                        <!-- 扬声器报告信息 -->
                        <div id="voice-report" class="device-report voice-report">
                            <div class="device-info">
                                <div class="report-icon">
                                    <svg class="icon" aria-hidden="true">
                                        <use xlink:href="#icon-voice"></use>
                                    </svg>
                                </div>
                                <div id="voice-name" class="device-name"></div>
                            </div>
                            <div id="voice-testing-result" class="voice-testing-result"></div>
                        </div>
                        <!-- 麦克风报告信息 -->
                        <div class="device-report mic-report">
                            <div class="device-info">
                                <div class="report-icon">
                                    <svg class="icon" aria-hidden="true">
                                        <use xlink:href="#icon-microphone"></use>
                                    </svg>
                                </div>
                                <div id="mic-name" class="device-name"></div>
                            </div>
                            <div id="mic-testing-result" class="mic-testing-result"></div>
                        </div>
                        <!-- 网络报告信息 -->
                        <div class="device-report network-report">
                            <div class="device-info">
                                <div class="report-icon">
                                    <svg class="icon" aria-hidden="true">
                                        <use xlink:href="#icon-network"></use>
                                    </svg>
                                </div>
                                <div id="network-name" class="device-name">网络延迟</div>
                            </div>
                            <div id="rtt-result" class="network-testing-result"></div>
                        </div>
                        <div class="device-report network-report">
                            <div class="device-info">
                                <div class="report-icon">
                                    <svg class="icon" aria-hidden="true">
                                        <use xlink:href="#icon-network"></use>
                                    </svg>
                                </div>
                                <div id="etwork-name" class="device-name">上行网络质量</div>
                            </div>
                            <div id="uplink-network-quality-result" class="network-testing-result"></div>
                        </div>
                        <div class="device-report network-report">
                            <div class="device-info">
                                <div class="report-icon">
                                    <svg class="icon" aria-hidden="true">
                                        <use xlink:href="#icon-network"></use>
                                    </svg>
                                </div>
                                <div id="network-name" class="device-name">下行网络质量</div>
                            </div>
                            <div id="downlink-network-quality-result" class="network-testing-result"></div>
                        </div>
                    </div>
                    <div class="device-report-footer">
                        <div id="testing-again" class="device-report-btn testing-agin">重新检测</div>
                        <div id="testing-finish" class="device-report-btn testing-finish">完成检测</div>
                    </div>
                </div>
                <!-- 设备检测关闭按钮 -->
                <div id="device-testing-close-btn" class="device-testing-close-btn">
                    <svg class="icon" aria-hidden="true">
                        <use xlink:href="#icon-closeIcon"></use>
                    </svg>
                </div>
            </div>
        </div>
        <!-- 聊天室页面 -->
        <div id="room-root" class="col-div" style="background-color: #303030; height: 100%;">
            <!-- header -->
            <div class="row-div card" style="width: 100%; height: 8%; justify-content: space-between; background-color: #303030; ">
                <!-- 视频连线 -->
                <div id="header-roomId" style="font-size: 14px; color: white; margin-left: 20px;">
                    <img id="mean_btn" style="width: 35px; height: 35px" src="./img/sf_ic_menu.png" alt="" />
                    <img style="width: 35px; height: 35px; margin-left: 10px;" src="./img/check-mic.png" alt="" onclick="showDevice()" />
                </div>
                <!-- 标题 -->
                <div class="row-div" style="height: 100%; width: 35%; justify-content: center;">
                    <div id="hyTitle" style="width: 100%; height: 23px; font-size: 36px; color: white; justify-content: center;">
                    </div>
                </div>
                <!-- 分享屏幕 退出 按钮 -->
                <div class="row-div" style="height: 100%; width: auto;">
                    <button id="logout-btn" class="tcbtn">退出</button>
                </div>
                <div id="ycSig" style="display: none;"></div>
                <div id="userrealyName" style="display: none;"></div>
            </div>
            <!-- content -->
            <div id="hidebtn" class="row-div" style="height: 92%; width: 100%; background-color: #303030; ">
                <!-- 主视频 -->
                <div id="video-grid2" style="height: 100%; width: 100%; padding-left: 5px; ">
                    <div id="main-video" class="video-box col-div" style="justify-content: flex-end;">
                        <div id="mask_main" class="mask col-div">
                            <div style="height: 100%; width: 100%; position: absolute; background-color: #D8D8D8; top: 0; left: 0;"></div>
                            <img style="width: 63px; height: 69px; z-index: 10;" src="./img/camera-max.png" alt="">
                            <div style="height: 10px"></div>
                        </div>
                    </div>
                </div>
                <!-- 小视频 12% 20%-->
                <div id="video-grid" style="height: 92%; width: 20%; overflow-y: auto; padding-left: 5px; z-index: 888; position: absolute; right: 0; ">
                </div>
            </div>
            <!-- 主讲人关闭视频背景 -->
            <div id="mask_main2" class="mask col-div" style="display:none">
                <div style="height: 100%; width: 100%; position: absolute; background-color: #888888; top: 0; left: 0;"></div>
                <img style="width: 63px; height: 69px; z-index: 10;" src="./img/camera-max.png" alt="">
                <div style="height: 10px"></div>
            </div>
            <!--底部菜单-->
            <div id="bottom_mean">
                <div></div>
                <div style="width: 650px; justify-content: space-around; background-color: rgba(255,255,255,0.2); padding: 10px; border-radius: 5px;">
                    <div class="icondiv">
                        <img id="mic-btn" style="width: 40px; height: 40px" onclick="event.cancelBubble = true"
                            src="./img/trtcmeeting_ic_mic_on.png" alt="">
                        <div style="display: block; text-align: center; color: white; margin-top: 5px">麦克风</div>
                    </div>
                    <div class="icondiv">
                        <img id="video-btn" style="width: 40px; height: 40px" onclick="event.cancelBubble = true"
                            src="./img/trtcmeeting_ic_camera_on.png" alt="">
                        <div style="display: block; text-align: center; color: white; margin-top: 5px">摄像头</div>
                    </div>
                    <div class="icondiv">
                        <img id="show-user" style="width: 40px; height: 40px" src="./img/trtcmeeting_ic_member.png" alt="">
                        <div style="display: block; text-align: center; color: white; margin-top: 5px">参与者</div>
                    </div>
                    <div class="icondiv" id="sqfy_div">
                        <img id="ApplicationSpeech" style="width: 40px; height: 40px" src="./img/sf_apply_ic.png" alt="">
                        <div style="display: block; text-align: center; color: white; margin-top: 5px">申请发言</div>
                    </div>
                    <div class="icondiv" id="sqfylb_div">
                        <img id="ApplicationSpeechList" style="width: 40px; height: 40px" src="./img/sf_apply_ic.png" alt="">
                        <div style="display: block; text-align: center; color: white; margin-top: 5px">发言列表</div>
                    </div>
                    <%--<div class="icondiv">
                        <img id="" style="width: 40px; height: 40px" src="./img/sf_ic_record.png" alt="">
                        <div style="display: block;text-align: center;color:white;margin-top:5px" onclick="xxxx(1)">1080</div>
                    </div>
                    <div class="icondiv">
                        <img id="" style="width: 40px; height: 40px" src="./img/sf_ic_record.png" alt="">
                        <div style="display: block;text-align: center;color:white;margin-top:5px" onclick="xxxx(2)">180</div>
                    </div>--%>
                    <div class="icondiv">
                        <img id="message-btn" style="width: 40px; height: 40px" src="./img/sf_ic_message.png" alt="">
                        <div style="display: block; text-align: center; color: white; margin-top: 5px">消息</div>
                    </div>
                    <div class="icondiv" id="allmic_div">
                        <img id="Allmic_btn" style="width: 40px; height: 40px" src="./img/auodio_all.png" alt="">
                        <div style="display: block; text-align: center; color: white; margin-top: 5px">关闭麦克风</div>
                    </div>
                    <%--<div class="icondiv">
                        <img id="AllowRecording_btn" style="width: 40px; height: 40px" src="./img/sf_ic_record.png" alt="">
                        <div style="display: block;text-align: center;color:white;margin-top:5px">允许录制</div>
                    </div>--%>
                    <%--<div class="icondiv">
                        <img id="SetMean" style="width: 40px; height: 40px" src="./img/trtcmeeting_ic_more.png" alt="">
                        <div style="display: block;text-align: center;color:white;margin-top:5px">设置</div>
                    </div>--%>
                    <div class="icondiv" id="clearzjrid_div">
                        <img id="ClearZJRID" style="width: 40px; height: 40px" src="./img/clearzjr.png" alt="">
                        <div style="display: block; text-align: center; color: white; margin-top: 5px">取消主讲人</div>
                    </div>
                </div>
                <div></div>
            </div>
        </div>
        <!--用户列表-->
        <div id="userLB" class="col-div">
            <div class="col-div card" style="width: 100%; height: 100%; background-color: #FAFAFA; color: black;">
                <div style="background-color: #FAFAFA; color: black; height: 40px; font-size: 15px;">成员列表</div>
                <div id="member-list" class="col-div" style="width: 100%; justify-content: flex-start; flex: 1; overflow: auto; background-color: white; color: black; font-size: 16px; padding-top: 10px;">
                    <div id="member-me" style="width: 100%; padding-left: 10px; padding-right: 10px;">
                        <div class="row-div member" style="width: 100%; height: 50px; justify-content: space-between">
                            <text class="member-id" style="font-size: 14px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; width: 40%; color: green;"></text>
                            <div class="row-div" style="width: 60%; height: 26px; justify-content: space-between">
                                <div></div>
                                <div>
                                    <img class="member-video-btn" style="height: 100%" src="./img/camera-on.png" alt="">
                                    <div style="width: 24px; height: 24px; display: inline-block; position: relative; margin-left: 10px;">
                                        <img class="member-audio-btn" style="width: 100%; height: 100%; margin-left: 2px; margin-bottom: 2px;" src="./img/mic-on.png" alt="">
                                        <div class="volume-level" style="position: absolute; bottom: 0; left: 0; width: 28px; height: 0%; overflow: hidden; transition: height .1s ease;">
                                            <img style="position: absolute; bottom: 0;" alt="" src="./img/mic-green.png">
                                        </div>
                                    </div>
                                    <div id="IsZCR" style="display: none;">
                                    </div>
                                    <div id="divZCR" style="display: none;">
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div id="member-me2" style="width: 100%; padding-left: 10px; padding-right: 10px; display: none;">
                        <div class="row-div member" style="width: 100%; height: 50px; justify-content: space-between">
                            <text class="member-id" style="font-size: 14px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; width: 40%;"></text>
                            <div class="row-div" style="width: 60%; height: 26px; justify-content: space-between">
                                <div></div>
                                <div>
                                    <img class="member-video-btn" style="height: 100%" src="./img/camera-on.png" alt="">
                                    <div style="width: 24px; height: 24px; display: inline-block; position: relative; margin-left: 10px;">
                                        <img class="member-audio-btn" style="width: 100%; height: 100%; margin-left: 2px; margin-bottom: 2px;" src="./img/mic-on.png" alt="">
                                        <div class="volume-level" style="position: absolute; bottom: 0; left: 0; width: 28px; height: 0%; overflow: hidden; transition: height .1s ease;">
                                            <img style="position: absolute; bottom: 0;" alt="" src="./img/mic-green.png">
                                        </div>
                                    </div>
                                    <div class="qtdivZCR" style="display: none;">
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <!--设置列表-->
        <div id="SZLB" class="col-div">
            <div class="col-div card" style="width: 100%; height: 100%; background-color: #FAFAFA; color: black;">
            </div>
        </div>
        <!--申请发言列表-->
        <div id="SQFYLB" class="col-div">
            <div class="col-div card" style="width: 100%; height: 100%; background-color: #FAFAFA; color: black;">
                <div style="background-color: #FAFAFA; color: black; height: 40px; font-size: 15px;">申请发言列表</div>
                <div style="display: block; width: 100%; height: 92%; background-color: white; padding-left: 15px; padding-right: 15px;">
                    <div id="sqfyList" style="overflow-y: auto; width: 100%; height: 100%; display: block;">
                    </div>
                </div>
            </div>
        </div>
        <!--消息-->
        <div id="message-box" class="col-div">
            <div class="col-div card" style="width: 100%; height: 100%; background-color: #FAFAFA; color: black;">
                <div style="background-color: #FAFAFA; color: black; height: 40px; font-size: 15px;">消息</div>
                <div style="display: block; width: 100%; height: 92%; background-color: white; padding: 20px;">
                    <div id="getmessList" style="overflow-y: auto; width: 100%; height: 100%; display: block;">
                    </div>
                </div>
            </div>
            <div id="zcrfs_btn" style="height: 55px; background-color: #FAFAFA; justify-content: space-between; padding: 20px; width: 100%;">
                <div>
                    <input id="inputmess" style="width: 280px; height: 30px; border-radius: 5px; margin: 10px;" maxlength="100" />
                </div>
                <button class="fsbtn" id="fsmess_btn">发送</button>
            </div>
        </div>
        <!--声音显示模板-->
        <div id="member-hh" style="display: none;">
            <div class="row-div" style="width: 100%; height: 50px;">
                <div class="row-div" style="height: 26px; justify-content: center">
                    <div style="width: 24px; height: 24px; display: inline-block; position: relative">
                        <img class="member-audio-btn" style="width: 100%; height: 100%; margin-left: 2px; margin-bottom: 0px;" src="./img/mic-on.png" alt="">
                        <div class="volume-level" style="position: absolute; bottom: 0; left: 0; width: 28px; height: 0%; overflow: hidden; transition: height .1s ease;">
                            <img style="position: absolute; bottom: 0;" alt="" src="./img/mic-green.png">
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <!--重加载-->
        <div id="streamReId" class="col-div">
            <div class="col-div card" style="width: 100%; height: 100%; background-color: #FAFAFA; color: black; border-radius: 6px;padding-bottom: 20px;padding-left: 10px;padding-right: 10px;">
                <div style="font-size: 16px; margin-top: 20px;">正在切换主讲人或有新成员加入，请点击“确认”按钮</div>
                <div>
                    <button style="width: 70px; margin-top: 12px; border-radius: 6px; height: 32px; font-size: 16px; background-color: slategrey; color: white;"
                        onclick="StreamReSume()">
                        确认</button>
                </div>
            </div>
        </div>
        <!--当前网络较差-->
        <div id="NetworkNotDetected">
            <div class="col-div card" style="width: 100%; height: 100%; background-color: #FAFAFA; color: black; border-radius: 25px;padding-bottom: 15px;padding-left: 5px;padding-right: 5px;">
                <div style="font-size: 18px; margin-top: 15px;">当前网络较差</div>
            </div>
        </div>
        <!--存放自己的视频用来计算长宽比 -->
        <div id="div_ckb" style="display: none; height: 50%; height: 50%;"></div>
    </div>
    <!-- 展示不支持webRTC的提示 -->
    <div id="remind-info-container" style="justify-content: center; display: none;">
        <!-- 在ios端webview引导用户打开safari浏览器 -->
        <div id="webview-remind" class="webview-remind">
            <img class="webview-remind-img" src="./img/right-top-arrow.png" alt="right-top-arrow">
            <div class="webview-remind-info">
                <span>点击右上角 ··· 图标</span>
                <span style="display: inline-block; margin-top: 10px;">选择在safari浏览器中打开</span>
            </div>
        </div>
        <!-- 提醒用户用可以使用的浏览器打开 -->
        <div id="browser-remind" class="browser-remind">
            <div id="remind-icon" style="width: 100%; font-size: 28px;">
                <svg class="icon" aria-hidden="true">
                    <use xlink:href="#icon-warn"></use>
                </svg>
                <span style="display: inline-block; margin-left: 5px">提示</span>
            </div>
            <div id="remind-info" class="remind-info"></div>
        </div>
        <div style="display: none;">
            <div id="ZCRID">主持人ID</div>
            <button id="SetZJR">设置主讲人</button>
            <button id="SetYX">允许发言</button>
            <div id="sendUserIDforZJR">设置主讲人ID</div>
            <button id="ClickGetUserList">获取用户列表</button>
            <div id="UserIDList">IDLIST</div>
            <div id="UserNameList">NAMELIST</div>
            <button id="OutOne">踢出某人</button>
            <div id="sendUserIDforTC">踢出某人ID</div>
            <div id="sendUserIDforSQFY">申请发言ID</div>
            <div id="sendUserNAMEforSQFY">申请发言NAME</div>
            <button id="SendApplication">申请发言</button>
            <button id="GetApplicationList">获取申请发言列表</button>
            <button id="CloseAllmic">关闭所有人麦克风</button>
            <button id="GetConferenceCache">取缓存</button>
            <button id="SendMess">发送消息</button>
            <button id="SendMessID">接收消息的ID</button>
            <button id="OpenMic">打开/关闭麦克风</button>
            <button id="OpenVideo">打开/关闭摄像头</button>
            <button id="QYBH">区域编号</button>
            <button id="SendCKB">发送长宽比</button>
        </div>
    </div>
    <script src="./js/jquery-3.2.1.min.js"></script>
    <script src="./js/popper.js"></script>
    <script src="./js/bootstrap-material-design.js"></script>
    <script>
        //$(document).ready(function () {
        //    $('body').bootstrapMaterialDesign();
        //});
    </script>
    <script src="./js/lib-generate-test-usersig.min.js"></script>
    <script src="./js/debug/GenerateTestUserSig.js"></script>
    <script src="./js/iconfont.js"></script>
    <script src="./js/trtc.js?v=20220117_01"></script>
    <script src="./js/common.js?v=20211207_49"></script>
    <script src="./js/rtc-client.js?v=20211207_57"></script>
    <script src="./js/share-client.js"></script>
    <script src="./js/presetting.js?v=20211209_02"></script>
    <script src="./js/rtc-detection.js"></script>
    <script src="./js/device-testing.js?v=20211202_16"></script>
    <script src="./js/index.js?v=20211203_06"></script>
    <script src="Scripts/jquery.signalR-2.4.2.min.js"></script>
    <script src="signalr/hubs"></script>
    <script>
        $('body').show();
        //网络状态
        var NetworkStatus = 1;
        var isOneRunTime = true;
        var isKeepLine = true;
        //行数*列数 默认10
        var allCount = 10;
        //行数
        var rowsNumber = 0;
        //列数
        var columnNumber = 0;
        //第一页视频数
        var userlistlength = 0;
        //视频页数
        var userPage = 0;
        //余数页视频数
        var remainderPage = 0;
        //长宽比
        var ckb = 0;
        var ApiUrl = "<%=ApiUrl%>";
        $(function () {
            //右上角退出
            $('#logout-btn').on('click', () => {
                leave();
                if (window.WSLLZWinFrom) {
                    window.history.go(-1);
                } else {
                    if (navigator.userAgent.indexOf("Firefox") != -1 || navigator.userAgent.indexOf("Chrome") != -1) {
                        window.location.href = "about:blank";
                        window.close();
                    } else {
                        window.opener = null;
                        window.open("", "_self");
                        window.close();
                    };
                };
            });

            myload();
        });


        var isLoad = false;
        var isRunTime = false;
        var getChace = false;
        function indexload() {
            //提供方法给服务端调用
            var chat = $.connection.chatHub;
            chat.client.broadcastMessage = function (message, channelss) {
                if (channelss == $("#roomId").val()) {
                    var mess = JSON.parse(message);
                    switch (mess.reCode) {
                        //设置主讲人
                        case '01':
                        case '20':
                            rtc.changeFBL(mess.ReUserid, $('#sendUserIDforZJR').val());
                            $('#sendUserIDforZJR').val(mess.ReUserid);
                            rtc.SetUserForZJR(mess.ReUserid);
                            break;
                        //获取用户列表
                        case '14':
                            UserList = mess.Data.UserList.sort(sortData);
                            break;
                        //踢出用户
                        case '07':
                            if (mess.ReUserid == $('#userId').val()) {
                                leave();
                                if (window.WSLLZWinFrom) {
                                    window.history.go(-1);
                                } else {
                                    if (navigator.userAgent.indexOf("Firefox") != -1 || navigator.userAgent.indexOf("Chrome") != -1) {
                                        window.location.href = "about:blank";
                                        window.close();
                                    } else {
                                        window.opener = null;
                                        window.open("", "_self");
                                        window.close();
                                    };
                                };
                            }
                            break;
                        //关闭所有人麦克风
                        case '03':
                            if ($('#sendUserIDforZJR').val() == $('#userId').val() || $('#IsZCR').val()) {

                            } else {
                                isMicOn = true;
                                $('#mic-btn').click();
                            }
                            break;
                        //获取会议缓存信息
                        case '12':
                            if (mess.ReUserid == '') {
                                location.reload();
                            } else if (!getChace && mess.ReUserid == $('#userId').val()) {
                                getChace = true;
                                $('#hyTitle').html(mess.Data.VideoConferenceMess.Title);
                                if (mess.Data.VideoConferenceMess.AllowProposer == '1' && $('#IsZCR').val() == false) {
                                    $("#sqfy_div").show();
                                } else {
                                    $("#sqfy_div").hide();
                                }
                                $("#sendUserIDforZJR").val(mess.Data.VideoConferenceMess.SpeakerID);
                                //没设置行列时默认count为10
                                rowsNumber = mess.Data.VideoConferenceMess.CHRY_ShowRows;
                                columnNumber = mess.Data.VideoConferenceMess.CHRY_ShowCols;
                                if (rowsNumber != 0 && columnNumber != 0) {
                                    allCount = rowsNumber * columnNumber;
                                    $("#video-grid").css('width', '20%');
                                    $("#video-grid").css('grid-template-columns', 'repeat(' + columnNumber + ', 1fr)');
                                    var bfb = 100 / rowsNumber;
                                    $("#video-grid").css('grid-template-rows', 'repeat(' + rowsNumber + ', ' + bfb + '%)');
                                };
                                //绑定用户列表
                                UserList = mess.Data.VideoConferenceMess.UserList.sort(sortData);
                                //第一页视频数
                                userlistlength = UserList.length >= allCount ? allCount : UserList.length;
                                //余数页视频数
                                remainderPage = UserList.length % allCount;
                                //视频页数
                                userPage = parseInt(UserList.length / allCount) < 1 ? 1 : (remainderPage > 0 ? (parseInt(UserList.length / allCount) + 1) : parseInt(UserList.length / allCount));
                                for (var i = 0; i < mess.Data.VideoConferenceMess.UserList.length; i++) {
                                    //获取主持人ID
                                    if (mess.Data.VideoConferenceMess.UserList[i].IsZCR == '1') {
                                        $('#ZCRID').val(mess.Data.VideoConferenceMess.UserList[i].ID);
                                    };
                                    if (mess.Data.VideoConferenceMess.UserList[i].ID == $('#userId').val()) {
                                        $('#QYBH').val(mess.Data.VideoConferenceMess.UserList[i].UserQYBH);
                                        if (isOneRunTime) {
                                            isOneRunTime = false;
                                            setInterval(function () {
                                                setTimeout(function () {
                                                    $("#QYBH").click();
                                                }, 0);
                                            }, 1000);
                                        }
                                    };
                                };
                                isShowMean = true;
                                $('#bottom_mean').show();
                                //自动取缓存
                                setTimeout(function () {
                                    GetConferenceCacheAjax();
                                }, 8000);
                            };
                            break;
                        //获取消息 指定接收用户
                        case '09':
                            if (mess.ReUserid == $('#userId').val()) {
                                var t = new Date();
                                var year = t.getFullYear();
                                var month = t.getMonth();
                                var day = t.getDate();
                                var hour = t.getHours();
                                var minute = t.getMinutes();
                                var second = t.getSeconds();
                                var showTime = year + "-" + month + "-" + day + " " + hour + ":" + minute + ":" + second;
                                var str = '<div class="messsj"><div>' + showTime + '</div></div>';
                                str += '<div style="padding-right: 10px;">';
                                str += '<div class="iconmessdiv"><img style="width: 40px; height: 40px" src="./img/tx.png" alt="">';
                                str += '<div class="message-user" title="' + mess.SendUserName + '">' + mess.SendUserName + '</div></div>';
                                str += '<div class="message-nr">' + mess.Content + '</div>';
                                str += '</div>';
                                $('#getmessList').append(str);
                                $('#getmessList').scrollTop(99999999999);
                            } else if (mess.SendUserID == $('#userId').val()) {
                                var t = new Date();
                                var year = t.getFullYear();
                                var month = t.getMonth();
                                var day = t.getDate();
                                var hour = t.getHours();
                                var minute = t.getMinutes();
                                var second = t.getSeconds();
                                var showTime = year + "-" + month + "-" + day + " " + hour + ":" + minute + ":" + second;
                                var str = '<div class="messsj"><div>' + showTime + '</div></div>';
                                str += '<div style="justify-content: flex-end;padding-right: 10px;">';
                                str += '<div class="message-nr2">' + mess.Content + '</div>';
                                str += '<div class="iconmessdiv"><img style="width: 40px; height: 40px" src="./img/tx.png" alt="">';
                                str += '<div class="message-user" title="' + mess.SendUserName + '">' + mess.SendUserName + '</div></div>';
                                str += '</div>';
                                $('#getmessList').append(str);
                                $('#getmessList').scrollTop(99999999999);
                            }
                            break;
                        //获取消息 所有人接收
                        case '08':
                            var t = new Date();
                            var year = t.getFullYear();
                            var month = t.getMonth();
                            var day = t.getDate();
                            var hour = t.getHours();
                            var minute = t.getMinutes();
                            var second = t.getSeconds();
                            var showTime = year + "-" + month + "-" + day + " " + hour + ":" + minute + ":" + second;
                            var str = '<div class="messsj"><div>' + showTime + '</div></div>';
                            if (mess.SendUserID == $('#userId').val()) {
                                str += '<div style="justify-content: flex-end;padding-right: 10px;">';
                                str += '<div class="message-nr2">' + mess.Content + '</div>';
                                str += '<div class="iconmessdiv"><img style="width: 40px; height: 40px" src="./img/tx.png" alt="">';
                                str += '<div class="message-user" title="' + mess.SendUserName + '">' + mess.SendUserName + '</div></div>';
                                str += '</div>';
                            } else {
                                str += '<div style="padding-right: 10px;">';
                                str += '<div class="iconmessdiv"><img style="width: 40px; height: 40px" src="./img/tx.png" alt="">';
                                str += '<div class="message-user" title="' + mess.SendUserName + '">' + mess.SendUserName + '</div></div>';
                                str += '<div class="message-nr">' + mess.Content + '</div>';
                                str += '</div>';
                            }
                            $('#getmessList').append(str);
                            $('#getmessList').scrollTop(99999999999);
                            break;
                        //获取申请发言列表
                        case '19':
                            //var str = '';
                            //for (var i = 0; i < mess.Data.ProposerList.length; i++) {
                            //    str += '<div class="sqfylb_div">';
                            //    str += '<div style="width:200px;"><div class="message-user" title="' + mess.Data.ProposerList[i].ProposerName + '">' + mess.Data.ProposerList[i].ProposerName+'</div></div>';
                            //    str += '<div>';
                            //    str += '<button onclick="YX_btn(' + mess.Data.ProposerList[i].ProposerID+')" class="sqfylb_yx_btn">允许发言</button>';
                            //    /*str += '<button onclick="GB_btn()" class="sqfylb_gb_btn">关闭</button>';*/
                            //    str += '</div>';
                            //    str += '</div><div style="width: 98%;background-color: #999; height: 1px;"></div>';
                            //}
                            //if (str == '') {
                            //    $('#sqfyList').append('<div>暂无数据</div>');
                            //} else {
                            //    $('#sqfyList').append(str);
                            //    $('#sqfyList').scrollTop(99999999999);
                            //}
                            break;
                        //获取申请发言
                        case '10':
                            if ($('#sq_' + mess.SendUserID).val() == undefined) {
                                var str = '';
                                str += '<div id="sq_' + mess.SendUserID + '" style="display:block;">';
                                str += '<div class="sqfylb_div">';
                                str += '<div style="width:200px;"><div class="message-user" title="' + mess.SendUserName + '">' + mess.SendUserName + '</div></div>';
                                str += '<div>';
                                str += '<button onclick="YX_btn(^' + mess.SendUserID + '&)" class="sqfylb_yx_btn">允许发言</button>';
                                str = str.replace("^", "'");
                                str = str.replace("&", "'");
                                str += '<button onclick="GB_btn(^' + mess.SendUserID + '&)" class="sqfylb_gb_btn">关闭</button>';
                                str = str.replace("^", "'");
                                str = str.replace("&", "'");
                                str += '</div>';
                                str += '</div><div style="width: 98%;background-color: #999; height: 1px;"></div>';
                                str += '</div>';
                                $('#sqfyList').append(str);
                                $('#sqfyList').scrollTop(99999999999);
                            }
                            break;
                        //打开关闭摄像头
                        case '22':
                            if (mess.ReUserid == $('#userId').val()) {
                                isCamOn = true;
                                if (mess.Data.State == '1') {
                                    isCamOn = false;
                                }
                                $('#video-btn').click();
                            }
                            break;
                        //打开关闭麦克风
                        case '23':
                            if (mess.ReUserid == $('#userId').val()) {
                                isMicOn = true;
                                if (mess.Data.State == '1') {
                                    isMicOn = false;
                                }
                                $("#mic-btn").click();
                            }
                            break;
                        //允许发言
                        case '18':
                            if (mess.Data.State == '1' && $('#IsZCR').val() == false) {
                                $("#sqfy_div").show();
                            } else {
                                $("#sqfy_div").hide();
                            }
                            break;
                        //踢出所有用户
                        case '28':
                            leave();
                            window.close();
                            break;
                        //取消主讲人
                        case '29':
                            rtc.changeFBL('', $('#sendUserIDforZJR').val());
                            //将主讲人移动到小视频
                            if ($("#sendUserIDforZJR").val() != '') {
                                var smallid = GetStreamDiv($("#sendUserIDforZJR").val());
                                if (smallid != 'no') {
                                    rtc.PlayTheStream(smallid, $("#sendUserIDforZJR").val());
                                } else {
                                    rtc.StopPlayStream($("#sendUserIDforZJR").val());
                                };
                            };
                            $('#showMain').val('');
                            $("#sendUserIDforZJR").val('');
                            BDuser(0, userlistlength);
                            ChangeZJRxx($('#userId').val());
                            rtc.PlayTheStream('main-video', $('#userId').val());
                            break;
                    };
                }
            };
            //断开后处理
            $.connection.hub.disconnected(function () {
                setTimeout(function () {
                    console.log("断开尝试重新连接！");
                    $.connection.hub.start();
                }, 3000); //3秒后重新连接. 
            });
            //调用服务端方法
            $.connection.hub.start().done(function () {
                var roomId = $("#roomId").val();
                chat.server.createRedis(roomId);
                //设置主讲人
                $("#SetZJR").click(function () {
                    var SendUserID_ = $("#sendUserIDforZJR").val();
                    var userobj = getUserObjByID(SendUserID_);
                    var data1 = {
                        reCode: '01',
                        ReUserid: SendUserID_,
                        ReUserQYBH: '',
                        ReUserName: userobj.UserName,
                        SendUserID: $('#userId').val(),
                        SendUserName: $('#member-me').find('.member-id').text(),
                        Content: "",
                        Data: {}
                    }
                    var jsonStr = JSON.stringify(data1);
                    chat.server.redisFB(roomId, jsonStr);
                });
                //允许发言
                $("#SetYX").click(function () {
                    var SendUserID_ = $("#sendUserIDforZJR").val();
                    var data1 = {
                        reCode: '18',
                        ReUserid: SendUserID_,
                        ReUserQYBH: '',
                        ReUserName: '',
                        SendUserID: $('#userId').val(),
                        SendUserName: $('#member-me').find('.member-id').text(),
                        Content: "",
                        Data: {
                            State: 1
                        }
                    }
                    var jsonStr = JSON.stringify(data1);
                    chat.server.redisFB(roomId, jsonStr);
                    $('#sq_' + SendUserID_).remove();
                });
                //发送长宽比 
                $("#SendCKB").click(function () {
                    var data1 = {
                        reCode: '30',
                        ReUserid: '',
                        ReUserQYBH: '',
                        ReUserName: '',
                        SendUserID: $('#userId').val(),
                        SendUserName: $('#member-me').find('.member-id').text(),
                        Content: "",
                        Data: {
                            AspectRatio: ckb
                        }
                    }
                    var jsonStr = JSON.stringify(data1);
                    chat.server.redisFB(roomId, jsonStr);
                });
                //获取用户列表
                $("#ClickGetUserList").click(function () {
                    var data1 = {
                        reCode: '13',
                        ReUserid: '',
                        ReUserQYBH: '',
                        ReUserName: '',
                        SendUserID: "",
                        SendUserName: "",
                        Content: "",
                        Data: {}
                    }
                    var jsonStr = JSON.stringify(data1);
                    chat.server.redisFB(roomId, jsonStr);
                });
                //踢出某人
                $("#OutOne").click(function () {
                    var SendUserID_ = $("#sendUserIDforTC").val();
                    var data1 = {
                        reCode: '07',
                        ReUserid: SendUserID_,
                        ReUserQYBH: '',
                        ReUserName: '',
                        SendUserID: $('#userId').val(),
                        SendUserName: $('#member-me').find('.member-id').text(),
                        Content: "",
                        Data: {}
                    }
                    var jsonStr = JSON.stringify(data1);
                    chat.server.redisFB(roomId, jsonStr);
                });
                //申请发言
                $("#SendApplication").click(function () {
                    var SendUserID_ = $("#sendUserIDforSQFY").val();
                    var data1 = {
                        reCode: '10',
                        ReUserid: SendUserID_,
                        ReUserQYBH: '',
                        ReUserName: '',
                        SendUserID: SendUserID_,
                        SendUserName: $("#sendUserNAMEforSQFY").val(),
                        Content: "",
                        Data: {}
                    }
                    var jsonStr = JSON.stringify(data1);
                    chat.server.redisFB(roomId, jsonStr);
                });
                //取消主讲人
                $("#ClearZJRID").click(function () {
                    var data1 = {
                        reCode: '29',
                        ReUserid: '',
                        ReUserQYBH: '',
                        ReUserName: '',
                        SendUserID: $('#userId').val(),
                        SendUserName: $('#member-me').find('.member-id').text(),
                        Content: "",
                        Data: {}
                    }
                    var jsonStr = JSON.stringify(data1);
                    chat.server.redisFB(roomId, jsonStr);
                });
                //获取申请发言列表
                $("#GetApplicationList").click(function () {
                    var data1 = {
                        reCode: '19',
                        ReUserid: '',
                        ReUserQYBH: '',
                        ReUserName: '',
                        SendUserID: $('#userId').val(),
                        SendUserName: $('#member-me').find('.member-id').text(),
                        Content: "",
                        Data: {}
                    }
                    var jsonStr = JSON.stringify(data1);
                    chat.server.redisFB(roomId, jsonStr);
                });
                //关闭所有人麦克风 
                $("#CloseAllmic").click(function () {
                    var data1 = {
                        reCode: '03',
                        ReUserid: '',
                        ReUserQYBH: '',
                        ReUserName: '',
                        SendUserID: $('#userId').val(),
                        SendUserName: $('#member-me').find('.member-id').text(),
                        Content: "",
                        Data: {}
                    }
                    var jsonStr = JSON.stringify(data1);
                    chat.server.redisFB(roomId, jsonStr);
                });
                //取会议缓存 
                $("#GetConferenceCache").click(function () {
                    var data1 = {
                        reCode: '11',
                        ReUserid: '',
                        ReUserQYBH: '',
                        ReUserName: '',
                        SendUserID: $('#userId').val(),
                        SendUserName: $('#member-me').find('.member-id').text(),
                        Content: "",
                        Data: {}
                    }
                    var jsonStr = JSON.stringify(data1);
                    chat.server.redisFB(roomId, jsonStr);
                });
                //打开/关闭麦克风
                $("#OpenMic").click(function () {
                    var state = '0';
                    if (isMicOn) {
                        state = '1';
                    }
                    var data1 = {
                        reCode: '06',
                        ReUserid: $('#userId').val(),
                        ReUserQYBH: '',
                        ReUserName: $('#member-me').find('.member-id').text(),
                        SendUserID: $('#userId').val(),
                        SendUserName: $('#member-me').find('.member-id').text(),
                        Content: "",
                        Data: {
                            State: state,
                        }
                    }
                    var jsonStr = JSON.stringify(data1);
                    chat.server.redisFB(roomId, jsonStr);
                });
                //打开/关闭摄像头
                $("#OpenVideo").click(function () {
                    var state = '0';
                    if (isCamOn) {
                        state = '1';
                    }
                    var data1 = {
                        reCode: '05',
                        ReUserid: $('#userId').val(),
                        ReUserQYBH: '',
                        ReUserName: $('#member-me').find('.member-id').text(),
                        SendUserID: $('#userId').val(),
                        SendUserName: $('#member-me').find('.member-id').text(),
                        Content: "",
                        Data: {
                            State: state,
                        }
                    }
                    var jsonStr = JSON.stringify(data1);
                    chat.server.redisFB(roomId, jsonStr);
                });
                //发送消息
                $("#SendMess").click(function () {
                    var data1 = {
                        reCode: '09',
                        ReUserid: $("#SendMessID").val(),
                        ReUserQYBH: '',
                        ReUserName: '',
                        SendUserID: $('#userId').val(),
                        SendUserName: $('#member-me').find('.member-id').text(),
                        Content: $("#inputmess").val(),
                        Data: {}
                    }
                    if ($("#SendMessID").val() == "") {
                        data1 = {
                            reCode: '08',
                            ReUserid: '',
                            ReUserQYBH: '',
                            ReUserName: '',
                            SendUserID: $('#userId').val(),
                            SendUserName: $('#member-me').find('.member-id').text(),
                            Content: $("#inputmess").val(),
                            Data: {}
                        }
                    }
                    if (!($('#IsZCR').val())) {
                        data1 = {
                            reCode: '09',
                            ReUserid: $('#ZCRID').val(),
                            ReUserQYBH: '',
                            ReUserName: '',
                            SendUserID: $('#userId').val(),
                            SendUserName: $('#member-me').find('.member-id').text(),
                            Content: $("#inputmess").val(),
                            Data: {}
                        }
                    }
                    var jsonStr = JSON.stringify(data1);
                    chat.server.redisFB(roomId, jsonStr);
                    $("#inputmess").val("");
                });
                //心跳
                $("#QYBH").click(function () {
                    if (!isRunTime) {
                        isRunTime = true;
                        LoadVideo();
                    }
                    var videostate = '0';
                    var micstate = '0';
                    if (isCamOn) {
                        videostate = '1';
                    }
                    if (isMicOn) {
                        micstate = '1';
                    }
                    var state = '0';
                    var data1 = {
                        reCode: '25',
                        ReUserid: $('#userId').val(),
                        ReUserQYBH: $("#QYBH").val(),
                        ReUserName: $('#member-me').find('.member-id').text(),
                        SendUserID: $('#userId').val(),
                        SendUserName: $('#member-me').find('.member-id').text(),
                        Content: "",
                        Data: {
                            State: state,
                            CameraState: videostate,
                            MicState: micstate,
                        }
                    }
                    var jsonStr = JSON.stringify(data1);
                    chat.server.redisFB(roomId, jsonStr);
                });
                setTimeout(function () {
                    $("#GetConferenceCache").click();
                }, 2000);
            }).fail(function (reason) {
                alert("SignalR connection failed: " + reason);
            });
        }
        //对象排序
        function sortData(a, b) {
            undefined
            return a.XUHAO - b.XUHAO
        }
        function LoadVideo() {
            if (!isLoad) {
                if (isRunTime && getChace) {
                    isLoad = true;
                    Runrtc();
                    setBtnClickFuc();
                }
            }
        }
        //检测设备
        function showDevice() {
            startDeviceConnect();
        }
        //关闭检测页面
        function GBtest() {
            $('#device-testing-root').hide();
        }
        //重新加载
        function StreamReSume() {
            $("#streamReId").hide();
            rtc.resumeStreams();
        }
        //重复获取主讲人ID
        function GetConferenceCacheAjax() {
            MyAjax('/Handler/RedisHandler.ashx', function (res) {
                if (res != $('#sendUserIDforZJR').val() && res != '' && $('#sendUserIDforZJR').val() != '') {
                    $('#sendUserIDforZJR').val(res);
                    rtc.changeFBL(res, $('#sendUserIDforZJR').val());
                    rtc.SetUserForZJR(res);
                }
                setTimeout(function () {
                    GetConferenceCacheAjax();
                }, 8000);
            }, { "Infotype": "GetInfo", "RoomId": $("#roomId").val() }, 'post', false, false, function () {
                setTimeout(function () {
                    GetConferenceCacheAjax();
                }, 8000);
            });
        };
        //隐藏当前网络提醒
        function hideNetworkNotDetected() {
            $('#NetworkNotDetected').hide();
        }
    </script>
</body>
</html>
