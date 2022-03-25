﻿<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="index.aspx.cs" Inherits="VideoConnectionWeb.TestItem" %>
  <!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="pragma" content="no-cache" />
    <meta http-equiv="content-type" content="no-cache, must-revalidate" />
    <meta http-equiv="expires" content="Wed, 26 Feb 1997 08:21:57 GMT" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1.0,maximum-scale=1.0,minimum-scale=1.0,user-scalable=no"
    />
    <title>视频连线</title>
    <link rel="stylesheet" href="./lib/colorui/main.css" />
    <link rel="stylesheet" href="./lib/hover.css" />
    <link rel="stylesheet" href="./lib/layui/css/layui.css" />
    <link rel="stylesheet" href="./css/index.css" />
    <link
      rel="stylesheet"
      href="./lib/bootstrap/bootstrap-material-design.min.css"
    />
    <script src="./lib/tailwindcss/tailwindcss-3.0.18.min.js"></script>
    <script>
        const baseUrl = "<%=ApiBaseUrl%>";

        // 网络是否断开
        let isDisconnect = false;

        let vConsole = null;

        function queryParams(name) {
            const match = window.location.search.match(
                new RegExp("(\\?|&)" + name + "=([^&]*)(&|$)")
            );
            return !match ? "" : decodeURIComponent(match[2]);
        }

        // 清除缓存
        if (!queryParams("t")) {
            location.replace(
                location.href +
                (location.href.includes("?") ? "&" : "?") +
                "t=" +
                Math.random()
            );
        }

        // 重写日志输出对象，限制输出内容
        window.oldLog = console.log;
        console.log = (e) => {
            try {
                if (JSON.stringify(e)?.includes("<INFO>")) return;
            } catch (error) { }
            window.oldLog(e);
        };

        window.oldWarn = console.warn;
        console.warn = (e) => {
            try {
                // 网络断开后trtc SDK会输出这句，所以可以断定为网络断开
                if (
                    JSON.stringify(e)?.includes("close current websocket and schedule")
                ) {
                    layer.msg("当前网络已断开", { icon: 5 });
                    isDisconnect = true;
                }
                if (JSON.stringify(e)?.includes("reconnect successfully")) {
                    isDisconnect = false;
                }
            } catch (error) { }
            window.oldWarn(e);
        };
    </script>
  </head>
  <body class="w-screen h-screen">
    <section class="h-[92%]">
      <!-- 内容区 -->
      <div id="video-grid" class="box-border">
        <div class="relative">
          <div id="main-video" class="w-full h-full video-box relative"></div>

          <!-- “摄像头未开启”遮罩 -->
          <div
            id="mask_main"
            style="z-index: 8"
            class="mask top-0 left-0 justify-center col-div bg-[#d8d8d8] flex w-full h-full items-center justify-items-center absolute flex-col"
          >
            <img class="h-[30%]" src="./img/camera-gray.png" alt="" />
            <!-- <div class="text-[#8b8b8b] mt-2">摄像头未打开</div> -->
          </div>
        </div>
      </div>

      <!-- 展示不支持webRTC的提示 -->
      <div
        id="remind-info-container"
        style="justify-content: center; display: none"
      >
        <!-- 在ios端webview引导用户打开safari浏览器 -->
        <div id="webview-remind" class="webview-remind">
          <img
            class="webview-remind-img"
            src="./img/right-top-arrow.png"
            alt="right-top-arrow"
          />
          <div class="webview-remind-info">
            <span>点击右上角 ··· 图标</span>
            <span style="display: inline-block; margin-top: 10px"
              >选择在safari浏览器中打开</span
            >
          </div>
        </div>
        <!-- 提醒用户用可以使用的浏览器打开 -->
        <div id="browser-remind" class="browser-remind">
          <div id="remind-icon" style="width: 100%; font-size: 28px">
            <svg class="icon" aria-hidden="true">
              <use xlink:href="#icon-warn"></use>
            </svg>
            <span style="display: inline-block; margin-left: 5px">提示</span>
          </div>
          <div id="remind-info" class="remind-info"></div>
        </div>
      </div>

      <div id="device-testing-root" style="display: none">
        <!-- 设备检测卡片 -->
        <div class="device-testing-card">
          <!-- 设备检测准备界面 -->
          <div id="device-testing-prepare" class="device-testing-prepare">
            <div class="testing-title">设备连接</div>
            <div class="testing-prepare-info">
              设备检测前请务必给当前页面开放摄像头，麦克风权限哦~
            </div>
            <div class="device-display flex">
              <div
                id="device-camera"
                class="device icon-normal connect-success"
              >
                <svg class="icon" aria-hidden="true">
                  <use xlink:href="#icon-cameraIcon"></use>
                </svg>
              </div>
              <div id="device-voice" class="device icon-normal connect-success">
                <svg class="icon" aria-hidden="true">
                  <use xlink:href="#icon-voice"></use>
                </svg>
              </div>
              <div id="device-mic" class="device icon-normal connect-success">
                <svg class="icon" aria-hidden="true">
                  <use xlink:href="#icon-microphone"></use>
                </svg>
              </div>
              <div
                id="device-network"
                class="device icon-normal connect-success"
              >
                <svg class="icon" aria-hidden="true">
                  <use xlink:href="#icon-network"></use>
                </svg>
              </div>
            </div>
            <div
              id="device-loading"
              class="loading-background"
              style="display: none"
            >
              <div class="device-loading"></div>
            </div>
            <!-- 连接结果提示 -->
            <div class="connect-info">
              <!-- 连接结果 -->
              <div id="connect-info" style="color: rgb(50, 205, 50)">
                设备及网络连接成功，请开始设备检测
              </div>
              <!-- 错误icon及错误解决指引 -->
              <div
                id="connect-attention-container"
                class="connect-attention-container"
                style="display: none"
              >
                <div id="connect-attention-icon" class="connect-attention-icon">
                  <svg class="icon" aria-hidden="true">
                    <use xlink:href="#icon-warn"></use>
                  </svg>
                </div>
                <div
                  id="connect-attention-info"
                  class="connect-attention-info"
                  style="display: none"
                ></div>
              </div>
            </div>
            <!-- 设备连接页面button -->
            <div class="testing-btn-display flex">
              <div id="start-test-btn" class="test-btn start-test">
                开始检测
              </div>
              <div
                id="start-test-btn-tc"
                class="test-btn start-test"
                style="margin-left: 15px"
              >
                关闭
              </div>
              <div
                id="connect-again-btn"
                class="test-btn connect-again"
                style="display: none; margin-left: 15px"
              >
                重新连接
              </div>
            </div>
          </div>
          <!-- 设备检测tab页 -->
          <div id="device-testing" class="device-testing" style="display: none">
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
            <div
              id="camera-testing-body"
              class="testing-body"
              style="display: none"
            >
              <div class="device-list camera-device-list flex">
                <div class="select-title" style="display: block">
                  摄像头选择
                </div>
                <div class="select-list" style="display: block">
                  <select
                    name="select"
                    id="camera-select"
                    class="device-select"
                  ></select>
                </div>
              </div>
              <div id="camera-video" class="camera-video"></div>
              <div class="testing-info-container">
                <div class="testing-info">是否可以清楚的看到自己？</div>
                <div class="button-list flex">
                  <div id="camera-fail" class="fail-button">看不到</div>
                  <div id="camera-success" class="success-button">可以看到</div>
                </div>
              </div>
            </div>
            <!-- 设备检测-播放器检测 -->
            <div
              id="voice-testing-body"
              class="testing-body"
              style="display: none"
            >
              <div class="device-list camera-device-list flex">
                <div class="select-title" style="display: block">
                  扬声器选择
                </div>
                <div class="select-list" style="display: block">
                  <select
                    name="select"
                    id="voice-select"
                    class="device-select"
                  ></select>
                </div>
              </div>
              <div class="audio-control">
                <div class="audio-control-info">
                  请调高设备音量, 点击播放下面的音频试试～
                </div>
                <audio
                  id="audio-player"
                  src="https://web.sdk.qcloud.com/trtc/webrtc/assets/bgm-test.mp3"
                  controls=""
                ></audio>
              </div>
              <div class="testing-info-container">
                <div class="testing-info">是否可以听到声音？</div>
                <div class="button-list flex">
                  <div id="voice-fail" class="fail-button">听不到</div>
                  <div id="voice-success" class="success-button">可以听到</div>
                </div>
              </div>
            </div>
            <!-- 设备检测-麦克风检测 -->
            <div
              id="mic-testing-body"
              class="testing-body"
              style="display: none"
            >
              <div class="device-list camera-device-list">
                <div class="select-title" style="display: block">
                  麦克风选择
                </div>
                <div class="select-list" style="display: block">
                  <select
                    name="select"
                    id="mic-select"
                    class="device-select"
                  ></select>
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
            <div
              id="network-testing-body"
              class="testing-body"
              style="display: none"
            >
              <div class="testing-index-list">
                <div class="testing-index-group">
                  <div class="testing-index">操作系统</div>
                  <div id="system"></div>
                </div>
                <div class="testing-index-group">
                  <div class="testing-index">浏览器版本</div>
                  <div id="browser"></div>
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
              </div>
              <div class="testing-footer">
                <!-- <div id="testing-report-btn" class="test-btn">查看检测报告</div> -->
                <div id="testing-close-btn" class="test-btn">关闭检测</div>
              </div>
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

      <!-- 预加载所有网络图片资源，防止断网后加载不出断网图标图片 -->
      <div style="visibility: hidden">
        <img src="./img/network/network_0.png" alt="" />
        <img src="./img/network/network_1.png" alt="" />
        <img src="./img/network/network_2.png" alt="" />
        <img src="./img/network/network_3.png" alt="" />
        <img src="./img/network/network_4.png" alt="" />
        <img src="./img/network/network_5.png" alt="" />
        <img src="./img/network/network_6.png" alt="" />
        <img src="./img/mic-on.png" alt="" />
        <img src="./img/mic-off.png" alt="" />
      </div>
    </section>
    <footer
      class="h-[8%] drop-shadow-md bg-[#242424] flex items-center justify-center"
    >
      <div
        id="toolbar"
        class="h-full w-full xl:w-[15%] flex text-center text-white items-center justify-center"
      >
        <div
          class="h-[85%] flex-1 flex flex-col items-center justify-center"
          id="mic-btn"
        >
          <svg class="icon text-[30px] text-white" aria-hidden="true">
            <use xlink:href="#icon-maikefeng"></use>
          </svg>
          <span class="mt-1 text-[13px]">静音</span>
        </div>
        <div
          class="h-[85%] flex-1 flex flex-col items-center justify-center"
          id="video-btn"
        >
          <svg class="icon text-[30px] text-white" aria-hidden="true">
            <use xlink:href="#icon-xiangji"></use>
          </svg>
          <span class="mt-1 text-[13px]">摄像头</span>
        </div>
        <div
          class="h-[85%] flex-1 flex flex-col items-center justify-center"
          id="camera-fz"
        >
          <svg class="icon text-[30px] text-white" aria-hidden="true">
            <use xlink:href="#icon-fanzhuan"></use>
          </svg>
          <span class="mt-1 text-[13px]">翻转</span>
        </div>
        <!-- <div class="h-[85%] flex-1 flex flex-col items-center justify-center" id="userListHander">
          <i class="layui-icon layui-icon-group text-[2rem]"></i>
          <span class="mt-1 text-[13px]">成员</span>
        </div> -->
        <div
          class="h-[85%] flex-1 flex flex-col items-center justify-center"
          id="setting"
        >
          <svg class="icon text-[30px] text-white" aria-hidden="true">
            <use xlink:href="#icon-shezhi"></use>
          </svg>
          <span class="mt-1 text-[13px]">设置</span>
        </div>
        <div
          class="h-[85%] flex-1 flex flex-col items-center justify-center"
          id="exit-btn"
        >
          <svg class="icon text-[30px] text-white" aria-hidden="true">
            <use xlink:href="#icon-tuichu"></use>
          </svg>
          <span class="mt-1 text-[13px]">退出</span>
        </div>
      </div>
    </footer>

    <script src="https://cdn.staticfile.org/vConsole/3.9.5/vconsole.min.js"></script>
    <script>
        if (queryParams("v")) {
            vConsole = new window.VConsole();
        }
    </script>
    <script src="./js/import.js"></script>
    <script>
        const loadIndex = layer.load(1);

        window.WeixinJSBridge && window.WeixinJSBridge.call("hideToolbar");

        if (queryParams("p")) {
            login(queryParams("p"));
        } else {
            alert("参数错误");
            leave();
        }

        $("#mask_main").hide();
    </script>
  </body>
</html>
