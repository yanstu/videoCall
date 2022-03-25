<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="big.aspx.cs" Inherits="VideoConnectionWeb.TestItem" %>
  <!DOCTYPE html>
  <html lang="en">

  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="pragma" content="no-cache" />
    <meta http-equiv="content-type" content="no-cache, must-revalidate" />
    <meta http-equiv="expires" content="Wed, 26 Feb 1997 08:21:57 GMT" />
    <meta name="viewport"
      content="width=device-width, initial-scale=1.0,maximum-scale=1.0,minimum-scale=1.0,user-scalable=no" />
    <title>视频连线</title>
    <link rel="stylesheet" href="./lib/layui/css/layui.css" />
    <link rel="stylesheet" href="./css/index.css" />
    <link rel="stylesheet" href="./css/common.css" />
    <script src="./js/onload.js"></script>
    <script src="./js/api.js"></script>
    <style>
      #video-grid>div {
        height: 95%;
        width: 97%;
        box-shadow: 0 2px 5px 0 rgb(0 0 0 / 20%), 0 2px 10px 0 rgb(0 0 0 / 10%);
      }
    </style>
    <script>
      const apiBaseUrl = "<%=ApiBaseUrl%>";
      const hubBaseUrl = "<%=HubBaseUrl%>";
      const hubsUrl = hubBaseUrl + "chatHub";
    </script>
  </head>

  <body class="w-screen h-screen">
    <header class="flex flex-row h-[7%] bg-[#262626] w-full justify-between">
      <div class="flex items-center justify-start">
        <img id="testing_btn" title="设备、网络检测" class="hover:invert-[50%] h-[50%] ml-4" src="./img/check-mic.png" />
      </div>
      <div id="roomTitle" class="text-[1.8rem] text-white flex items-center justify-center whitespace-nowrap">

      </div>
      <div class="flex items-center justify-end">
        <div style="width: 2rem;" class="flex items-center justify-content-center relative h-[50%] mr-4">
          <img id="network-up" class="h-full" src="./img/network/up/network_4.png">
        </div>
        <div style="width: 2rem;" class="flex items-center justify-content-center relative h-[50%] mr-4">
          <img id="network-down" class="h-full" src="./img/network/down/network_4.png">
        </div>
        <div id="exit-btn"
          class="anniubeijing mr-4 w-[5rem] h-[50%] text-[0.875rem] flex justify-center items-center text-white pl-3 pr-3">
          退出
        </div>
      </div>
    </header>
    <section class="h-[93%] flex flex-row w-full bg-[#24292e] relative">

      <!-- 主讲人区 -->
      <div id="zjr_box" class="w-full h-full relative border-none">
        <!-- 视频模板 -->
        <div id="zjr_video" class="w-full h-full video-box relative">
          <!-- “摄像头未开启”遮罩模板 -->
          <div id="zjr_mask" style="z-index: 8"
            class="mask top-0 left-0 justify-center col-div flex w-full h-full bg-[#24292e] items-center justify-items-center absolute flex-col">

            <img class="h-[40%]" src="./img/camera-gray.png" alt="" />
          </div>
          <img id="zjr_img" style="display: none;z-index: 9;" class="w-full h-full" src="" alt="">
        </div>
      </div>
      </div>

      <!-- 群众区 -->
      <div id="video-grid" style="height: 99.2%;top: 0.38%;"
        class="box-border grid w-[20%] h-[92.35%] absolute bottom-[0.35%] right-[0.1%] items-center justify-center z-10">
      </div>

      <!-- 展示不支持webRTC的提示 -->
      <div id="remind-info-container" style="justify-content: center; display: none">
        <!-- 在ios端webview引导用户打开safari浏览器 -->
        <div id="webview-remind" class="webview-remind">
          <img class="webview-remind-img" src="./img/right-top-arrow.png" alt="right-top-arrow" />
          <div class="webview-remind-info">
            <span>点击右上角 ··· 图标</span>
            <span style="display: inline-block; margin-top: 10px">选择在safari浏览器中打开</span>
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
              设备检测前请务必给当前页面开放摄像头，麦克风权限
            </div>
            <div class="device-display flex">
              <div id="device-camera" class="device icon-normal connect-success">
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
              <div id="device-network" class="device icon-normal connect-success">
                <svg class="icon" aria-hidden="true">
                  <use xlink:href="#icon-network"></use>
                </svg>
              </div>
            </div>
            <div id="device-loading" class="loading-background" style="display: none">
              <div class="device-loading"></div>
            </div>
            <!-- 连接结果提示 -->
            <div class="connect-info">
              <!-- 连接结果 -->
              <div id="connect-info" style="color: rgb(50, 205, 50)">
                设备及网络连接成功，请开始设备检测
              </div>
              <!-- 错误icon及错误解决指引 -->
              <div id="connect-attention-container" class="connect-attention-container" style="display: none">
                <div id="connect-attention-icon" class="connect-attention-icon">
                  <svg class="icon" aria-hidden="true">
                    <use xlink:href="#icon-warn"></use>
                  </svg>
                </div>
                <div id="connect-attention-info" class="connect-attention-info" style="display: none"></div>
              </div>
            </div>
            <!-- 设备连接页面button -->
            <div class="testing-btn-display flex">
              <div id="start-test-btn" class="test-btn start-test">
                开始检测
              </div>
              <div id="start-test-btn-tc" class="test-btn start-test" style="margin-left: 15px">
                关闭
              </div>
              <div id="connect-again-btn" class="test-btn connect-again" style="display: none; margin-left: 15px">
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
            <div id="camera-testing-body" class="testing-body" style="display: none">
              <div class="device-list camera-device-list flex">
                <div class="select-title" style="display: block">
                  摄像头选择
                </div>
                <div class="select-list" style="display: block">
                  <select name="select" id="camera-select" class="device-select"></select>
                </div>
                <div id="camera-refresh" class="select-title ml-2 !text-blue-500 underline" style="display: block;">
                  刷新
                </div>
              </div>
              <div id="camera-video" class="camera-video"></div>
              <div class="testing-info-container">
                <div class="testing-info">是否可以清楚的看到自己？</div>
                <div class="button-list flex">
                  <div id="camera-fail" class="fail-button">看不到</div>
                  <div id="camera-success" class="success-button">可以看到</div>
                  <div id="reload" class="success-button">重新尝试</div>
                </div>
              </div>
            </div>
            <!-- 设备检测-播放器检测 -->
            <div id="voice-testing-body" class="testing-body" style="display: none">
              <div class="device-list camera-device-list flex">
                <div class="select-title" style="display: block">
                  扬声器选择
                </div>
                <div class="select-list" style="display: block">
                  <select name="select" id="voice-select" class="device-select"></select>
                </div>
              </div>
              <div class="audio-control">
                <div class="audio-control-info">
                  请调高设备音量, 点击播放下面的音频试试～
                </div>
                <audio id="audio-player" src="https://web.sdk.qcloud.com/trtc/webrtc/assets/bgm-test.mp3"
                  controls=""></audio>
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
            <div id="mic-testing-body" class="testing-body" style="display: none">
              <div class="device-list camera-device-list">
                <div class="select-title" style="display: block">
                  麦克风选择
                </div>
                <div class="select-list" style="display: block">
                  <select name="select" id="mic-select" class="device-select"></select>
                </div>
                <div id="mic-refresh" class="select-title ml-2 !text-blue-500 underline" style="display: block;">
                  刷新
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
            <div id="network-testing-body" class="testing-body" style="display: none">
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
      <div style="display: none"><img src="./img/network/up/network_0.png" alt="" />
        <img src="./img/network/up/network_1.png" alt="" />
        <img src="./img/network/up/network_2.png" alt="" />
        <img src="./img/network/up/network_3.png" alt="" />
        <img src="./img/network/up/network_4.png" alt="" />
        <img src="./img/network/up/network_5.png" alt="" />
        <img src="./img/network/up/network_6.png" alt="" />
        <img src="./img/network/down/network_0.png" alt="" />
        <img src="./img/network/down/network_1.png" alt="" />
        <img src="./img/network/down/network_2.png" alt="" />
        <img src="./img/network/down/network_3.png" alt="" />
        <img src="./img/network/down/network_4.png" alt="" />
        <img src="./img/network/down/network_5.png" alt="" />
        <img src="./img/network/down/network_6.png" alt="" />
        <img src="./img/mic-on.png" alt="" />
        <img src="./img/mic-off.png" alt="" />
        <img src="./lib/layui/css/modules/layer/default/icon.png" alt="" />
      </div>
    </section>
    <footer class="w-full h-[8%] drop-shadow-md flex items-center justify-center absolute bottom-2 z-50 mx-auto">
      <div id="toolbar" style="display: none;"
        class="h-full w-auto flex text-center text-white items-center justify-center mx-auto relative">
        <div class="absolute w-full h-full top-0 left-0 shadow bg-black opacity-10 pointer-events-none"></div>
        <div class="toolbar_btn" id="shangyiye_btn">
          <svg class="icon text-[1.7rem] text-white" aria-hidden="true">
            <use xlink:href="#icon-shangyiye"></use>
          </svg>
          <span class="mt-1 text-[14px]">上一页</span>
        </div>
        <div class="toolbar_btn" id="xiayiye_btn">
          <svg class="icon text-[1.7rem] text-white" aria-hidden="true">
            <use xlink:href="#icon-xiayiye"></use>
          </svg>
          <span class="mt-1 text-[14px]">下一页</span>
        </div>
      </div>
    </footer>

    <script src="./lib/jquery/jquery-3.2.1.min.js"></script>
    <script src="./lib/trtc/trtc.js"></script>
    <script src="./js/util.js"></script>
    <script src="./js/device-testing.js"></script>
    <script src="./js/rtc-detection.js"></script>
    <script src="./js/common-public.js?t=202203251114"></script>
    <script src="./js/big/common.js?t=202203251114"></script>
    <script src="./js/big/rtc-client.js?t=202203251114"></script>
    <script>
      if (queryParams("p") && queryParams("RoomId")) {
        login(queryParams("p"));
        queryParams("h") && $("#video-grid").fadeOut()
      } else {
        alert("参数错误");
        leave();
      }
    </script>
    <script defer src="./lib/jquery/signalr.min.js"></script>
    <script defer src="./js/big/chatHub.js?t=202203251114"></script>
    <script defer src="./lib/layui/layui.js"></script>
    <script defer src="./lib/trtc/lib-generate-test-usersig.min.js"></script>
    <script defer src="./lib/trtc/GenerateTestUserSig.js"></script>
    <script defer src="./js/template.js?t=202203251114"></script>
    <script defer src="./js/elementHandle.js?t=202203251114"></script>
    <script defer src="./js/elementEvent.js?t=202203251114"></script>
    <script defer src="./js/iconfont.js"></script>
    <script defer src="./js/prohibit.js"></script>
  </body>

  </html>