/*
 @Author: x6
 @Date: 2023-06-08 17:47:04
 @LastEditTime: 2023-06-09 10:35:14
 cron:0 10 * * 1
 */
const Env = require("./common/Env");
const $ = new Env("什么值得买_连续签到奖励");
const fs = require("fs");
const version = "1.0.0";
const cookie = ($.isNode() ? process.env.SMZDM_COOKIE : $.getdata("SMZDM_COOKIE")) || ``;
const Notify = require("./sendNotify");
const Isnotify = ($.isNode() ? process.env.isnotify : $.getdata("isnotify")) || "true"; //是否开启推送 false关闭 true开启
let msg = "";
!(async () => {
  await checkUpdate($.name);
  await run();
  if (Isnotify) {
    Notify.sendNotify($.name, msg);
  }
})()
  .catch((err) => $.logErr(err))
  .finally(() => $.done());
async function run() {
  if (!cookie) {
    log(`请先填写 cookie`);
    return;
  }

  const cookieArr = cookie.split("&");
  log(`当前共有${cookieArr.length}个账号`);
  for (let i = 0; i < cookieArr.length; i++) {
    let RewardList = await GetRewardList(cookieArr[i]);
    if (RewardList.data) {
      let packList = processPacks(RewardList.data);
      if (packList.length === 0) {
        log(`账号[${i + 1}]：没有符合条件的奖励`);
        continue;
      }
      for (let j = 0; j < packList.length; j++) {
        log(`账号[${i + 1}]：领取[${packList[j].packName}]`);
        let rewardBody = await sendReward(cookieArr[i], packList[j].packId);
        log(`账号[${i + 1}]：获得[${rewardBody.msg}]`);
      }
    } else {
      log(`账号[${i + 1}]：` + RewardList.msg);
    }
  }
}
async function GetRewardList(cookie) {
  const request = {
    url: `https://h5.smzdm.com/user/pack/ajax_get_reward_list`,
    headers: {
      Host: "h5.smzdm.com",
      Connection: "keep-alive",
      "Content-Length": 0,
      Accept: "application/json, text/plain, */*",
      "User-Agent": "smzdm_android_V10.4.26 rv:866 (Redmi Note 3;Android10.0;zh)smzdmapp",
      "Content-Type": "application/x-www-form-urlencoded",
      Origin: "https://h5smzdm.com",
      "X-Requested-With": "com.smzdm.client.android",
      "Sec-Fetch-Site": "same-origin",
      "Sec-Fetch-Mode": "cors",
      "Sec-Fetch-Dest": "empty",
      Referer: "https://h5.smzdm.com/user/pack/",
      "Accept-Encoding": "gzip, deflate",
      "Accept-Language": "zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7",
      Cookie: cookie,
    },
    body: "type=2",
  };
  try {
    let response = await Post(request);
    if (response && response.data.unreceive) {
      return { code: response.error_code, msg: "获取连续签到奖励列表", data: response.data.unreceive };
    } else {
      return { code: response.error_code, msg: response.error_msg, data: null };
    }
  } catch (error) {
    console.error("Error:", error);
  }
}
function processPacks(packs) {
  const processedPacks = [];

  // 处理每个礼包
  packs.forEach((pack) => {
    // 过滤掉 is_real_filter 不等于 1 的礼包
    if (pack.is_real_filter !== 1) {
      return;
    }

    const processedPack = {
      packId: pack.pack_id,
      packName: pack.pack_name,
    };

    processedPacks.push(processedPack);
  });

  return processedPacks;
}
async function sendReward(cookie, id) {
  const request = {
    url: `https://h5.smzdm.com/user/pack/ajax_receive`,
    headers: {
      Host: "h5.smzdm.com",
      Connection: "keep-alive",
      "Content-Length": 0,
      Accept: "application/json, text/plain, */*",
      "User-Agent": "smzdm_android_V10.4.26 rv:866 (Redmi Note 3;Android10.0;zh)smzdmapp",
      "Content-Type": "application/x-www-form-urlencoded",
      Origin: "https://h5smzdm.com",
      "X-Requested-With": "com.smzdm.client.android",
      "Sec-Fetch-Site": "same-origin",
      "Sec-Fetch-Mode": "cors",
      "Sec-Fetch-Dest": "empty",
      Referer: "https://h5.smzdm.com/user/pack/",
      "Accept-Encoding": "gzip, deflate",
      "Accept-Language": "zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7",
      Cookie: cookie,
    },
    body: "pack_id=" + id,
  };
  try {
    let response = await Post(request);
    if (response && response.data) {
      return { code: response.error_code, msg: response.data.success_msg, data: response.data.success_msg };
    } else {
      return { code: response.error_code, msg: response.error_msg, data: null };
    }
  } catch (error) {
    console.error("Error:", error);
  }
}
async function Get(request) {
  return new Promise((resolve) => {
    $.get(request, async (error, response) => {
      if (error) {
        console.error("网络错误:", error);
        resolve(new Error("网络错误"));
      } else {
        try {
          var data = JSON.parse(response.body);
          if (data) {
            resolve(data);
          } else {
            console.error("响应数据为空");
            resolve(new Error("响应数据为空"));
          }
        } catch (e) {
          console.error("解析错误:", e);
          resolve(new Error("解析错误"));
        }
      }
    });
  });
}
async function Post(request) {
  return new Promise((resolve) => {
    $.post(request, async (error, response) => {
      if (error) {
        console.error("网络错误:", error);
        resolve(new Error("网络错误"));
      } else {
        try {
          var data = JSON.parse(response.body);
          if (data) {
            resolve(data);
          } else {
            console.error("响应数据为空");
            resolve(new Error("响应数据为空"));
          }
        } catch (e) {
          console.error("解析错误:", e);
          resolve(new Error("解析错误"));
        }
      }
    });
  });
}
function log(message) {
  let currentTime = new Date().toLocaleTimeString();
  $.log(`[${currentTime}] ${message}`);
  msg += `[${currentTime}] ${message}\n`;
}
async function checkUpdate(scriptName) {
  const request = {
    url: `https://gitcode.net/u013276346/x6/-/raw/master/version.json`,
  };
  let response = await Get(request);
  let versionData = response;
  let script = versionData.scripts.find((s) => s.name === scriptName);
  if (script) {
    let currentVersion = version;
    if (currentVersion !== script.version) {
      log(`有新版本！请更新脚本`);
      log("最新版本号：" + script.version);
      log("更新内容：" + script.releaseNotes);
    }
  } else {
    log(`未找到脚本信息。`);
  }
}
