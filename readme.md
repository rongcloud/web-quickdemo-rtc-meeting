## demo 集成的 sdk 版本为 imlib-v4 rtc-v5

## 使用说明
1. demo clone 到本地，可直接打开静态资源中的 `index.html` 进行操作
2. demo 仅提供了基础的流程梳理，如您需要更多功能，可[参考音视频会议开发文档](https://docs.rongcloud.cn/v4/5X/views/rtc/meeting/web/guide/quick/web.html)

## 参数说明

### 公有云用户

#### appkey 获取
[可在融云开发者后台 - 服务管理](https://developer.rongcloud.cn/app/appService/8zkf1JD8NLF0gxOV3S0NuA)中创建一个应用，填入应用对应的 appkey

#### token 获取
[可在融云开发者后台 - 服务管理 - API 调用 - 获取 Token](https://developer.rongcloud.cn/apitool/bj4hYt7YBcwvXteZeVi7aQ) 中，输入 userId，从提交后返回的数据中取 `token` 字段值

### 私有云用户
1. 初始化 IM 时，需配置 `navigators` 参数，可在 `config.js` 文件中配置 `navi` 值
2. 初始化 RTC 时，需配置 `mediaServer` 参数，可在 `config.js` 文件中配置 `mediaServer` 值

#### roomId
房间号长度不能超过64,可包含: A-Z、a-z、0-9、+、=、-、_




