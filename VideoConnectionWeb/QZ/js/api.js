const baseUrl = [
  "https://wsllzapptest.gzshifang.com:8091/api/",
  "https://testvideoapi.gzshifang.com:9011/api/",
][1];

const hubsUrl = ["/signalr/hubs"][0];
const signalrUrl = ["/signalr"][0];

/**
 * A router function that maps the key to the URL.
 * @param key - The key of the URL.
 * @returns The router function returns a dictionary of routes.
 */
function router(key) {
  var urls = {
    /**
     * 解密
     * @param {string} JMStr
     */
    checkJRHYInfo: {
      method: "post",
      url: "VideoConference/CheckJRHYInfo",
    },
    /**
     * 查询用户列表
     * @param {string} ID
     */
    FindVideoConferenceById: {
      method: "get",
      url: "VideoConference/FindVideoConferenceById",
    },
    /**
     * 连接redis
     */
    RedisHandler: {
      root: true,
      method: "get",
      url: "/Handler/RedisHandler.ashx",
    },
  };
  return urls[key];
}

/**
 * It makes an AJAX call to the server.
 * @param str - The route string.
 * @param [data] - The data that will be sent to the server.
 * @param callback - a function that will be called when the request is completed.
 */
function ajaxMethod(str, data = {}, callback) {
  const route = router(str);
  $.ajax({
    type: route.method,
    url: route.root ? "" : baseUrl + route.url,
    data,
    dataType: "json",
    async: false,
    cache: true,
    beforeSend: (XMLHttpRequest) => {
      XMLHttpRequest.setRequestHeader("Token", "abc123sfkj");
    },
    success: (res) => {
      callback && callback(res);
    },
    error: () => {
      alert("请求超时或没有网络链接");
      location.reload();
    },
  });
}
