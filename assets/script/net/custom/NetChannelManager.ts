/*
 * @Date: 2021-08-12 09:33:37
 * @LastEditors: dgflash
 * @LastEditTime: 2022-06-14 17:53:02
 */
import { NetManager } from "../NetManager";
import { netConfig } from "./NetConfig";
import { NetNodeGame } from "./NetNodeGame";

export enum NetChannelType {
    /** 游戏服务器 */
    Game = 0,
}

export class NetChannelManager {
    public game!: NetNodeGame;

    /** 创建游戏服务器 */
    gameCreate() {
        this.game = new NetNodeGame();
        this.game.init();
        NetManager.getInstance().setNetNode(this.game, NetChannelType.Game);
    }

    /** 连接游戏服务器 */
    gameConnect() {
        NetManager.getInstance().connect({
            url: `wss://${netConfig.WebSock}?token=${netConfig.Token}`,
            autoReconnect: 5        // 重连接设置
        }, NetChannelType.Game);
    }

    /** 断开游戏服务器 */
    gameClose() {
        NetManager.getInstance().close(undefined, undefined, NetChannelType.Game);
    }
}

export var netChannel = new NetChannelManager();