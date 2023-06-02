/*
 @Author: x6
 @Date: 2023-05-20 09:45:07
 @LastEditors: Please set LastEditors
 @LastEditTime: 2023-06-02 21:12:12
 @FilePath: \mangfu\smzdm_duihuan.js
 @github: https://github.com/fwktls/x6
 部分代码抄的hex https://github.com/hex-ci/smzdm_script.git
 TG交流群:https://t.me/smzdm_script
 cron:0 10 * * *
 安全码获取方式 在设置-账号与安全 重新设置安全码 需要抓https://h5.smzdm.com/user/safepass/ajax_update_safepass这个链接的请求体 里面有en_safepass参数
 获取到en_safepass参数后添加到cookie中 格式为 cookie+en_safepass=xxxxx; 注意是拼接
 */
const Env = require("./common/Env");
const $ = new Env("什么值得买_限时兑换");
const crypto = require("crypto");
const fs = require("fs");
const version = "1.0.4";
const filePath = "orders.json";
const SIGN_KEY = "apr1$AwP!wRRT$gJ/q.X24poeBInlUJC";
const cookie = ($.isNode() ? process.env.SMZDM_COOKIE : $.getdata("SMZDM_COOKIE")) || ``;
const Notify = require("./sendNotify");
const Isnotify = ($.isNode() ? process.env.isnotify : $.getdata("isnotify")) || "true"; //是否开启推送 false关闭 true开启
const Keyword = ($.isNode() ? process.env.keyword : $.getdata("keyword")) || "京东"; //礼品卡关键词  京东/天猫
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
    log(`请先填写cookie`);
    return;
  }
  const cookieArr = cookie.split("&");
  log(`当前共有${cookieArr.length}个账号`);
  let DuihuanList = await getDuihuanList(cookieArr[0]);

  if (DuihuanList === -1) {
    log(`今日无${Keyword}礼品卡兑换！`);
  } else if (DuihuanList === 0) {
    log("今日无兑换活动！");
  } else {
    log("可兑换商品列表:");
    for (let item of DuihuanList) {
      log("商品名称:" + item.coupon_short_title);
      log("所需碎银:" + item.silver);
    }
    for (let i = 0; i < cookieArr.length; i++) {
      let userSilver = await getUserSilver(cookieArr[i]);
      log(`账号[${i + 1}] 碎银余额: [${userSilver}]`);
      let bestDuihuan = findBestduihuanList(DuihuanList, userSilver);
      if (bestDuihuan === null) {
        log(`账号[${i + 1}] Error: 碎银数量不足，无法兑换商品！`);
      } else {
        let DuihuanInfo = await getDuihuanInfo(cookieArr[i], bestDuihuan.id);
        if (DuihuanInfo === -1) {
          log(`账号[${i + 1}] Error: [${bestDuihuan.coupon_short_title}]库存数量不足，无法兑换！`);
        } else {
          log(
            `账号[${i + 1}] 正在兑换: [${bestDuihuan.coupon_short_title}]库存:${
              DuihuanInfo.data.price_total_num - DuihuanInfo.data.pickup_total
            }`
          );

          let orderid = await exchangeGiftCard(cookieArr[i], [
            DuihuanInfo.data.sku_list[0].specs_price[0].sku_id,
            DuihuanInfo.data.sku_list[0].specs_price[0].spu_id,
            DuihuanInfo.data.sku_list[0].specs_price[0].id,
          ]);
          if (orderid === -1) {
            log(`账号[${i + 1}]兑换失败: 缺少en_safepass参数`);
          } else if (orderid === -2) {
            log(`账号[${i + 1}]兑换失败: 无效的订单号`);
          } else {
            let PIN = await getOrderInfo(cookieArr[i], orderid);
            if (PIN === -1) {
              if (!fs.existsSync(filePath)) {
                writeJSONFile(filePath, []);
              }
              let accounts = readJSONFile(filePath) || [];
              let smzdmid = cookieArr[i].split(/smzdm_id=(.+?);/)[1];
              modifyAccount(accounts, smzdmid, "add", orderid);
              writeJSONFile(filePath, accounts);
              log(`账号[${i + 1}]兑换成功: 订单号[${maskOrderNumber(orderid)}] 状态[订单审核中...]`);
            } else {
              log(`账号[${i + 1}]兑换成功: 卡密[${PIN}]`);
            }
          }
        }
      }
    }
  }
}
async function getDuihuanList(cookie) {
  const request = {
    url: "https://zhiyou.m.smzdm.com/user/vip/ajax_limit_duihuan_list",
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
    body: ``,
  };

  try {
    let response = await Post(request);
    let data = response.data;
    let nowSessions = data.now_sessions;
    if (nowSessions.length > 0) {
      let list = data.duihuan_list[0];
      let filteredData = list.filter((item) => item.silver !== 0 && item.coupon_short_title.includes(Keyword));
      if (filteredData.length > 0) {
        let sortedData = filteredData.sort((a, b) => b.silver - a.silver);
        return sortedData;
      } else {
        return -1;
      }
    } else {
      return 0;
    }
  } catch (error) {
    console.error("Error:", error);
  }
}
async function getUserSilver(cookie) {
  let newData = {
    weixin: 1,
    basic_v: 0,
    f: "android",
    v: "10.4.26",
    time: `${Math.round(new Date().getTime() / 1000)}000`,
    touchstone_event: "",
    sk: "1",
    token: cookie.split(/sess=(.+?);/)[1],
    captcha: "",
  };
  var data = sign(newData);
  const request = {
    url: "https://user-api.smzdm.com/checkin",
    headers: {
      Accept: "*/*",
      "Accept-Language": "zh-Hans-CN;q=1",
      "Accept-Encoding": "gzip",
      "User-Agent": "smzdm_android_V10.4.26 rv:866 (M2011K2C;Android12;zh)smzdmapp",
      Cookie: cookie,
    },
    body: objectToUrlParams(data),
  };

  try {
    let response = await Post(request);
    if (response && response.data) {
      let silver = response.data.pre_re_silver;
      return silver;
    } else {
      return -1;
    }
  } catch (error) {
    console.log("Error:", error);
  }
}
async function getDuihuanInfo(cookie, id) {
  const request = {
    url: `https://zhiyou.m.smzdm.com/duihuan/good/ajax_get_info?spu_id=${id}&time=1684381886681`,
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
    if (response.data.pickup_total < response.data.price_total_num) {
      return response;
    } else {
      return -1;
    }
  } catch (error) {
    console.error("Error:", error);
  }
}
async function exchangeGiftCard(cookie, obj) {
  if (!cookie.split(/en_safepass=(.+?);/)[1]) {
    return -1;
  }
  let newData = {
    buy_num: 1,
    weixin: 1,
    deduct_type: 2,
    f: "android",
    v: "10.4.26",
    en_safepass: cookie.split(/en_safepass=(.+?);/)[1],
    price_id: obj[2],
    sku_id: obj[0],
    time: `${Math.round(new Date().getTime() / 1000)}000`,
    basic_v: 0,
    spu_id: obj[1],
  };
  var data = sign(newData);
  const request = {
    url: "https://user-api.smzdm.com/duihuan_v2/add_order",
    headers: {
      Accept: "*/*",
      "Accept-Language": "zh-Hans-CN;q=1",
      "Accept-Encoding": "gzip",
      request_key: "337289661683639712",
      "User-Agent": "smzdm_android_V10.4.26 rv:866 (M2011K2C;Android12;zh)smzdmapp",
      Cookie: cookie,
    },
    body: objectToUrlParams(data),
  };

  try {
    let response = await Post(request);
    if (response && response.data) {
      return response.data.order_no;
    } else {
      return -2;
    }
  } catch (error) {
    console.log("Error:", error);
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
function sign(newData) {
  let keys = Object.keys(newData)
    .filter((key) => newData[key] !== "")
    .sort();
  let signData = keys.map((key) => `${key}=${String(newData[key]).replace(/\s+/, "")}`).join("&");
  let sign = crypto.createHash("md5").update(`${signData}&key=${SIGN_KEY}`).digest("hex").toUpperCase();
  return {
    ...newData,
    sign,
  };
}

function objectToUrlParams(obj) {
  return Object.keys(obj)
    .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(obj[key])}`)
    .join("&");
}
function findBestduihuanList(list, mysilver) {
  let closestArr = null;
  for (let arr of list) {
    if (arr.silver <= mysilver) {
      if (!closestArr || arr.silver > closestArr.silver) {
        closestArr = arr;
      }
    }
  }
  return closestArr;
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
    url: `https://gitcode.net/u013276346/x6/-/raw/master/version.json`,
  };
  let response = await Get(request);
  let versionData = response;
  let script = versionData.scripts.find((s) => s.name === scriptName);
  if (script) {
    let currentVersion = version;
    if (currentVersion !== script.version) {
      log(`发现新版本！请更新脚本`);
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
      console.log(`订单号 ${maskOrderNumber(order)} 已添加到ID:${smzdmid}`);
    } else {
      accounts.push({
        smzdmid,
        orders: [order],
      });
      console.log(`ID:${smzdmid} 已创建，并添加订单号:${maskOrderNumber(order)}`);
    }
  } else if (action === "delete") {
    if (account) {
      if (order) {
        const index = account.orders.indexOf(order);
        if (index !== -1) {
          account.orders.splice(index, 1);
          console.log(`订单号${maskOrderNumber(order)}已从ID:${smzdmid}中删除`);
        } else {
          console.log(`ID:${smzdmid}中不存在订单号${maskOrderNumber(order)}`);
        }
      } else {
        const index = accounts.indexOf(account);
        accounts.splice(index, 1);
        console.log(`ID:${smzdmid} 已删除`);
      }
    } else {
      console.log(`未找到ID:${smzdmid}`);
    }
  } else {
    console.log(`无效的操作：${action}`);
  }
}
function maskOrderNumber(orderNumber, placeholder = "X", start = 9, end = 19) {
  const visiblePart = orderNumber.substring(start, end);
  const maskedPart = placeholder.repeat(end - start);
  return orderNumber.replace(visiblePart, maskedPart);
}
