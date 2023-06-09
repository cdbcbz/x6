<!--

* @Author: x6
* @Date: 2023-02-04 19:13:53
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2023-06-09 10:45:59
 * @FilePath: \mangfu\README.md
    -->

# 自用青龙脚本库

杂七杂八的脚本

# 青龙订阅

github

```js
ql repo https://github.com/fwktls/x6.git "" "cookie|common" "common"
```

# QuantumultX  食用说明

实现 QuantumultX 获取到 cookie 等信息后，直接添加到青龙面板。

青龙应用只需要环境变量权限。

## 创建青龙配置任务

QuantumultX 添加任务，然后修改脚本中的青龙面板 url id secret，然后运行一次，将其储存于持久化数据中，就完事了。

```js
/*
复制
一定要修改三个参数
url可以是外网也可以内网 
只要你手机可以访问到

*/
var qlconf = {
  url: "http://192.168.31.111:5700",
  id: "SPn3LUTD-Stb",
  secret: "JZ-6_dU6ZYRi92xe6sSQ1QcR",
};
$prefs.setValueForKey(JSON.stringify(qlconf), "qlconf");
var ql = $prefs.valueForKey("qlconf");
console.log(ql);
$done({});
```

## [rewrite_remote] 订阅重写配置

github

```
https://raw.githubusercontent.com/fwktls/x6/master/github_Cookie.conf, tag=获取cookie, update-interval=172800, opt-parser=false, enabled=true
```

## 有需要抓 ck 的 APP/网站 提交议题

提供 APP/网站 名 脚本变量名 触发路径 需要抓的内容 比如完整的 cookie 或者 cookie 指定的字段等等

### 目前支持的 APP/网站 列表：

| 序号 |         脚本名         |       触发        |   版本    |
| :--: | :--------------------: | :---------------: | :-------: |
|  1   | ~~番茄小说(脚本凉了)~~ |   ~~首页-签到~~   | ~~5.6.7~~ |
|  2   |       什么值得买       |    我的-签到页    |  10.4.40  |
|  3   |        中国联通        | 打开 APP 即可触发 |   10.3    |
