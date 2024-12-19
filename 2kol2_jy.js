/*
    name: "NBA2KOL2 交易市场"
    脚本兼容: 金山文档
    更新时间：20241211
    说明：获取收藏夹中的球员,根据历史交易最高价和最低价推荐是否适合抄底;结果会写入NBA2K表格中,方便后续查看
    备注：本脚本中openid、access_token、nonseStr、sign需要自行获取，具体请参考README.md文档
*/

// 格式化当前时间为 yyyy-mm-dd HH:mm
function getCurrentTime() {
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}`;
}

// 随机等待函数
function randomSleepSync(minMs, maxMs) {
    const delay = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
    const start = Date.now();
    while (Date.now() - start < delay) {
        // 空循环，阻塞执行
    }
}

// 发送 Bark 推送通知
async function sendBarkNotification(notifications) {
    const BARK_URL = "填入你的bark_server";
    const QQ_URL = "mqq://card/show_pslcard?card_type=0&source=share&version=1&uin=你的QQ号码"; // 这里填入你的QQ号码，点击推送信息可以跳转至QQ页面
    const BARK_ICON = "https://pic.imgdb.cn/item/674eaf2ed0e0a243d4dc8e2a.png";

    if (notifications.length > 0) {
        const currentTime = getCurrentTime();
        const message = `抄底名单：\n${currentTime}\n${notifications.map(n => `${n.playerName}【${n.price}】`).join('\n')}`;
        const encodedMessage = encodeURIComponent(message);
        // const encodedJumpUrl = `&url=${encodeURIComponent(QQ_URL)}`;
        const url = `${BARK_URL}/【🏀NBA2KL2抄底提醒】/${encodedMessage}?icon=${BARK_ICON}`;

        try {
            HTTP.get(url);
            console.log(`Bark通知发送成功`);
        } catch (error) {
            console.log(`Bark通知发送失败: ${error.message}`);
        }
    }
}


// 检查并创建工作表
function checkAndCreateSheet(sheetName) {
    try {
        let sheet = Application.Worksheets(sheetName);
        if (!sheet) {
            sheet = Application.Worksheets.Add();
            sheet.Name = sheetName;

            sheet.Range("A1").Value = "时间";
            sheet.Range("B1").Value = "球员名称";
            sheet.Range("C1").Value = "市场价格(单卡)";
            sheet.Range("D1").Value = "市场价格(总价)";
            sheet.Range("E1").Value = "是否通知";
            sheet.Range("F1").Value = "购物券";
            sheet.Range("G1").Value = "合同费";
            sheet.Range("H1").Value = "消费券";

            sheet.Range("A1:H1").Font.Bold = true; // 加粗
            sheet.Range("A1:H1").HorizontalAlignment = -4108; // 居中
            sheet.Columns("A:H").AutoFit(); // 宽度自适应
        }

        sheet.Activate();
        return true;
    } catch (error) {
        console.log(`创建/激活工作表失败: ${error.message}`);
        return false;
    }
}
// 获取用户资金状态
async function getUserFunds() {
    try {
        const fundUrl = `https://nba2k2app.game.qq.com/user/game/fundAndStatus`;
        const params = {
            appName: 'nba2kx',
            openid: '填入你的openid',
            access_token: '填入你的access_token',
            login_channel: 'qq',
            timeStamp: Date.now(),
            nonseStr: '填入你的nonseStr',
            sign: '填入你的sign'
        };

        const queryString = Object.entries(params)
            .map(([key, value]) => `${key}=${value}`)
            .join('&');

        const resp = HTTP.get(`${fundUrl}?${queryString}`);

        if (resp.status === 200) {
            const fundData = JSON.parse(resp.text());
            return fundData.data.userFund;
        }
        return null;
    } catch (error) {
        console.log(`获取资金状态失败: ${error.message}`);
        return null;
    }
}

// 将资金信息写入表格
function writeFundsToSheet(funds) {
    let sheet = Application.ActiveSheet;
    let lastRow = sheet.UsedRange.Rows.Count;

    // 更新最后一行的资金信息
    sheet.Range("F" + lastRow).Value = funds.shopCredit;
    sheet.Range("G" + lastRow).Value = funds.contract;
    sheet.Range("H" + lastRow).Value = funds.credit;

    sheet.Columns("A:H").AutoFit();
}

