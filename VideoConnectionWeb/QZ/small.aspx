<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="small.aspx.cs" Inherits="VideoConnectionWeb.TestItem" %>
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
    <style>
      #video-grid {
        border: 1px solid #393e4b;
      }
    </style>
    <script src="./js/onload.js"></script>
    <script src="./js/api.js"></script>
    <script>
      const apiBaseUrl = "<%=ApiBaseUrl%>";
      const hubBaseUrl = "<%=HubBaseUrl%>";
      const hubsUrl = hubBaseUrl + "chatHub";
    </script>
  </head>

  <body class="w-screen h-screen">
    <header style="box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.07), 0 1px 2px 0 rgba(0, 0, 0, 0.05) !important;"
      class="flex flex-row h-[7%] bg-[#262626] w-full justify-between">
      <div class="w-[8%] flex items-center justify-start">
        <img style="margin-left: 1rem;" id="testing_btn" title="设备、网络检测" class="hover:invert-[50%] h-[50%]"
          src="./img/check-mic.png" />
        <div style="width: 2.5rem;height: 50%;" class="flex items-center justify-content-center relative ml-2">
          <img id="qiehuanshitu_btn" title="切换布局模式" class="h-full" src="./img/shitu.png" />
        </div>
      </div>
      <div id="roomTitle" class="text-[1.8rem] text-white flex items-center justify-center whitespace-nowrap"></div>
      <div class="flex items-center justify-end">
        <div style="width: 2.5rem;margin-right: 0.60rem;"
          class="flex items-center justify-content-center relative h-[50%]">
          <img id="network-up" class="h-full" src="./img/network/up/network_4.png" />
        </div>
        <div style="width: 2.5rem;margin-right: 0.75rem;"
          class="flex items-center justify-content-center relative h-[50%]">
          <img id="network-down" class="h-full" src="./img/network/down/network_4.png" />
        </div>
        <div id="exit-btn" style="font-size: 16px;width: 4rem;"
          class="anniubeijing mr-4 w-[5rem] h-[50%] flex justify-center items-center text-white pl-3 pr-3">
          退出
        </div>
      </div>
    </header>
    <section class="h-[93%] flex flex-row w-full bg-[#24292e] relative">
      <div id="video-grid" style="background: #24292e"
        class="box-border grid w-full h-full items-center justify-center z-10 grid-cols-5 grid-rows-5"></div>

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
              设备检测前请务必开放摄像头，麦克风权限
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
                <div id="camera-refresh" class="select-title ml-2 !text-blue-500 underline" style="display: block">
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
                  请调高设备音量, 点击播放下面的音频
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
                <div id="mic-refresh" class="select-title ml-2 !text-blue-500 underline" style="display: block">
                  刷新
                </div>
              </div>
              <div class="mic-testing-container">
                <div class="mic-testing-info">对着麦克风说话</div>
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

      <!-- 切换视图遮罩 -->
      <div id="qiehuanshitu_mianban" style="display: none">
        <!-- 切换视图卡片 -->
        <div class="device-testing-card" style="width: 35%;height: 30%;">
          <!-- 切换视图面板 -->
          <div id="qiehuanshitu_content"
            class="device-testing-prepare p-2 h-full flex flex-col justify-center items-center">
            <div class="text-[30px] h-[15%] flex justify-center items-center w-full">
              切换模式
            </div>
            <div class="flex justify-center items-center h-[85%] w-full">
              <div class="shitubox" id="qiehuanchangguishipin_btn">
                <img class="w-[150px]" src="./img/views/changgui.png" alt="" />
                <div class="text-[20px] mt-2">主讲人+小视频</div>
              </div>
              <div class="shitubox" id="qiehuanxiaoshipin_btn">
                <img class="w-[150px]" src="./img/views/xiao.png" alt="" />
                <div class="text-[20px] mt-2">小视频</div>
              </div>
              <div class="shitubox" id="qiehuandashipin_btn">
                <img class="w-[150px]" src="./img/views/da.png" alt="" />
                <div class="text-[20px] mt-2">主讲人</div>
              </div>
            </div>
          </div>
          <!-- 切换视图关闭按钮 -->
          <div id="qiehuanshitu_close_btn" class="device-testing-close-btn">
            <svg class="icon" aria-hidden="true">
              <use xlink:href="#icon-closeIcon"></use>
            </svg>
          </div>
        </div>
      </div>

      <!-- 成员列表 -->
      <div id="yonghuliebiao" class="modalbox" style="justify-content: center !important;display: none;">
        <div class="modalbox-title">
          参与者列表
        </div>
        <div id="member-list"
          class="col-div w-[100%] text-[0.875rem] h-[93%] p-1 overflow-y-scroll overscroll-contain text-white">
          <!-- 成员列表成员模板 -->
          <div id="member-me" style="display: none;" class="flex border-b-283240 border-b-[1px] w-full">
            <div class="row-div member flex items-center h-[3.5rem]" style="width: 100%;justify-content: space-between">
              <div class="member-id ml-2 flex justify-center items-center" style="color: #7c7f85;">user_7157526(我)</div>
              <div class="row-div flex h-full justify-c
                enter items-center mr-5">
                <img class="member-video_btn" style="height: 1.5rem" src="./img/camera-on.png" alt="" />
                <img class="member-audio-btn ml-[0.8rem]" style="height: 1.5rem" src="./img/mic-on.png" alt="" />
                <svg style="display: none;" class="faxiaoxi_btn icon text-[1.6rem] text-[#bfbfbf] ml-[0.8rem]"
                  aria-hidden="true">
                  <use xlink:href="#icon-faxiaoxi"></use>
                </svg>
                <svg style="display: none;" class="tidiao_btn icon text-[1.6rem] text-[#bfbfbf] ml-[0.8rem]"
                  aria-hidden="true">
                  <use xlink:href="#icon-tidiao"></use>
                </svg>
                <div style="display: none;"
                  class="shezhizhujiangren_btn anniubeijing pl-[1rem] pr-[1rem] h-[50%] ml-[0.8rem] text-white flex justify-center items-center">
                  设主讲人</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 申请发言列表 -->
      <div id="shenqingfayanliebiao" style="display: none;" class="modalbox">
        <div class="modalbox-title">申请发言列表</div>
        <div id="speakerList" class="flex flex-col h-[93%] overflow-y-scroll overscroll-contain w-full">
          <!-- 发言人模板 -->
          <div id="fayan_muban" style="display: none"
            class="border-b-283240 border-b-[1px] flex justify-between w-full h-[3.5rem] items-center text-[0.875rem]">
            <div class="fayanrenxingming text-white" style="margin-left: 1rem;">发言人姓名</div>
            <div class="flex h-full justify-center items-center" style="margin-right: 1rem;">
              <div
                class="yunxufayan pl-[1rem] pr-[1rem] anniubeijing h-[50%] flex justify-center items-center text-white mr-3">
                允许发言
              </div>
              <div
                class="buyunxufayan pl-[1rem] pr-[1rem] anniubeijing h-[50%] flex justify-center items-center text-white">
                拒绝
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 消息列表 -->
      <div id="xiaoxiliebiao" style="display: none;" class="modalbox">
        <div class="modalbox-title">
          消息列表
        </div>
        <div id="messageList" class="h-[86%] w-full overflow-y-scroll pb-3">
          <!-- 消息模板 -->
          <div id="message_muban" style="display: none;" class="flex flex-col h-auto pl-2 pr-2 pt-2 text-[0.875rem]">
            <div class="message_time mb-2 mt-1 h-[20%] text-white flex justify-center items-center">
              2022-02-27 09:18:12
            </div>
            <div class="message_info h-[70%] flex flex-row w-full justify-end items-center">
              <div
                class="message_neirong text-white ml-2 text-[0.875rem] mt-1 mr-2 mb-1 bg-[#2d3549] pl-2 pr-2 min-h-[5.7rem] w-[80%]">
                这个是内这个是内这个是内内这个
              </div>
              <div class="message_touxiang bg-[#2d3549] flex items-center justify-center w-[20%] flex-col h-full">
                <svg class="icon text-[4.5rem] text-white" aria-hidden="true">
                  <use xlink:href="#icon-touxiang"></use>
                </svg>
                <div class="message_xingming h-[27%] mb-[3%] w-auto text-white overflow-auto text-[0.675rem]">
                  贵州省人大
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="h-[7%] flex w-full justify-between items-center bg-[#262626] text-[0.875rem]">
          <div id="fasong_tip"
            class="mr-2 ml-2 min-w-[15%] text-white flex-1 flex justify-center items-center whitespace-nowrap overflow-hidden text-ellipsis">
            发向管理员
          </div>
          <input id="xiaoxineirong" class="mr-3 h-[50%] pl-2 pr-2 flex-[1.1]" maxlength="200" />
          <div id="fasongxiaoxi" style="height: 60%;"
            class="min-w-[15%] anniubeijing h-[50%] mr-2 flex-1 flex justify-center items-center text-white">
            发送</div>
        </div>
      </div>

      <!-- 麦克风状态 -->
      <div id="mic_drag"
        class="absolute top-[45%] text-[13px] text-white bottom-0 shadow-md left-1 w-auto h-[35px] bg-[#337c33] z-[888] flex  正在讲话justify-center items-center pl-2 pr-2">
        <svg class="icon text-[0.9rem] text-[#ffa500]" aria-hidden="true">
          <use xlink:href="#icon-zhujiangren"></use>
        </svg>
        <div class="nickname ml-1"></div>
      </div>

      <!-- 预加载所有网络图片资源，防止断网后加载不出断网图标图片 -->
      <div style="display: none">
        <img src="./img/network/up/network_0.png" alt="" />
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
      <div id="toolbar" style="display: none"
        class="h-full w-auto flex text-center text-white items-center justify-center mx-auto relative">
        <div class="absolute w-full h-full top-0 left-0 shadow bg-black opacity-10 pointer-events-none"></div>
        <div class="toolbar_btn" id="mic_btn">
          <svg class="icon text-[1.7rem] text-white" aria-hidden="true">
            <use xlink:href="#icon-maikefeng"></use>
          </svg>
          <span class="mt-1 text-[14px]">静音</span>
        </div>
        <div class="toolbar_btn" id="video_btn">
          <svg class="icon text-[1.7rem] text-white" aria-hidden="true">
            <use xlink:href="#icon-xiangji"></use>
          </svg>
          <span class="mt-1 text-[14px]">摄像头</span>
        </div>
        <div class="toolbar_btn" style="display: none" id="fanzhuan_btn">
          <svg class="icon text-[1.7rem] text-white" aria-hidden="true">
            <use xlink:href="#icon-fanzhuan"></use>
          </svg>
          <span class="mt-1 text-[14px]">翻转</span>
        </div>
        <div class="toolbar_btn" id="canyuzhe_btn">
          <svg class="icon text-[1.7rem] text-white" aria-hidden="true">
            <use xlink:href="#icon-canyuzhe"></use>
          </svg>
          <span class="mt-1 text-[14px]">参与者</span>
        </div>
        <div class="toolbar_btn" style="display: none" id="fayanliebiao_btn">
          <div class="relative">
            <svg class="icon text-[1.7rem] text-white" aria-hidden="true">
              <use xlink:href="#icon-fayanliebiao"></use>
            </svg>
            <div id="fayan_jiaobiao" style="display: none"
              class="w-[10px] h-[10px] rounded-full bg-red-600 absolute right-0 top-0"></div>
          </div>
          <span class="mt-1 text-[14px]">发言列表</span>
        </div>
        <div class="toolbar_btn" id="xiaoxi_btn">
          <div class="relative">
            <svg class="icon text-[1.7rem] text-white" aria-hidden="true">
              <use xlink:href="#icon-xiaoxi"></use>
            </svg>
            <div id="xiaoxi_jiaobiao" style="display: none"
              class="w-[10px] h-[10px] rounded-full bg-red-600 absolute right-0 top-0"></div>
          </div>
          <span class="mt-1 text-[14px]">消息</span>
        </div>
        <div class="toolbar_btn" id="shenqingfayan_btn">
          <svg class="icon text-[1.7rem] text-white" aria-hidden="true">
            <use xlink:href="#icon-shenqingfayan"></use>
          </svg>
          <span class="mt-1 text-[14px]">申请发言</span>
        </div>
        <div class="toolbar_btn" style="display: none" id="guanbimaikefeng_btn">
          <svg class="icon text-[1.7rem] text-white" aria-hidden="true">
            <use xlink:href="#icon-guanbimaikefeng"></use>
          </svg>
          <span class="mt-1 text-[14px]">关闭麦克风</span>
        </div>
        <div class="toolbar_btn" style="display: none" id="quxiaozhujiangren_btn">
          <svg class="icon text-[1.7rem] text-white" aria-hidden="true">
            <use xlink:href="#icon-quxiaozhujiangren"></use>
          </svg>
          <span class="mt-1 text-[14px]">取消主讲人</span>
        </div>
      </div>
    </footer>
    <script src="./lib/jquery/jquery-3.2.1.min.js"></script>
    <script src="./lib/trtc/trtc.js"></script>
    <script src="./js/util.js"></script>
    <script src="./js/device-testing.js"></script>
    <script src="./js/rtc-detection.js"></script>
    <script src="./js/common-public.js?t=202203260344"></script>
    <script src="./js/small/common.js?t=202203260344"></script>
    <script src="./js/small/rtc-client.js?t=202203260344"></script>
    <script>
      if (queryParams("p") && queryParams("RoomId")) {
        login(queryParams("p"));
      } else {
        alert("参数错误");
        leave();
      }

      $(function () {
        $("#mic_drag").each(function () {
          $(this).dragging({
            move: "both",
            randomPosition: false,
          });
        });
      });
    </script>
    <script defer src="./lib/jquery/signalr.min.js"></script>
    <script defer src="./js/small/chatHub.js?t=202203260344"></script>
    <script defer src="./lib/layui/layui.js"></script>
    <script defer src="./js/template.js?t=202203260344"></script>
    <script defer src="./js/elementHandle.js?t=202203260344"></script>
    <script defer src="./js/elementEvent.js?t=202203260344"></script>
    <script defer src="./js/iconfont.js"></script>
    <script defer src="./js/small/drag.js"></script>
    <script defer src="./js/prohibit.js"></script>
    <script defer src="https://cdn.staticfile.org/vConsole/3.5.1/vconsole.min.js"></script>
    <script>
      window.vconsole = new window.VConsole();
    </script>
  </body>

  </html>