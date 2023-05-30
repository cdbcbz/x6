/*
 @Author: x6
 @Date: 2023-05-26 22:03:55
 @LastEditors: Please set LastEditors
 @LastEditTime: 2023-05-30 19:56:44
 @FilePath: \mangfu\smzdm_queryorder.js

 cron:0 7,12,21 * * *
 */
const Env = require("./common/Env");
const $ = new Env("什么值得买_订单查询");
const fs = require("fs");
const version = "1.0.0";
const filePath = "orders.json";
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
  if (!fs.existsSync(filePath)) {
    log(`${filePath} 不存在！`);
    return;
  }
  if (!cookie) {
    log(`请先填写 cookie`);
    return;
  }

  const cookieArr = cookie.split("&");
  log(`当前共有${cookieArr.length}个账号`);

  let accounts = readJSONFile(filePath) || [];

  for (let i = 0; i < cookieArr.length; i++) {
    let smzdmid = cookieArr[i].split(/smzdm_id=(.+?);/)[1];
    let account = accounts.find((acc) => acc.smzdmid === smzdmid);
    if (account) {
      let orders = account.orders;
      log(`账号[${i + 1}] 对应的订单号：`);
      for (let j = 0; j < orders.length; j++) {
        log(`账号[${i + 1}] 订单[${j + 1}]: ${orders[j]}`);
        let orderInfo = await getOrderInfo(cookieArr[i], orders[j]);
        if (orderInfo === -1) {
          log(`账号[${i + 1}] 订单[${orders[j]}] 状态：订单审核中`);
        } else {
          log(`账号[${i + 1}] 订单[${orders[j]}] 状态：兑换成功，卡密：[${orderInfo}]`);
          modifyAccount(accounts, smzdmid, "delete", orders[j]);
          writeJSONFile(filePath, accounts);
        }
      }
    } else {
      log(`账号[${i + 1}] 未找到对应的订单信息`);
    }
  }
}

async function getOrderInfo(cookie, orderId) {
  const request = {
    url: `https://zhiyou.m.smzdm.com/duihuan/order/ajax_info?order_id=${orderId}`,
    headers: {
      Host: "zhiyou.m.smzdm.com",
      Connection: "keep-alive",
      "Content-Length": 0,
      Accept: "application/json, text/plain, */*",
      "User-Agent": "smzdm_android_V10.4.26 rv:866 (Redmi Note 3;Android10.0;zh)smzdmapp",
      "Content-Type": "application/x-www-form-urlencoded",
      Origin: "https://zhiyou.m.smzdm.com",
      "X-Requested-With": "com.smzdm.client.android",
      "Sec-Fetch-Site": "same-origin",
      "Sec-Fetch-Mode": "cors",
      "Sec-Fetch-Dest": "empty",
      Referer:
        "https://zhiyou.m.smzdm.com/user/vip?type=0&,zdm_feature=%7B%22sm%22%3A1%2C%22ns%22%3A1%2C%22dc%22%3A%22%2300ffffff%22%2C%22fs%22%3A1%7",
      "Accept-Encoding": "gzip, deflate",
      "Accept-Language": "zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7",
      Cookie: cookie,
    },
  };
  try {
    let response = await Get(request);
    if (response.data.gift_card_password) {
      return response.data.gift_card_password;
    } else {
      return -1;
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
function log(message) {
  let currentTime = new Date().toLocaleTimeString();
  $.log(`[${currentTime}] ${message}`);
  msg += `[${currentTime}] ${message}\n`;
}
function readJSONFile(filename) {
  try {
    const data = fs.readFileSync(filename, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error(`error`, error);
    return null;
  }
}
function writeJSONFile(filename, data) {
  try {
    const jsonData = JSON.stringify(data, null, 2);
    fs.writeFileSync(filename, jsonData, "utf8");
  } catch (error) {
    console.error(`error`, error);
  }
}
async function checkUpdate(scriptName) {
  const request = {
    url: `https://raw.githubusercontent.com/fwktls/x6/master/version.json`,
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
function modifyAccount(accounts, smzdmid, action, order) {
  const account = accounts.find((acc) => acc.smzdmid === smzdmid);

  if (action === "add") {
    if (account) {
      account.orders.push(order);
      console.log(`订单号[${order}]已添加到ID:[${smzdmid}]`);
    } else {
      accounts.push({
        smzdmid,
        orders: [order],
      });
      console.log(`ID:[${smzdmid}]已创建，并添加订单号:[${order}]`);
    }
  } else if (action === "delete") {
    if (account) {
      if (order) {
        const index = account.orders.indexOf(order);
        if (index !== -1) {
          account.orders.splice(index, 1);
          console.log(`订单号[${order}]已从ID:[${smzdmid}]中删除`);
        } else {
          console.log(`ID:[${smzdmid}]中不存在订单号[${order}]`);
        }
      } else {
        const index = accounts.indexOf(account);
        accounts.splice(index, 1);
        console.log(`ID:[${smzdmid}]已删除`);
      }
    } else {
      console.log(`未找到ID:${smzdmid}`);
    }
  } else {
    console.log(`无效的操作：[${action}]`);
  }
}
