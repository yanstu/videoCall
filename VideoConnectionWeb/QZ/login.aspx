<!--
 * @Author: 严鑫
 * @Date: 2022-04-02 13:28:10
 * @LastEditTime: 2022-04-02 14:09:03
 * @LastEditors: 严鑫
 * @Description: 
 * @FilePath: \QZ\login.aspx
-->
<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="login.aspx.cs" Inherits="VideoConnectionWeb.TestItem" %>
    <!DOCTYPE html>
    <html lang="zh-CN">

    <head>
        <title>视频连线</title>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <link rel="stylesheet" type="text/css" href="login/fonts/font-awesome-4.7.0/css/font-awesome.min.css">
        <link rel="stylesheet" type="text/css" href="login/css/util.min.css">
        <link rel="stylesheet" type="text/css" href="login/css/main.min.css">
        <link rel="stylesheet" href="./lib/layui/css/layui.css" />
    </head>

    <body>
        <div class="limiter">
            <div class="container-login100">
                <div class="wrap-login100">
                    <div class="login100-form-title" style="background-image: url(login/images/bg-01.jpg);">
                        <span class="login100-form-title-1">视 频 连 线</span>
                    </div>
                    <div action="#" class="login100-form validate-form">
                        <div class="wrap-input100 validate-input m-b-26" data-validate="姓名不能为空">
                            <span class="label-input100">姓名</span></span>
                            <input class="input100" type="text" id="XM" name="username" placeholder="请输入姓名">
                            <span class="focus-input100"></span>
                        </div>

                        <div class="wrap-input100 validate-input m-b-18" data-validate="邀请码不能为空">
                            <span class="label-input100">邀请码</span>
                            <input class="input100" type="number" id="YQM" maxlength="6" name="code"
                                placeholder="请输入邀请码">
                            <span class="focus-input100"></span>
                        </div>
                        <div class="container-login100-form-btn" style="width: 100%;margin-top: 10px;">
                            <button class="login100-form-btn" style="width: 100%;">进 入 会 议</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <script src="lib/jquery/jquery-3.2.1.min.js"></script>
        <script async src="./lib/layui/layui.js"></script>
        <script src="login/js/main.js"></script>
        <script>
            const apiBaseUrl = "<%=ApiBaseUrl%>";
            $('button').on('click', () => {
                var XM = $('#XM').val()
                var YQM = $('#YQM').val()
                if (!YQM || !XM) return
                var loading = layer.load(1);
                $.ajax({
                    url: apiBaseUrl + "VideoConference/CheckGZHJRHY",
                    data: {
                        LX: 1,
                        XM,
                        YQM
                    },
                    dataType: "json",
                    type: 'POST',
                    beforeSend: (XMLHttpRequest) => {
                        XMLHttpRequest.setRequestHeader("Token", "abc123sfkj");
                    },
                    success: (res) => {
                        console.log('res', res);
                        if (res.Code != 0) {
                            layer.msg(res.Msg)
                            return
                        }
                        var { VideoMobileUrl, VideoPCUrl, JsonStr, RoomId } = res.Data
                        var url = isMobile() ? VideoMobileUrl : VideoPCUrl
                        location.replace(url + '?p=' + JsonStr + '&RoomId=' + RoomId)
                    },
                    complete: () => {
                        layer.close(loading)
                    }
                });
            })

            function isMobile() {
                let flag = navigator.userAgent.match(
                    /(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i
                );
                return flag;
            }
        </script>
    </body>

    </html>