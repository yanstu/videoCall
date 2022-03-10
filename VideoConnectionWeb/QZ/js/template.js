/**
 * 左下角昵称显示区域模板
 */
function userInfoTemplate(userId, nickName) {
  var isMobile = location.href.includes("mobile");
  return `<div id="profile_${userId}" class="absolute ${
    isMobile ? "top-0" : "bottom-0"
  } left-0 pl-1 pr-1 w-auto h-7 z-10 flex justify-items-center items-center text-center">
            <!-- 背景遮罩 -->
            <div class="absolute top-0 left-0 w-full ${
              isMobile ? "rounded-br-lg" : "rounded-tr-lg"
            } h-full bg-[#000000] opacity-10"></div>
            <!-- 声音显示 -->
            <div id="mic_main_${userId}">
                <div class="flex items-center justify-content-center relative ${
                  isMobile ? "h-5" : "h-4"
                }">
                  <img class="member-audio-btn h-full" src="./img/mic-on.png">
                  <!-- 音量级别显示 -->
                  <div class="volume-level absolute bottom-0 left-0 w-full" style="height: 0%; overflow: hidden; transition: height .1s ease;">
                      <img class="absolute bottom-0" src="./img/mic-green.png">
                  </div>
                </div>
            </div>
            <!-- 昵称显示 -->
            <span class="ml-1 mr-1 nicknamespan text-[0.975rem]" style="color: white">
            ${nickName}
            </span>
          </div>`;
}

/**
 * 视频盒子模板
 */
function videoBoxTemplate(userId, nickName) {
  return `<div id="box_${userId}" class="w-full h-full video-box relative">
            <!-- “摄像头未开启”遮罩模板 -->
            <div id="mask_${userId}" style="z-index: 8" class="mask top-0 left-0 justify-center col-div flex w-full h-full bg-[#24292e] items-center justify-items-center absolute flex-col">
              <img class="h-[40%]" src="./img/camera-gray.png" alt="" />
            </div>
            ${userInfoTemplate(userId, nickName)}
          </div>`;
}
