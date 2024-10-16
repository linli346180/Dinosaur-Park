/*
 * @Author: dgflash
 * @Date: 2022-09-01 18:00:28
 * @LastEditors: dgflash
 * @LastEditTime: 2022-09-09 18:31:18
 */

/*
 * 网络相关接口定义
 */
export type NetData = (string | ArrayBufferLike | Blob | ArrayBufferView);
export type NetCallFunc = (data: any) => void;

export interface Header {
    /** 请求唯一编号 */
    seq?: number,
    /** 响应协议命令码*/
    msgType: number,
    /** 消息长度 */
    length: number,
}

/** Protocol请求协议 */
export interface IRequestProtocol {
    /** 请求唯一编号 */
    id?: number,
    /** 协议名 */
    cmd: number,
    /** 请求对象名 */
    reqName?: string,
    /** 接受对象名 */
    respName?: string,
    /** 消息内容 */
    params?: any;
    /** 请求数据数据 */
    buffer?: NetData,
    /** 等待响应的回调对象 */
    callback: CallbackObject,
}

/** 响应协议 */
export interface IResponseProtocol {
    /** 请求唯一编号 */
    id: number,
    /** 响应协议命令码*/
    cmd: number,
    /** 响应协议错误码(0为请求成功，否则为对应的错误信息码) */
    code: number,
    /** 协议数据 */
    data?: any
}

/** 回调对象 */
export interface CallbackObject {
    /** 回调对象 */
    target: any,
    /** 回调函数 */
    callback: NetCallFunc,
}

/** 协议辅助接口 */
export class IProtocolHelper {
    protected _requestId: number = 2;   // 请求唯一编号

    /** 获取请求唯一编号 */
    protected getRequestId() {
        if (this._requestId == 30000)
            this._requestId = 1;
        this._requestId++;
        return this._requestId;
    }

    /** 处理请求包数据 */
    encode(ireqp: IRequestProtocol): void { };
    /** 解析通用响应数据 */
    decodeCommon(msg: NetData): IResponseProtocol { return null! };
    /** 解析自定义响应数据 */
    decodeCustom(ireqp: IRequestProtocol, iresp: IResponseProtocol): void { };
    /** 返回一个心跳包 */
    onHearbeat(): void { };
}

export type SocketFunc = (event: any) => void;
export type MessageFunc = (msg: NetData) => void;

/** Socket接口 */
export interface ISocket {
    /** 连接回调 */
    onConnected: SocketFunc | null;
    /** 消息回调 */
    onMessage: MessageFunc | null;
    /** 错误回调 */
    onError: SocketFunc | null;
    /** 关闭回调 */
    onClosed: SocketFunc | null;
    /** 连接状态 */
    connect(options: any): any;
    /** 数据发送接口 */
    send(buffer: NetData): number;
    /** 关闭接口 */
    close(code?: number, reason?: string): void;
}

/** 网络提示接口 */
export interface INetworkTips {
    /**
     * 连接提示回调
     * @param isShow false为准备触发连接,true为已连接
     */
    connectTips(isShow: boolean): void;
    /**
     * 断开连接提示回调
     * @param isShow false为准备触发断开连接,true为已断开连接
     */
    disconnectTips(isShow: boolean): void;
    /** 重连接开始提示回调 */
    reconnectTips(): void;
    /**
     * 请求提示回调
     * @param isShow false为所有请求结束,true为有请求等待返回
     */
    requestTips(isShow: boolean): void;

    errorTips(isShow: boolean): void;
}