/*
 @Author: x6
 @Date: 2023-05-20 09:45:07
 @LastEditors: Please set LastEditors
 @LastEditTime: 2023-05-30 20:37:53
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
const version = "1.0.3";
const filePath = "orders.json";
const SIGN_KEY = "apr1$AwP!wRRT$gJ/q.X24poeBInlUJC";
const cookie =
  ($.isNode() ? process.env.SMZDM_COOKIE : $.getdata("SMZDM_COOKIE")) ||
  `partner_name=smzdm_wap;sess=BB-08yL%2BDIlReCTFo83EiCbx2T5%2FlG9YZMQ3LMVKAZKYO%2BTjuLkeBXoE6k9xaKatQE9n7GYnpMTtFv9fPC0PS7hS%2FQUx3w%3D;pid=70L%2FnKoAI1Cu1%2F2U%2Blfni70RClwG%2BdBf%2FhkLMZvMQa9zbfQDpoHn1A%3D%3D;device_type=XiaomiM2011K2C;sessionID=ad38b9a08824331839a8040b31cb47af.1680667335824;basic_v=0;login=1;client_id=ad38b9a08824331839a8040b31cb47af.1680584693492;register_time=1680584785;network=1;device_system_version=12;partner_id=165;device_s=86fd37f2a0244cf03638889e6584b781;smzdm_version=10.4.35;ab_test=t;device_smzdm=android;oaid=f92e211f2ecc0355d7a62ac0cf9c2ed6;apk_partner_name=smzdm_wap;smzdm_id=8392968568;device_id=ad38b9a08824331839a8040b31cb47af;device_push=1;apk_partner_id=165;session_id=ad38b9a08824331839a8040b31cb47af.1680667335824;device_smzdm_version=10.4.35;rs_id2=;active_time=1680584698;rs_id1=;rs_id4=;rs_id3=;rs_id5=;new_device_id=86fd37f2a0244cf03638889e6584b781;is_new_user=1;imei=;last_article_info=;android_id=86fd37f2a0244cf03638889e6584b781;device_recfeed_setting=%7B%22haojia_recfeed_switch%22%3A%221%22%2C%22homepage_sort_switch%22%3A%221%22%2C%22other_recfeed_switch%22%3A%221%22%2C%22shequ_recfeed_switch%22%3A%221%22%7D;device_smzdm_version_code=875;en_safepass=764USZO4gXvKd7tULMtcnw==;&partner_name=smzdm_wap;sess=BB-gj1CO2H8GO2DCiphS8aNuzKkbjfNpifGYsV4ayST9wg8HB7hrVhyPP0X3APLrssBm9Efz8X6ndQtlYgWYpd1eq1mIKs%3D;pid=IWV9LSKmFX9hlkdXWpIM%2B0A4a1%2FE2ELmiPbLp52MafZzbfQDpoHn1A%3D%3D;device_type=XiaomiM2011K2C;sessionID=eb7a8c8673d253c394dd14abc24c7bc0.1680667574037;basic_v=0;login=1;client_id=eb7a8c8673d253c394dd14abc24c7bc0.1680667573983;register_time=1680667652;network=1;device_system_version=12;partner_id=165;device_s=cfc3ea53c6ae69a2c426e0235f72514f;smzdm_version=10.4.35;ab_test=j;device_smzdm=android;oaid=f92e211f2ecc0355d7a62ac0cf9c2ed6;apk_partner_name=smzdm_wap;smzdm_id=5467937262;device_id=eb7a8c8673d253c394dd14abc24c7bc0;device_push=1;apk_partner_id=165;session_id=eb7a8c8673d253c394dd14abc24c7bc0.1680667574037;device_smzdm_version=10.4.35;rs_id2=;active_time=1680667577;rs_id1=;rs_id4=;rs_id3=;rs_id5=;new_device_id=cfc3ea53c6ae69a2c426e0235f72514f;is_new_user=1;imei=;last_article_info=;android_id=cfc3ea53c6ae69a2c426e0235f72514f;device_recfeed_setting=%7B%22haojia_recfeed_switch%22%3A%221%22%2C%22homepage_sort_switch%22%3A%221%22%2C%22other_recfeed_switch%22%3A%221%22%2C%22shequ_recfeed_switch%22%3A%221%22%7D;device_smzdm_version_code=875;en_safepass=eRdlf+2jObO10lXnMT4tNg==;&session_id=kUK8t3%2BCPDAk8x4wA3EEeQfFcHeQkjoX33PCYE7Dnksq72%2BpVZuV5Q%3D%3D.1681911953;basic_v=0;device_s=kUK8t3CPDAk8x4wA3EEeQfFcHeQkjoX33PCYE7DnkuU1Iad9BgM0uksj3rhGhXN%2FfiUJC0CxY%3D;partner_id=31559;partner_name=iweibo559;device_recfeed_setting=%7B%22homepage_sort_switch%22%3A%221%22%2C%22haojia_recfeed_switch%22%3A%221%22%2C%22other_recfeed_switch%22%3A%221%22%2C%22shequ_recfeed_switch%22%3A%221%22%7D;phone_sort=8X;register_time=1678247169;f=iphone;device_id=kUK8t3%2BCPDAk8x4wA3EEeQfFcHeQkjoX33PCYE7Dnksq72%2BpVZuV5Q%3D%3D;device_name=iPhone%2014%20Plus;is_new_user=0;apk_partner_name=appstore;active_time=1678247161;v=10.4.40;last_article_info=%7B%22article_id%22%3A%2276784193%22%2C%22article_channel_id%22%3A%222%22%7D;is_dark_mode=0;device_smzdm_version_code=137.6;device_smzdm_version=10.4.40;device_system_version=16.3.1;sess=BC-2NSGZZDwaeUadIXlkDebDjsYXoVB%2FHiOgJ%2BY2OlOk4FT0rVMdFBwNKBFLhP1Tj9SmMP5g3%2BWxMFQpYUj%2BDdsaDPZBgCw524cUFRp1IaRRuNT2uxvCMIhlptpWA%3D%3D;login=1;client_id=5c570678eae2dfe049ea8fcfdd061a8b.1678247158462;osversion=20D67;device_idfa=kUK8t3%2BCPDAk8x4wA3EEeTataOsuNY9kkCJWHiCdKyqNW6ksIHFsyw%3D%3D;network=1;smzdm_id=6228096632;device_push=notifications_are_disabled;ab_test=z2;device_type=iPhone14%2C8;font_size=normal;device_smzdm=iphone;en_safepass=yGwT/QRC7fDSL2V/Ns5wAw==;&partner_name=xiaomi;sess=BB-gPxhqHQbsEpqbVwuLEiDKOU1l1FBxpdXhlYbPg1OND17kjHENu7aH9NO9pI9ZakIdD%2BCDN1B23CuioCMiHtHeDQLrcA%3D;pid=mWpvSi%2BLL1IWbuGcBLRUHrsRc33KXAike8tetgMqFi9zbfQDpoHn1A%3D%3D;device_type=blacksharkSKW-A0;sessionID=e2e6121e52da1dd1fe6dba976d994a73.1681978030345;basic_v=0;login=1;client_id=e2e6121e52da1dd1fe6dba976d994a73.1681978030241;register_time=1681977913;network=1;device_system_version=9;partner_id=20;device_s=0ce2864c5544fd0620affc048d0a57e5;smzdm_version=10.4.40;ab_test=z7;device_smzdm=android;oaid=;apk_partner_name=xiaomi;smzdm_id=6114232534;device_id=e2e6121e52da1dd1fe6dba976d994a73;device_push=1;apk_partner_id=20;session_id=e2e6121e52da1dd1fe6dba976d994a73.1681978030345;device_smzdm_version=10.4.40;rs_id2=;active_time=1681978038;rs_id1=;rs_id4=;rs_id3=;rs_id5=;new_device_id=0ce2864c5544fd0620affc048d0a57e5;is_new_user=1;imei=;last_article_info=;android_id=0ce2864c5544fd0620affc048d0a57e5;device_recfeed_setting=%7B%22haojia_recfeed_switch%22%3A%221%22%2C%22homepage_sort_switch%22%3A%221%22%2C%22other_recfeed_switch%22%3A%221%22%2C%22shequ_recfeed_switch%22%3A%221%22%7D;device_smzdm_version_code=880;en_safepass=kzhR60SvPyH0bSygXTSPMw==;`;
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
              log(`账号[${i + 1}]兑换成功: 订单号[${orderid}] 状态[订单审核中...]`);
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
      let filteredData = list.filter(
        (item) => item.silver !== 0 && item.coupon_short_title.includes(Keyword + "礼品卡")
      );
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
    url: `https://raw.githubusercontent.com/fwktls/x6/master/version.json`,
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
      console.log(`订单号 ${order} 已添加到ID:${smzdmid}`);
    } else {
      accounts.push({
        smzdmid,
        orders: [order],
      });
      console.log(`ID:${smzdmid} 已创建，并添加订单号:${order}`);
    }
  } else if (action === "delete") {
    if (account) {
      if (order) {
        const index = account.orders.indexOf(order);
        if (index !== -1) {
          account.orders.splice(index, 1);
          console.log(`订单号${order}已从ID:${smzdmid}中删除`);
        } else {
          console.log(`ID:${smzdmid}中不存在订单号${order}`);
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
