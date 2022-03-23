/**
 * 对视图进行处理
 */
async function viewsHandle() {
  // 处理布局相关
  sortView();
  // 为当前页用户循环添加至网页上
  addView();
  await rtc.join();
  $("[id^='img_']").remove();
}

function addView() {
  for (let user_ of roomDetail_.UserList) {
    const { ID, UserName } = user_;
    $("#video-grid").append(videoBoxTemplate(ID, UserName));
    $("#box_" + ID).attr(
      "class",
      "w-full h-full video-box relative box-border border-[2px] border-[#5f6d7a]"
    );
  }
  addMember();
}

function sortView() {
  for (let index = 4; index >= 0; index--) {
    if (roomDetail_.UserList.length > index * index) {
      console.log(
        $("#video-grid").css(
          "grid-template-columns",
          `repeat(${index + 1}, minmax(0, 1fr));`
        )
      );
      $("#video-grid").attr(
        "class",
        `box-border grid w-full h-full items-center justify-center z-10`
      );
      $("#video-grid").attr(
        "style",
        `grid-template-columns: repeat(${
          index + 1
        }, minmax(0, 1fr));grid-template-rows: repeat(${
          index + 1
        }, minmax(0, 1fr));`
      );
      break;
    }
  }
}

// 查询房间是否包含该用户
function hasMe(userId) {
  var exits = roomDetail_.UserList.find((user) => user.ID == userId);
  return !!exits;
}
