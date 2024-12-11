// 休眠等待
function sleep(d) {
    for (var t = Date.now(); Date.now() - t <= d;) ;
}

// 打印日志
function log(message) {
    console.log(`[${new Date().toLocaleString()}] ${message}`);
}

// 获取任务执行的时间
function getCurrentTime() {
    const now = new Date();
    return now.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });
}

// 从cookie中提取vqq_vusession 用于保持对话
function getVqqVusessionFromCookie(cookieStr) {
    // 使用正则表达式匹配vqq_vusession的值
    const regex = /vqq_vusession=([^;]+)/;
    const match = cookieStr.match(regex);

    // 如果匹配成功，返回匹配的值
    if (match && match[1]) {
        return match[1];
    } else {
        return null; // 如果没有找到匹配项，返回null
    }
}

// 判断cookie是否过期，一般是24h
function isCookieValid(response) {
    if (response && response.code !== 0) {
        if (response.msg && response.msg.includes("未登录")) {
            return false; // Cookie 已失效
        }
    }
    return true; // Cookie 仍然有效
}

// bark推送消息
function sendBarkNotification(message, barkUrl) {
    if (barkUrl && message) {
        const BARK_ICON = "https://pic.imgdb.cn/item/674eaf2ed0e0a243d4dc8e2a.png";
        const url = barkUrl + "/【NBA2kOnline2】" + "/" + encodeURIComponent(message) + "/" + "?icon=" + BARK_ICON;
        try {
            HTTP.get(url, {
                headers: {"Content-Type": "application/x-www-form-urlencoded"}
            });
            log("Bark通知发送成功 ✔️✔️✔️");
        } catch (error) {
            log("Bark通知发送失败 ❌❌❌ " + error.message);
        }
    }
}

// 获取礼包名称的函数
function getGiftName(giftId) {
    const giftNames = {
        "22921": "现役基础球星包x1(青铜会员礼包)",
        "22922": "平台高级特权福利包x1(白银会员礼包)",
        "22923": "现役当家球星包x1(黄金会员礼包)",
        "22924": "平台至尊特权福利包x1(铂金会员礼包)",
        "22925": "现役基础球星包x1(青铜会员周礼包)",
        "22927": "现役人气球员包x1(爱玩每日礼包)",
        "22926": "现役基础球星包x1(爱玩每周礼包)",
        "22928": "现役基础球星包x1(爱玩每月礼包)",
    };
    return giftNames[giftId] || "未知礼包";
}

