/*
 * @Date: 2021-08-12 09:33:37
 * @LastEditors: dgflash
 * @LastEditTime: 2022-07-22 18:09:52
 */

import { Logger } from "../../Logger";
import { INetworkTips } from "../NetInterface";

/** 游戏服务器提示 */
export class NetGameTips implements INetworkTips {
    /** 连接提示 */
    async connectTips(isShow: boolean) {
        // Logger.logNet("WebSocket游戏服务器正在连接");
    }

    /** 重连接提示 */
    reconnectTips(): void {
        Logger.logNet("WebSocket重连接提示");
    }

    /** 请求提示 */
    requestTips(isShow: boolean): void {
        Logger.logNet("WebSocket发送请求提示");
    }

    /** 断开连接提示 */
    disconnectTips(isShow: boolean): void {
        Logger.logNet("WebSocket断开连接提示");
          
    }

    errorTips(isShow: boolean): void {
        Logger.logNet("WebSocket错误提示"); 
    }
}