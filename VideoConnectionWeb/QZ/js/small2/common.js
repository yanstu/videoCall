/**
 * 对视图进行处理
 */
async function viewsHandle() {
  meetLayoutCompute();
  displayLayoutCompute();
  // 用于翻页、取消主讲人、更改主讲人的处理，清空用户下面再添加进去
  resetViews();
  // 处理布局相关
  sortView();
  // 为当前页用户循环添加至网页上
  addView();
  await rtc.leave();
  await rtc.join();
  $("[id^='img_']").remove();
}

function addView() {
  for (let user_ of roomDetail_.UserList) {
    const { ID, UserName } = user_;
    $("#video-grid").append(videoBoxTemplate(ID, UserName));
    $("#box_" + ID).attr(
      "class",
      "w-full h-full video-box relative box-border border-[2px] border-[#5451]"
    );
    !getUserInfoByDisplay(ID) && $("#box_" + ID).hide();
  }
}

function sortView() {
  $("#video-grid").attr(
    "class",
    `box-border grid w-full h-full items-center justify-center z-10 grid-cols-${display_layout.cols} grid-rows-${display_layout.rows}`
  );
}