// 领取礼包并推送Bark通知
async function checkAndNotify(barkUrl) {
    let currentTime = getCurrentTime();
    let overallResults = {
        腾讯爱玩小程序端: {success: [], fail: []},
        腾讯爱玩APP端: {success: [], fail: []},
        腾讯爱玩PC端: {success: [], fail: []}
    };

    // 浏览器打开  https://iwan.video.qq.com/game-community/game-center/home?ztid=i84uks67xq
    // 按F12 输入 document.cookie 获取cookie

    // 复制这个结果到这里替换pc_cookie
    const pc_cookie = `这里填你的cookie`

    const newSession = getVqqVusessionFromCookie(pc_cookie)
    // 这里填入你小程序抓包获得的cookie,vqq_vusession每24h会更新,代码中通过pc端获取然后替换
    const micro_cookie = `xxx; vqq_vusession=${newSession}`
    // 同小程序cookie获取方式
    const app_cookie = `xxx; vqq_vusession=${newSession}`

    // 小程序端请求配置
    const microRequestConfig = {
        url: "https://api.iwan.qq.com/trpc.iwan.welfare_fast_proxy.WelfareFastProxyService/SendBatch",
        headers: {
            "Host": "api.iwan.qq.com",
            "Accept": "application/json, text/plain, */*",
            "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.53(0x18003531) NetType/WIFI Language/zh_CN",
            "Cookie": micro_cookie
        },
        requestData: {
            "gift_ids": ["22921", "22922", "22923", "22924", "22925", "22926", "22927"],
            "scene": "official.gamecenter",
            "ext": {
                "partition": "30",
                "plat": "1",
                "area": "-1",
                "role_id": "353974082",
                "platform_id": "6"
            }
        }
    };

    // 腾讯视频APP端请求配置
    const appRequestConfig = {
        url: "https://api.iwan.qq.com/trpc.iwan.welfare_fast_proxy.WelfareFastProxyService/SendBatch",
        headers: {
            "Host": "api.iwan.qq.com",
            "Content-Type": "application/json",
            "Origin": "https://iwan.qq.com",
            "Referer": "https://iwan.qq.com/",
            "Accept": "application/json, text/plain, */*",
            "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0_1 like Mac OS X) AppleWebKit/537.51.1 (KHTML, like Gecko) Mobile/11A465 QQLiveBrowser/8.11.15 AppType/UN WebKitCore/WKWebView iOS GDTTangramMobSDK/4.370.6 GDTMobSDK/4.370.6 cellPhone/iPhone 11 AppBuild/25081",
            "Cookie": app_cookie
        },
        requestData: {
            "gift_ids": ["22921", "22922", "22923", "22924", "22925", "22926", "22927"],
            "scene": "video.gamecenter",
            "ext": {
                "partition": "30",
                "plat": "1",
                "area": "-1",
                "role_id": "353974082",
                "platform_id": "9"
            }
        }
    };

    // PC端请求配置
    const pcRequestConfig = {
        url: "https://pbaccess.video.qq.com/trpc.iwan.welfare_fast_proxy.WelfareFastProxyService/SendBatch",
        headers: {
            "sec-ch-ua": '"Not:A-Brand";v="99", "Chromium";v="112"',
            "Content-Type": "application/json",
            "Origin": "https://iwan.video.qq.com",
            "Referer": "https://iwan.video.qq.com/",
            "Accept": "application/json, text/plain, */*",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36 QuarkPC/1.10.0.172",
            "Cookie": pc_cookie
        },
        requestData: {
            "gift_ids": ["22921", "22922", "22923", "22924", "22925", "22926", "22927"],
            "scene": "pc.video.gamecenter",
            "ext": {
                "role_id": "353974082",
                "area": "-1",
                "partition": "30",
                "plat": "1",
                "platform_id": "h"
            }
        }
    };

// 发送请求的通用函数
    function sendGiftRequest(config) {
        try {
            const body = JSON.stringify(config.requestData);
            const resp = HTTP.post(config.url, body, {headers: config.headers});
            if (resp.status === 200) {
                const responseData = JSON.parse(resp.text());
                // 检查Cookie有效性
                if (!isCookieValid(responseData)) {
                    log(`⚠️⚠️⚠️ ${config.platform} - Cookie已失效,请更新Cookie!`);
                    if (barkUrl) {
                        sendBarkNotification(`${config.platform} - Cookie已失效,请更新Cookie!`, barkUrl);
                    }
                    log("请手动获取 cookie,浏览器打开 https://iwan.video.qq.com/game-community/game-center/home?ztid=i84uks67xq ,按 F12 输入 document.cookie 并复制结果替换cookie.");

                    return false; // 中止处理
                }
                if (responseData.code === 0) {
                    config.requestData.gift_ids.forEach(giftId => {
                        const giftResult = responseData.data[giftId];
                        if (giftResult) {
                            if (giftResult.result_code === 0) {
                                const successMessage = getGiftName(giftId) + ": " + (giftResult.result_msg || "礼包领取成功");
                                overallResults[config.platform].success.push({giftId, message: successMessage});
                                log(`领取成功: ${config.platform} -> ${successMessage} ✅`);
                            }
                            // 已领过的就不再通知了
                            // else if (giftResult.result_msg && giftResult.result_msg.includes("您已经领过此礼包")) {
                            //     log("📢📢📢" + config.platform + getGiftName(giftId) + ": " + "已领")
                            //     overallResults[config.platform].fail.push({
                            //         giftId,
                            //         message: getGiftName(giftId) + ": " + "已领"
                            //     });
                            // }
                        }
                    });
                } else {
                    log(`❌❌❌${config.platform}请求失败: ${responseData.msg}`);
                }
            } else {
                log(`❌❌❌${config.platform}请求失败 - HTTP状态码: ${resp.status}`);
            }
        } catch (error) {
            log(`❌❌❌${config.platform}请求异常: ${error.message}`);
        }
    }

    // 为每个平台添加平台标识
    microRequestConfig.platform = '腾讯爱玩小程序端';
    appRequestConfig.platform = '腾讯爱玩APP端';
    pcRequestConfig.platform = '腾讯爱玩PC端';

    // 发送所有平台的请求
    sendGiftRequest(microRequestConfig);
    sendGiftRequest(appRequestConfig);
    sendGiftRequest(pcRequestConfig);

    // 构建通知消息
    let notificationMessage = `NBA2KOL2礼包领取 ${currentTime}\n`;

    // 添加成功的礼包
    ['腾讯爱玩小程序端', '腾讯爱玩APP端', '腾讯爱玩PC端'].forEach(platform => {
        if (overallResults[platform].success.length > 0) {
            notificationMessage += `${platform.toUpperCase()} 成功领取:\n`;
            overallResults[platform].success.forEach(item => {
                notificationMessage += `- ${item.message}\n`;
            });
        }
    });

    // 添加失败的礼包 失败暂不推送
    ['腾讯爱玩小程序端', '腾讯爱玩APP端', '腾讯爱玩PC端'].forEach(platform => {
        if (overallResults[platform].fail.length > 0) {
            notificationMessage += `${platform.toUpperCase()} 领取失败:\n`;
            overallResults[platform].fail.forEach(item => {
                notificationMessage += `- ${item.message}\n`;
            });
        }
    });

    // 发送通知
    if (barkUrl) {
        sendBarkNotification(notificationMessage, barkUrl);
    }

    return overallResults;
}

// Bark推送URL 这里也可以修改你自己的server
const BARK_URL = "https://bark-server-u95b.onrender.com/hello";

// 执行礼包领取
checkAndNotify(BARK_URL);