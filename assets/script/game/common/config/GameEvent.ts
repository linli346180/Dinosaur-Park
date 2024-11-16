/*
 * @Author: dgflash
 * @Date: 2021-11-23 15:28:39
 * @LastEditors: dgflash
 * @LastEditTime: 2022-01-26 16:42:00
 */

/** 游戏事件 */
export enum GameEvent {
    /** 应用初始化成功 */
    APPInitialized = "APPInitialized",

    /** 登陆成功 */
    LoginSuccess = "LoginSuccess",
    /** 登陆失败 */
    LoginFail = "LoginFail",
    /** 退出游戏 */
    ExitGame = "ExitGame",

    /** 新手教程完成 */
    GuideFinish = "GuideFinish",

    /** 数据初始化完成 */
    DataInitialized = "DataInitialized",

    /** WebSocket连接成功 */
    WebSocketConnected = "WebSocketConnected",

    /** WebSocket连接失败 */
    WebSocketConnectFail = "WebSocketConnectFail",

    /** 网络请求失败 */
    WebRequestFail = "WebRequestFail",

    /** 关闭加载UI */
    CloseLoadingUI = "CloseLoadingUI",
}