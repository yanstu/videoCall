function genTestUserSig(userID) {
    const SDKAPPID = 1400575117;

    /**
     * 签名过期时间，建议不要设置的过短
     * <p>
     * 时间单位：秒
     * 默认时间：7 x 24 x 60 x 60 = 604800 = 7 天
     */
    //const EXPIRETIME = 604800;
    //const SECRETKEY = 'df869e7a7ad9da1b2142b6f64ce392af4ea9f962ed69918ebd2d17f8f31bc7b5';

    //if (SDKAPPID === '' || SECRETKEY === '') {
    //    alert(
    //        '请先配置好您的账号信息： SDKAPPID 及 SECRETKEY ' +
    //        '\r\n\r\nPlease configure your SDKAPPID/SECRETKEY in js/debug/GenerateTestUserSig.js'
    //    );
    //}
    const userSig = userID;
    return {
        sdkAppId: SDKAPPID,
        userSig: userSig
    };
}
