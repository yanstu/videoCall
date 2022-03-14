/**
 * 对视图进行处理
 */
async function viewsHandle() {
  roomDetail_.CHRY_ShowCols = 5;
  roomDetail_.CHRY_ShowRows = 5;
  layoutCompute();
  // 用于翻页、取消主讲人、更改主讲人的处理，清空用户下面再添加进去
  resetViews();
  // 处理布局相关
  sortView();
  // 为当前页用户循环添加至网页上
  addView();
  const indexLoad3 = layer.load(1);
  await rtc.leave();
  await rtc.join();
  layer.close(indexLoad3);
}

function addView() {
  for (let user_ of layout_.pageUserList) {
    const { ID, UserName } = user_;
    $("#video-grid").append(videoBoxTemplate(ID, UserName));
    $("#box_" + ID).attr(
      "class",
      "w-full h-full video-box relative box-border border-[2px] border-[#5451]"
    );
  }
  addMember();
}

function sortView() {
  for (let index = 4; index >= 0; index--) {
    if (layout_.pageUserList.length > index * index) {
      $("#video-grid").attr(
        "class",
        `box-border grid w-full h-full items-center justify-center z-10 grid-cols-${
          index + 1
        } grid-rows-${index + 1}`
      );
      break;
    }
  }
}

// 查询房间是否包含该用户
function hasMe(userId) {
  var exits = layout_.pageUserList.find((user) => user.ID == userId);
  return !!exits;
}
