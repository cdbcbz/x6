/*
    不要充钱 不要充钱 不要充钱 重要的事说三遍
    可以挂机白嫖 也可以试玩游戏 但是不要充钱 
    自动提现还没写 等号里有钱再加上
    可能要跑路了2
    cron:0 11 * * *
    const $ = new Env("指尖修真");
    变量名 zjxz 值 手机号#密码 多号用&分割 例如 123#123&456#456
 注册链接 http://finger.quliao.vip:82/h5/#/pages/login/qr?code=021582

 */
const Env = require("./common/Env");
const $ = new Env("指尖修真");
const url = "http://finger.quliao.vip:82";
let msg = "";
let phone = ($.isNode() ? process.env.zjxz : $.getdata("zjxz")) || "";
let isnotify =
  ($.isNode() ? process.env.isnotify : $.getdata("isnotify")) || "true"; //是否开启推送 0关闭1开启
let UserAgent =
  ($.isNode() ? process.env.zjxzUserAgent : $.getdata("zjxzUserAgent")) ||
  "Mozilla/5.0 (Linux; Android 12; M2011K2C Build/SKQ1.211006.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/95.0.4638.74 Mobile Safari/537.36 uni-app Html5Plus/1.0";
const notify = $.isNode() ? require("./sendNotify") : "";
let phoneArr = [];
let jftoken, jfid, advert_today_nums;
!(async () => {
  phoneArr = phone.split("&");
  if (!phone) {
    $.log("请先填写变量");
    return;
  }
  $.log("------------- 共" + phoneArr.length + "个账号-------------");

  for (let i = 0; i < phoneArr.length; i++) {
    var user = phoneArr[i].split("#");

    await userlogin(user);
    await getUserInfo();

    if (advert_today_nums < 5) {
      for (let i = 0; i < 5 - advert_today_nums; i++) {
        await getAdvertSignBack();
        await $.wait(20000);
      }
    } else {
      $.log("[" + jfid + "]广告观看次数:" + advert_today_nums + " 已超次数！");
    }
    await taskList();
  }
})()
  .catch((err) => $.logErr(err))
  .finally(() => $.done());
async function userlogin(data) {
  return new Promise((resolve) => {
    var request = {
      url: url + "/home/index/login",
      headers: {
        "User-Agent": UserAgent,
        "Content-Type": "application/json;charset=utf-8",
      },
      body: '{"account":"' + data[0] + '","pwd":"' + data[1] + '"}',
    };
    $.post(request, async (error, response) => {
      try {
        if (error) {
          console.log("⛔️API查询请求失败❌ ‼️‼️");
          console.log(JSON.stringify(error));
        } else {
          var result = JSON.parse(response.body);
          if (result.code == 1) {
            resolve(result.token);
            jftoken = result.token;
            jfid = result.data.id;
            $.log("[" + data[0] + "]" + result.msg + "用户id[" + jfid + "]");
          } else {
            resolve(result.msg);
            $.log("[" + data[0] + "]" + result.msg);
          }
        }
      } catch (e) {
        $.logErr(e, response);
      } finally {
        resolve();
      }
    });
  });
}

