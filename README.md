基于「金山文档」的NBA2KOL2爱玩礼包自动领取脚本

## 🎊 简介

此脚本用于金山文档的定时任务脚本执行

## ✨ 特性

    - 📀 支持金山文档运行
    - ♾️ 多种推送方式
    - 💽 使用简单

## 💬 支持得通知列表

*   Bark（iOS）
*   邮箱

## ⭐ 图片教程步骤

1.  复制nba2kol2.js到金山文档中。按照下列操作步骤进行配置，运行脚本即可生成领取腾讯爱玩nba2kol2礼包。\
2.  ![替代文本]([图片链接地址](https://imgse.com/i/pAHh5dS) "可选的标题文本")
    ![步骤一](https://imgse.com/i/pAHh5dS "实例图片")
    ![步骤二](https://imgse.com/i/pAHhTiQ)
    ![步骤三](https://imgse.com/i/pAHhHRs)
    ![步骤四](https://imgse.com/i/pAHhIIg)
    ![步骤五](https://imgse.com/i/pAHh7Gj)

## 🚀 推送逻辑流程

参考TEMPLATE.js使用案例脚本，将推送相关的代码复制到你的脚本中。\
当你的脚本调用**writeMessage**函数时，此函数会将消息写入CONFIG表中。\
等到PUSH定时任务执行时，会自动检索CONFIG表中的消息，并进行推送。


**加入消息池：**\
这个的意思是“加入消息池”选项勾选“是”的就会合并为一条消息进行通知，以@all方式推送。例如你运行了8个签到任务，那么在某个时刻只收到1条通知消息。\
默认为“否”，代表每个签到结果都用独立的一条消息通知。例如你运行了8个签到任务，那么在某个时刻会同时收到8条通知消息。

## 🤝 欢迎参与贡献

欢迎各种形式的贡献

[![](https://img.shields.io/badge/🤯_pr_welcome-%E2%86%92-ffcb47?labelColor=black\&style=for-the-badge)](https://github.com/imoki/wpsPush/pulls)


## 📝 更新日志

*   2024-12-11
    *   增加bark极简推送模式
    *   修复邮箱不换行问题


