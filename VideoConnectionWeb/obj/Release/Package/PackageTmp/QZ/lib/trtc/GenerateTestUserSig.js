function genTestUserSig(userID) {
  const SDKAPPID = 1400575117;
  const EXPIRETIME = 604800;
  const SECRETKEY =
    "df869e7a7ad9da1b2142b6f64ce392af4ea9f962ed69918ebd2d17f8f31bc7b5";
  const generator = new LibGenerateTestUserSig(SDKAPPID, SECRETKEY, EXPIRETIME);
  const userSig = generator.genTestUserSig(userID);
  return {
    sdkAppId: SDKAPPID,
    userSig: userSig,
  };
}
