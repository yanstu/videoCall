// 网络是否断开
let isDisconnect = false;

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
  } catch (error) {}
  window.oldLog(e);
};
window.oldWarn = console.warn;
console.warn = (e) => {
  try {
    // 网络断开后trtc SDK会输出这句，所以可以断定为网络断开
    if (JSON.stringify(e)?.includes("close current websocket and schedule")) {
      layer.msg("当前网络已断开", { icon: 5 });
      isDisconnect = true;
    }
    if (JSON.stringify(e)?.includes("reconnect successfully")) {
      isDisconnect = false;
      layer.msg("网络连接已恢复", { icon: 6 });
      huoquhuiyihuancun();
    }
  } catch (error) {}
  window.oldWarn(e);
};
window.oldError = console.error;
console.error = (e) => {
  try {
    // 网络断开后trtc SDK会输出这句，所以可以断定为网络断开
    if (JSON.stringify(e)?.includes("前一个 join() 调用正在进行中")) {
      location.reload();
    }
  } catch (error) {}
  window.oldError(e);
};