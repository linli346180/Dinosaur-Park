/*
 * @Author: dgflash
 * @Date: 2022-06-02 09:38:48
 * @LastEditors: dgflash
 * @LastEditTime: 2022-06-14 17:52:54
 */

import { Logger } from "../../Logger";
import { CallbackObject, IRequestProtocol, IResponseProtocol, NetCallFunc } from "../NetInterface";
import { NetNode, WebSocketReturn } from "../NetNode";
import { NetProtocolJson } from "../protocol/NetProtocolJson";
import { WebSock } from "../WebSock";
import { netChannel } from "./NetChannelManager";
import { NetCmd, NetErrorCode } from "./NetErrorCode";
import { NetGameTips } from "./NetGameTips";

/** 自定义Json通讯协议 */
export class GameJson extends NetProtocolJson {
    async onHearbeat() {
        netChannel.game.req(NetCmd.HeartBeatType, "GameHeartReq", "GameHeartResp");
    }
}

/** 网络节点扩展 */
export class NetNodeGame extends NetNode {
    init() {
        this._heartTime = 45 * 1000;                                   // 心跳间隔
        this._receiveTime = 60 * 1000;                                 // 没收到消息就断开连接
        this._reconnetTimeOut = 3 * 1000;                              // 重连间隔
        super.init(new WebSock(), new GameJson(), new NetGameTips());
    }

    public req<T>(cmd: number, reqName: string, respName: string, params?: any): Promise<WebSocketReturn<T>> {
        return new Promise((resolve, reject) => {
            var protocol: IRequestProtocol = {
                cmd: cmd,
                params: params,
                reqName: reqName,
                respName: respName,
                callback: {
                    target: this,
                    callback: (iresp: IResponseProtocol) => {
                        var res = new WebSocketReturn<T>();
                        res.isSucc = iresp.code == NetErrorCode.Success;
                        if (res.isSucc)
                            res.res = iresp.data;
                        else {
                            res.err = iresp.code;
                            Logger.logNet(`收到服务器【${cmd}】协议返回错误码`, res.err);
                        }
                        resolve(res);
                    }
                }
            }
            this.request(protocol);
        });
    }

    public reqUnique<T>(cmd: number, reqName: string, respName: string, params: any): Promise<WebSocketReturn<T>> {
        return new Promise((resolve, reject) => {
            var protocol: IRequestProtocol = {
                cmd: cmd,
                params: params,
                reqName: reqName,
                respName: respName,
                callback: {
                    target: this,
                    callback: (iresp: IResponseProtocol) => {
                        var res = new WebSocketReturn<T>();
                        res.isSucc = iresp.code == NetErrorCode.Success;
                        if (res.isSucc)
                            res.res = iresp.data;
                        else
                            res.err = iresp.code;         // 如果需要同意处理错误码逻辑，可在这里发个全局事件，到其它地方处理通用错误码逻辑
                        resolve(res);
                    }
                }
            }
            this.requestUnique(protocol);
        });
    }

    /**
     * 监听服务器推送
     * @param cmd       协议命令号
     * @param respName  Protobuf返回协议名
     * @param callback  回调方法
     * @param target    目标对象
     */
    on(cmd: number, respName: string, callback: NetCallFunc, target?: any): void {
        var co: CallbackObject = {
            target: target,
            callback: callback
        }
        var ireqp: IRequestProtocol = {
            cmd: cmd,
            respName: respName,
            callback: co
        }
        this.addResponeHandler(ireqp);
    }

    off(cmd: number, callback: NetCallFunc, target?: any) {
        this.removeResponeHandler(cmd, callback, target);
    }
}