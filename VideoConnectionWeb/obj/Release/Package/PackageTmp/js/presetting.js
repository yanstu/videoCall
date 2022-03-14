/* global $ setBtnClickFuc genTestUserSig */
// preset before starting RTC
class Presetting {
    init(CHID, RoomId, Title, UserSig, XM, IsZCR, QYBH) {
        $('#userId').val(CHID);
        $('#roomId').val(RoomId);
        $('#hyTitle').val(Title);
        $('#hyTitle').html(Title);
        $('#ycSig').val(UserSig);
        $('#userrealyName').val(XM);
        $('#IsZCR').val(IsZCR);
        const roomId = this.query('roomId');
        const userId = this.query('userId');
        if (roomId) {
            $('#roomId').val(roomId);
        }
        if (userId) {
            $('#userId').val(userId);
        }
        //$('.mask').hide();
        $("#mask_main").hide();
    }

    query(name) {
        const match = window.location.search.match(new RegExp('(\\?|&)' + name + '=([^&]*)(&|$)'));
        return !match ? '' : decodeURIComponent(match[2]);
    }

    login(share, callback) {
        let userId = $('#userId').val();
        const config = genTestUserSig($('#ycSig').val());
        const sdkAppId = config.sdkAppId;
        const userSig = config.userSig;
        const roomId = $('#roomId').val();
        const roomName = $('#hyTitle').val();
        const XM = $('#userrealyName').val();

        callback({
            sdkAppId,
            userId,
            userSig,
            roomId,
            roomName,
            XM
        });
    }
}
