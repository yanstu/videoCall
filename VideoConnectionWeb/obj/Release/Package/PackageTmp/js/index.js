
const presetting = new Presetting();
const ss = getvl("p");
var UserList = new Array();
//获取
var postData = {
    "JMStr": ss,
};
//根据ID获取用户名称
function getUserObjByID(id) {
    for (var i = 0; i < UserList.length; i++) {
        if (UserList[i].ID == id) {
            return UserList[i];
        }
    }
}
//调用接口获取登录用户信息和UserSig
function myload() {
    ApiAjax(CheckJRHYInfoApi, function (res) {
        if (res.Code == 0) {
            presetting.init(res.Data.CHID, res.Data.RoomId, res.Data.Title, res.Data.UserSig, res.Data.XM, res.Data.IsZCR, res.Data.QYBH);
            indexload();
        } else {
            alert(res.Msg);
        };
    }, postData, "post");
}

function Runrtc() {
    rtcDetection().then(detectionResult => {
        detectionResult && deviceTestingInit();
    });
    // setup logging stuffs
    TRTC.Logger.setLogLevel(TRTC.Logger.LogLevel.DEBUG);
    TRTC.Logger.enableUploadLog();

    TRTC.getDevices()
        .then(devices => {
            devices.forEach(item => {
                console.log('device: ' + item.kind + ' ' + item.label + ' ' + item.deviceId);
            });
        })
        .catch(error => console.error('getDevices error observed ' + error));

    //添加摄像头设备
    TRTC.getCameras().then(devices => {
        var addCount = 0;
        devices.forEach(device => {
            if (!cameraId) {
                cameraId = device.deviceId;
            }
            //if (addCount < 2) {
            //    cameraData.push(device.deviceId);
            //}
            cameraData.push(device.deviceId);
            addCount++
            let div = $('<div></div>');
            div.attr('id', device.deviceId);
            div.html(device.label);
            div.appendTo('#camera-option');
        });
    });

    //添加麦克风设备
    TRTC.getMicrophones().then(devices => {
        var addCount = 0;
        devices.forEach(device => {
            if (!micId) {
                micId = device.deviceId;
            }
            //if (addCount < 2) {
            //    micData.push(device.deviceId);
            //}
            micData.push(device.deviceId);
            addCount++
            let div = $('<div></div>');
            div.attr('id', device.deviceId);
            div.html(device.label);
            div.appendTo('#mic-option');
        });
    });
}


