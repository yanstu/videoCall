
const presetting = new Presetting();
const ss = getvl("p");
var UserList = new Array();
//��ȡ
var postData = {
    "JMStr": ss,
};
//����ID��ȡ�û�����
function getUserObjByID(id) {
    for (var i = 0; i < UserList.length; i++) {
        if (UserList[i].ID == id) {
            return UserList[i];
        }
    }
}
//���ýӿڻ�ȡ��¼�û���Ϣ��UserSig
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

    //�������ͷ�豸
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

    //�����˷��豸
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