// 查询收藏球员
async function checkFavoriteRosters() {
    try {
        const favoriteUrl = "https://nba2k2app.game.qq.com/user/favorite/rosters";
        const params = {
            openid: "你的openid",
            access_token: "填入你的access_token",
            orderBy: "OverAll",
            orientation: "desc",
            login_channel: "qq",
            timeStamp: Date.now(),
            nonseStr: "wEM6W",
            sign: "填入你的sign"
        };

        const headers = {
            "Host": "nba2k2app.game.qq.com",
            "Accept": "*/*",
            "Content-Type": "application/json;charset=utf-8",
            "Cookie": "pgv_pvid=7458155014; eas_sid=I1v7p3G3Y0T4p1v232L153P511",
            "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 NBA2KOL2HelperI/2.0.0(1.492)",
            "Accept-Language": "zh-CN,zh-Hans;q=0.9",
            "Accept-Encoding": "gzip, deflate, br",
            "Connection": "keep-alive"
        };

        const queryString = Object.entries(params)
            .map(([key, value]) => `${key}=${value}`)
            .join('&');
        const fullUrl = `${favoriteUrl}?${queryString}`;

        const resp = HTTP.get(fullUrl, { headers: headers });
        if (resp.status === 200) {
            const favoritesData = JSON.parse(resp.text());
            return parseFavoriteRosters(favoritesData.data.rosterList);
        } else {
            console.log(`查询失败 - HTTP状态码: ${resp.status}`);
            return null;
        }
    } catch (error) {
        console.log(`查询异常: ${error.message}`);
        return null;
    }
}

// 查询球员当前市场最低价
async function getPlayerPriceHistory(player) {
    try {
        const timeStamp = Date.now();
        const priceUrl = `https://nba2k2app.game.qq.com/game/trade/roster?openid=填入你的openid&access_token=填入你的access_token&playerId=${player.playerId}&grade=7&login_channel=qq&timeStamp=${timeStamp}&nonseStr=9gki9&sign=填入你的sign`;

        const resp = HTTP.get(priceUrl);
        if (resp.status === 200) {
            const priceData = JSON.parse(resp.text());
            if (!priceData.data || !priceData.data.inventory || priceData.data.inventory.length === 0) {
                return {
                    marketPrice: 0,
                    isOutOfStock: true
                };
            }
            return {
                marketPrice: priceData.data.inventory[0].price,
                lowestBuyPrice: priceData.data.price.lowerBuyPrice,
                isOutOfStock: false
            };
        }
        return null;
    } catch (error) {
        console.log(`价格查询异常: ${error.message}`);
        return null;
    }
}

// 将数据写入表格
function writeToTable(playerData) {
   if (checkAndCreateSheet("NBA2K")) {
       console.log(`开始写入球员 ${playerData.playerName} 的数据`);

       let sheet = Application.ActiveSheet;
       let lastRow = sheet.UsedRange.Rows.Count;
       if (lastRow === 1 && !sheet.Range("A1").Value) {
           lastRow = 0;
       }

       let newRow = lastRow + 1;
       const currentTime = getCurrentTime();

       sheet.Range("A" + newRow).Value = currentTime;
       sheet.Range("B" + newRow).Value = playerData.playerName;
       sheet.Range("C" + newRow).Value = `${playerData.singlePrice}`;
       sheet.Range("D" + newRow).Value = `${playerData.totalPrice}`;
       sheet.Range("E" + newRow).Value = playerData.shouldNotify ? "是" : "否";

       if (playerData.shouldNotify) {
           sheet.Range(`B${newRow}:C${newRow}`).Interior.Color = '#eb5c20';
           console.log(`球员 ${playerData.playerName} 需要标记为橙色`);
       }

       sheet.Columns("A:E").AutoFit();
       sheet.Range("A:E").HorizontalAlignment = -4108;

       console.log(`球员 ${playerData.playerName} 数据写入完成`);
       return true;
   }
   return false;
}

// 处理收藏球员数据
function parseFavoriteRosters(data) {
    if (!Array.isArray(data) || data.length === 0) {
        return null;
    }

    const userFunds = getUserFunds();
    const notifications = [];
    let isFirstEntry = true;

    for (const player of data) {
        const priceHistory = getPlayerPriceHistory(player);
        if (priceHistory && !priceHistory.isOutOfStock) {
            const marketPrice = Math.ceil(priceHistory.marketPrice);
            const shouldNotify = marketPrice <= priceHistory.lowestBuyPrice * 1.1;
            const singlePrice = marketPrice.toLocaleString();

            console.log(`球员 ${player.showName} - 市场价: ${singlePrice} - 最低购买价: ${priceHistory.lowestBuyPrice} - 是否需要通知: ${shouldNotify}`);

            const playerData = {
                playerName: player.showName,
                singlePrice: singlePrice,
                totalPrice: Math.ceil(marketPrice * 64).toLocaleString(),
                shouldNotify: shouldNotify
            };

            writeToTable(playerData);

            if (isFirstEntry && userFunds) {
                writeFundsToSheet(userFunds);
                isFirstEntry = false;
            }

            if (shouldNotify) {
                notifications.push({
                    playerName: player.showName,
                    price: singlePrice
                });
                console.log(`添加到通知列表: ${player.showName}`);
            }

            randomSleepSync(4500, 7500);
        }
    }

    if (notifications.length > 0) {
        sendBarkNotification(notifications);
        console.log(`发送通知列表: ${JSON.stringify(notifications)}`);
    }

    return true;
}

// 主函数
async function main() {
    const result = checkFavoriteRosters();
    if (!result) {
        console.log("查询失败或没有收藏球员信息");
    }
}

main();