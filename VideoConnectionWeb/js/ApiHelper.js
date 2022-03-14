////const ApiUrl = "https://wsllzapptest.gzshifang.com:8091/api/";//正式系统地址
//const ApiUrl = "https://testvideoapi.gzshifang.com:9011/api/";//测试系统地址
//const ApiUrl = "https://192.168.1.2:9103/api/";

const CheckJRHYInfoApi = "VideoConference/CheckJRHYInfo"; //

//url:路径
//fn：回调函数
//data:请求数据
//type：请求类型 默认post
function ApiAjax(purl, pfn, pdata, ptype, pasync, pNoShow) {
    purl = ApiUrl + purl;
    var type = "post";
    var data = {};
    var async = true;
    var noShow = false;
    if (pdata) {
        if (pdata != "") {
            data = pdata;
        }
    }
    if (ptype) {
        if (pdata != "") {
            type = ptype;
        }
    }
    if (pasync == false) {
        async = false;
    }
    if (pNoShow === true) {
        noShow = true;
    }
    $.ajax({
        url: purl,
        data: data,
        type: type,
        dataType: 'json',
        async: async,
        beforeSend: function (XMLHttpRequest) {
            XMLHttpRequest.setRequestHeader("Token", "abc123sfkj");
            if (noShow == false) {
               
            } 
        },
        success: function (res) {
            if (res == null) {
                if (noShow == false) {
                    
                }
            }
            if (pfn) {
                pfn(res);
            }
            if (noShow == false) {
               
            }
        },
        error: function (res) {
            console.error(purl);
            console.error(res);
            //alert(res);
            if (noShow == false) {
               
            }
        }
    });
}

//url:路径
//fn：回调函数
//data:请求数据
//type：请求类型 默认post
function MyAjax(purl, pfn, pdata, ptype, pasync, pNoShow, errFn, pdataType) {
    var type = "post";
    var dataType = 'html';
    var data = {};
    var async = true;
    var noShow = false;
    if (pdata) {
        if (pdata != "") {
            data = pdata;
        }
    }
    if (ptype) {
        if (ptype != "") {
            type = ptype;
        }
    }
    if (pasync == false) {
        async = false;
    }
    if (pNoShow === true) {
        noShow = true;
    }
    if (pdataType) {
        if (dataType != "") {
            dataType = pdataType;
        }
    }
    $.ajax({
        url: purl,
        data: data,
        "type": "post",
        dataType: dataType,
        async: async,
        success: function (res) {
            if (res == null) {
                if (noShow == false) {

                }
            }
            if (pfn) {
                pfn(res);
            }
            if (noShow == false) {

            }
        },
        error: function (res) {
            console.error(purl);
            console.error(res);
            //alert(res);
            if (noShow == false) {

            }
            if (errFn) {
                errFn();
            }
        }
    });
}

function getvl(name) {
    var reg = new RegExp("(^|\\?|&)" + name + "=([^&]*)(\\s|&|$)", "i");
    if (reg.test(location.href)) return unescape(RegExp.$2.replace(/\+/g, " "));
    return "";
};