async function getUserInfo() {
  return new Promise((resolve) => {
    var request = {
      url: url + "/home/user/getUserInfo",
      headers: {
        "User-Agent": UserAgent,
        "Content-Type": "application/json;charset=utf-8",
        "jf-token": jftoken,
        "jf-id": jfid,
      },
    };
    $.get(request, async (error, response) => {
      try {
        if (error) {
          console.log("⛔️API查询请求失败❌ ‼️‼️");
          console.log(JSON.stringify(error));
        } else {
          var result = JSON.parse(response.body);
          if (result.code == 1) {
            $.log(
              "[" +
                jfid +
                "]仙玉:" +
                result.data.jade +
                " 当前等级:" +
                result.data.level +
                " 当前境界每日仙玉:" +
                result.data.dayReward +
                " 当前境界剩余仙玉:" +
                result.data.receReward
            );
            advert_today_nums = result.data.advert_today_nums;
          } else {
            resolve(result.msg);
            $.log("[" + jfid + "]" + result.msg);
          }
        }
      } catch (e) {
        $.logErr(e, response);
      } finally {
        resolve();
      }
    });
  });
}
async function getAdvertSignBack() {
  return new Promise((resolve) => {
    var request = {
      url: url + "/home/index/getAdvertSignBack",
      headers: {
        "User-Agent": UserAgent,
        "Content-Type": "application/json;charset=utf-8",
        "jf-token": jftoken,
        "jf-id": jfid,
      },
      body:
        '{"sign":"86132a609f48607d0405e2df65ebd320daedf9f4d69ab1b13484632a8daed9e6","user_id":' +
        jfid +
        ',"extra":3}',
    };
    $.post(request, async (error, response) => {
      try {
        if (error) {
          console.log("⛔️API查询请求失败❌ ‼️‼️");
          console.log(JSON.stringify(error));
        } else {
          var result = response.body;
          if (result == "success") {
            $.log("[" + jfid + "]看广告:" + result);
          } else {
            resolve(result.msg);
            $.log("[" + jfid + "]看广告:" + result);
          }
        }
      } catch (e) {
        $.logErr(e, response);
      } finally {
        resolve();
      }
    });
  });
}
async function taskList() {
  return new Promise((resolve) => {
    var request = {
      url: url + "/home/task/taskList",
      headers: {
        "User-Agent": UserAgent,
        "Content-Type": "application/json;charset=utf-8",
        "jf-token": jftoken,
        "jf-id": jfid,
      },
      body: "{}",
    };
    $.post(request, async (error, response) => {
      try {
        if (error) {
          console.log("⛔️API查询请求失败❌ ‼️‼️");
          console.log(JSON.stringify(error));
        } else {
          var result = JSON.parse(response.body);
          if (result.code == 1) {
            for (let i = 0; i < result.data.length; i++) {
              if (!result.data[i].is_rece) {
                $.log("[" + jfid + "]境界突破:LV" + result.data[i].lv);
                await openLv(result.data[i].lv);
                break;
              }
            }
          } else {
            resolve(result.msg);
            $.log("[" + jfid + "]任务列表:" + response.body);
          }
        }
      } catch (e) {
        $.logErr(e, response);
      } finally {
        resolve();
      }
    });
  });
}
async function openLv(lv) {
  return new Promise((resolve) => {
    var request = {
      url: url + "/home/task/openLv",
      headers: {
        "User-Agent": UserAgent,
        "Content-Type": "application/json;charset=utf-8",
        "jf-token": jftoken,
        "jf-id": jfid,
      },
      body: '{"lv":' + lv + "}",
    };
    $.post(request, async (error, response) => {
      try {
        if (error) {
          console.log("⛔️API查询请求失败❌ ‼️‼️");
          console.log(JSON.stringify(error));
        } else {
          var result = JSON.parse(response.body);
          if (result.code == 1) {
            resolve(result.msg);
            $.log("[" + jfid + "]境界突破:" + result.msg);
            await getState(lv);
          } else {
            resolve(result.msg);
            $.log("[" + jfid + "]境界突破:" + result.msg);
          }
        }
      } catch (e) {
        $.logErr(e, response);
      } finally {
        resolve();
      }
    });
  });
}
async function getState(lv) {
  return new Promise((resolve) => {
    var request = {
      url: url + "/home/task/getState",
      headers: {
        "User-Agent": UserAgent,
        "Content-Type": "application/json;charset=utf-8",
        "jf-token": jftoken,
        "jf-id": jfid,
      },
      body: '{"lv":' + lv + "}",
    };
    $.post(request, async (error, response) => {
      try {
        if (error) {
          console.log("⛔️API查询请求失败❌ ‼️‼️");
          console.log(JSON.stringify(error));
        } else {
          var result = JSON.parse(response.body);
          if (result.code == 1) {
            resolve(result.msg);
            $.log("[" + jfid + "]境界副本:" + result.msg);
          } else {
            resolve(result.msg);
            $.log("[" + jfid + "]境界副本:" + result.msg);
          }
        }
      } catch (e) {
        $.logErr(e, response);
      } finally {
        resolve();
      }
    });
  });
}
