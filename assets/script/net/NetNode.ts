import { error } from "cc";
import { Logger } from "../Logger";
import { CallbackObject, INetworkTips, IProtocolHelper, IRequestProtocol, IResponseProtocol, ISocket, NetCallFunc, NetData } from "./NetInterface";
import { oops } from "../../../extensions/oops-plugin-framework/assets/core/Oops";
import { GameEvent } from "../game/common/config/GameEvent";

/*
*   CocosCreator网络节点基类，以及网络相关接口定义
*   1. 网络连接、断开、请求发送、数据接收等基础功能
*   2. 心跳机制
*   3. 断线重连 + 请求重发
*   4. 调用网络屏蔽层
*/

type ExecuterFunc = (callback: CallbackObject, iresp: IResponseProtocol) => void;
type CheckFunc = (checkedFunc: VoidFunc) => void;
type VoidFunc = () => void;
type BoolFunc = () => boolean;

var NetNodeStateStrs = ["已关闭", "连接中", "验证中", "可传输数据"];

export class WebSocketReturn<T> {
    /** 是否请求成功 */
    isSucc: boolean = false;
    /** 请求返回数据 */
    res?: T;
    /** 请求错误数据 */
    err?: any;
}

/** 网络提示类型枚举 */
export enum NetTipsType {
    /** 连接中 */
    Connecting,
    /** 重连接 */
    ReConnecting,
    /** 请求中 */
    Requesting,
    /** 断开中 */
    Disconnecting,
    /** 异常 */
    Error,
}

/** 网络状态枚举 */
export enum NetNodeState {
    Closed,                     // 已关闭
    Connecting,                 // 连接中
    Checking,                   // 验证中
    Working,                    // 可传输数据
}

/** 网络连接参数 */
export interface NetConnectOptions {
    host?: string,              // 地址
    port?: number,              // 端口
    url?: string,               // url，与地址+端口二选一
    autoReconnect?: number,     // -1 永久重连，0不自动重连，其他正整数为自动重试次数
}

/** 网络节点 */
export class NetNode {
    protected _connectOptions: NetConnectOptions | null = null;
    protected _autoReconnect: number = 0;
    protected _isSocketInit: boolean = false;                               // Socket是否初始化过
    protected _isSocketOpen: boolean = false;                               // Socket是否连接成功过
    protected _state: NetNodeState = NetNodeState.Closed;                   // 节点当前状态
    protected _socket: ISocket = null!;                                     // Socket对象（可能是原生socket、websocket、wx.socket...)

    protected _networkTips: INetworkTips | null = null;                     // 网络提示ui对象（请求提示、断线重连提示等）
    protected _protocolHelper: IProtocolHelper = null!;                     // Protocol包解析对象
    protected _connectedCallback: CheckFunc | null = null;                  // 连接完成回调
    protected _disconnectCallback: BoolFunc | null = null;                  // 断线回调
    protected _callbackExecuter: ExecuterFunc = null!;                      // 回调执行

    protected _keepAliveTimer: any = null;                                  // 心跳定时器
    protected _receiveMsgTimer: any = null;                                 // 接收数据定时器
    protected _reconnectTimer: any = null;                                  // 重连定时器
    protected _heartTime: number = 10000;                                   // 心跳间隔
    protected _receiveTime: number = 30000;                                 // 多久没收到数据断开
    protected _reconnetTimeOut: number = 5000;                              // 重连间隔
    protected _requests: IRequestProtocol[] = Array<IRequestProtocol>();    // 请求列表
    protected _listener: { [key: number]: IRequestProtocol[] | null } = {}  // 监听者列表

    /********************** 网络相关处理 *********************/
    init(socket: ISocket, protocol: IProtocolHelper, networkTips: INetworkTips | null = null, execFunc: ExecuterFunc | null = null) {
        Logger.logNet(`网络初始化`);
        this._socket = socket;
        this._protocolHelper = protocol;
        this._networkTips = networkTips;
        this._callbackExecuter = execFunc ? execFunc : (callback: CallbackObject, iresp: IResponseProtocol) => {
            callback.callback.call(callback.target, iresp);
        }
    }

    /**
     * 请求连接服务器
     * @param options 连接参数
     */
    connect(options: NetConnectOptions): boolean {
        if (this._socket && this._state == NetNodeState.Closed) {
            if (!this._isSocketInit) {
                this.initSocket();
            }
            this._state = NetNodeState.Connecting;
            if (!this._socket.connect(options)) {
                Logger.logNet(`Socket连接失败`);
                return false;
            }
            if (this._connectOptions == null && typeof options.autoReconnect == "number") {
                this._autoReconnect = options.autoReconnect;
            }
            this._connectOptions = options;
            this.updateNetTips(NetTipsType.Connecting, true);
            return true;
        }
        return false;
    }

    /**
     * 断开网络
     * @param code      关闭码
     * @param reason    关闭原因
     */
    close(code?: number, reason?: string) {
        if (this._state == NetNodeState.Closed) {
            Logger.logNet(`网络节点已断开`);
            return;
        }

        this.clearTimer();
        this._listener = {};
        this._requests.length = 0;

        if (this._socket) {
            this._socket.close(code, reason);
        }
        else {
            this._state = NetNodeState.Closed;
        }
    }

    /**
     * 只是关闭Socket套接字（仍然重用缓存与当前状态）
     * @param code      关闭码
     * @param reason    关闭原因
     */
    closeSocket(code?: number, reason?: string) {
        if (this._socket) {
            this._socket.close(code, reason);
        }
    }

    /** 是否自动重连接 */
    isAutoReconnect() {
        return this._autoReconnect != 0;
    }

    /** 拒绝重新连接 */
    rejectReconnect() {
        this._autoReconnect = 0;
        this.clearTimer();
    }

    //#region 网络事件
    protected initSocket() {
        if (this._socket) {
            this._socket.onConnected = (event) => { this.onConnected(event) };
            this._socket.onMessage = (msg) => { this.onMessage(msg) };
            this._socket.onError = (event) => { this.onError(event) };
            this._socket.onClosed = (event) => { this.onClosed(event) };
            this._isSocketInit = true;
        }
    }

    /** 网络连接成功 */
    protected onConnected(event: any) {
        // Logger.logNet("网络已连接")
        this._isSocketOpen = true;
        // 如果设置了鉴权回调，在连接完成后进入鉴权阶段，等待鉴权结束
        if (this._connectedCallback !== null) {
            this._state = NetNodeState.Checking;
            this._connectedCallback(() => { this.onChecked() });
        }
        else {
            this.onChecked();
        }
        Logger.logNet(`网络已连接当前状态为【${NetNodeStateStrs[this._state]}】`);
    }

    /** 连接验证成功，进入工作状态 */
    protected onChecked() {
        // Logger.logNet("连接验证成功，进入工作状态");
        this._state = NetNodeState.Working;

        // 重发待发送信息
        var requests = this._requests.concat();
        if (requests.length > 0) {
            // Logger.logNet(`请求【${this._requests.length}】个待发送的信息`);
            for (var i = 0; i < requests.length;) {
                let req = requests[i];
                this._socket.send(req.buffer!);
                if (req.callback == null || req.cmd != 0) {
                    requests.splice(i, 1);
                }
                else {
                    ++i;
                }
            }
            // 如果还有等待返回的请求，启动网络请求层
            this.updateNetTips(NetTipsType.Requesting, this._requests.length > 0);
        }


        // 重置心跳包发送器
        this.resetHearbeatTimer();

        // 关闭连接或重连中的状态显示
        this.updateNetTips(NetTipsType.Connecting, false);
    }

    /** 接收到一个完整的消息包 */
    protected onMessage(msg: NetData): void {
        Logger.logNet(`接收消息【${msg}】`);
        var iresp: IResponseProtocol = this._protocolHelper.decodeCommon(msg);

        // 接受到数据，重新定时收数据计时器
        this.resetReceiveMsgTimer();
        // 重置心跳包发送器
        this.resetHearbeatTimer();

        // 触发消息执行
        var id = iresp.id;
        var cmd = iresp.cmd;

        // 触发请求队列中的回调函数
        if (this._requests.length > 0) {
            for (let i = 0; i < this._requests.length; i++) {
                const request = this._requests[i];
                if (request.cmd == cmd) {
                    // Logger.logNet(`触发请求命令【${cmd}】的回调`);
                    this._protocolHelper.decodeCustom(request, iresp);
                    this._callbackExecuter(request.callback, iresp);
                    this._requests.splice(i, 1);
                    i--;
                }
            }

            // 触发请求结束
            // if (this._requests.length == 0) {
            //     this.updateNetTips(NetTipsType.Requesting, false);
            // }
            // else {
            //     Logger.logNet(`请求队列中还有【${this._requests.length}】个请求在等待`);
            // }
        }

        // 服务器推送回调触发
        let listeners = this._listener[cmd];
        if (null != listeners) {
            for (const ireqp of listeners) {
                // Logger.logNet(`触发监听命令【${cmd}】的回调`);
                this._protocolHelper.decodeCustom(ireqp, iresp);
                this._callbackExecuter(ireqp.callback, iresp.data);
            }
        }
    }

    protected onError(event: any) {
        // error(event);
        console.error("ScoketError连接错误: " + JSON.stringify(event));
        this.updateNetTips(NetTipsType.Error, true);
    }

    protected onClosed(event: any) {
        this._state = NetNodeState.Closed;
        this.clearTimer();
        this.updateNetTips(NetTipsType.Disconnecting, true);

        // 执行断线回调，返回false表示不进行重连
        if (this._disconnectCallback && !this._disconnectCallback()) {
            Logger.logNet(`断开连接`);
            return;
        }

        // 自动重连时，不触发断开事件
        if (this.isAutoReconnect()) {
            this.updateNetTips(NetTipsType.ReConnecting, true);
            this._reconnectTimer = setTimeout(() => {
                this.connect(this._connectOptions!);
                if (this._autoReconnect > 0) {
                    this._autoReconnect -= 1;
                    console.log("剩余重连次数:", this._autoReconnect);
                }
            }, this._reconnetTimeOut);
        } else {
            oops.message.dispatchEvent(GameEvent.WebSocketConnectFail)
            console.log("重连失败,网络已断开");
        }
    }

    //#region 发数据相关处理
    /**
     * 发起请求，并进入缓存列表
     * @param reqProtocol 请求协议
     * @param rspObject   回调对象
     * @param showTips    是否触发请求提示
     * @param force       是否强制发送
     * @param channelId   通道编号
     */
    request(reqProtocol: IRequestProtocol, showTips: boolean = false, force: boolean = false) {
        this._protocolHelper.encode(reqProtocol);
        this.base_request(reqProtocol, showTips, force);
    }

    /**
     * 唯一request，确保没有同一响应的请求（避免一个请求重复发送，netTips界面的屏蔽也是一个好的方法）
     * @param reqProtocol 请求协议
     * @param rspObject   回调对象
     * @param showTips    是否触发请求提示
     * @param force       是否强制发送
     * @param channelId   通道编号
     */
    requestUnique(reqProtocol: IRequestProtocol, showTips: boolean = false, force: boolean = false): boolean {
        this._protocolHelper.encode(reqProtocol);

        for (let i = 0; i < this._requests.length; ++i) {
            if (this._requests[i].cmd == reqProtocol.cmd) {
                Logger.logNet(`命令【${reqProtocol.cmd}】重复请求`);
                return false;
            }
        }

        this.base_request(reqProtocol, showTips, force);
        return true;
    }

    private base_request(reqProtocol: IRequestProtocol, showTips: boolean = false, force: boolean = false) {
        if (this._state == NetNodeState.Working || force) {
            this._socket.send(reqProtocol.buffer!);
        }
        // Logger.logNet(`队列命令为【${reqProtocol.cmd}】的请求，等待请求数据的回调`);

        // 进入发送缓存列表
        this._requests.push(reqProtocol);

        // 启动网络请求层
        this.updateNetTips(NetTipsType.Requesting, showTips);
    }
    //#endregion

    //#region 回调相关处理
    /**
     * 监听服务器推送
     * @param cmd       协议命令号
     * @param respName  Protobuf返回协议名
     * @param callback  回调方法
     * @param target    目标对象
     */
    addResponeHandler(reqProtocol: IRequestProtocol): void {
        var cmd = reqProtocol.cmd;
        if (null == this._listener[cmd]) {
            this._listener[cmd] = [reqProtocol];
        }
        else {
            let index = this.getNetListenersIndex(cmd, reqProtocol.callback);
            if (-1 == index) {
                this._listener[cmd]!.push(reqProtocol);
            }
        }
    }

    /**
     * 删除一个监听中指定子回调
     * @param cmd       命令字串
     * @param callback  回调方法
     * @param target    目标对象
     */
    removeResponeHandler(cmd: number, callback: NetCallFunc, target?: any) {
        if (null != this._listener[cmd] && callback != null) {
            let index = this.getNetListenersIndex(cmd, { target, callback });
            if (-1 != index) {
                this._listener[cmd]!.splice(index, 1);
            }
        }
    }

    /**
     * 清除所有监听或指定命令的监听
     * @param cmd  命令字串（默认不填为清除所有）
     */
    cleanListeners(cmd: number = 0) {
        if (cmd == 0) {
            this._listener = {}
        }
        else {
            delete this._listener[cmd];
        }
    }

    protected getNetListenersIndex(cmd: number, rspObject: CallbackObject): number {
        let index = -1;
        for (let i = 0; i < this._listener[cmd]!.length; i++) {
            let iterator = this._listener[cmd]![i];
            if (iterator.callback.callback == rspObject.callback && iterator.callback.target == rspObject.target) {
                index = i;
                break;
            }
        }
        return index;
    }
    //#endregion

    //#region 心跳、超时相关处理
    protected resetReceiveMsgTimer() {
        if (this._receiveMsgTimer !== null) {
            clearTimeout(this._receiveMsgTimer);
        }

        this._receiveMsgTimer = setTimeout(() => {
            Logger.logNet("接收消息定时器关闭网络连接");
            this._socket.close();
        }, this._receiveTime);
    }

    /** 重置心跳包 */
    protected resetHearbeatTimer() {
        if (this._keepAliveTimer !== null) {
            clearTimeout(this._keepAliveTimer);
        }

        this._keepAliveTimer = setTimeout(() => {
            // Logger.logNet("网络节点发送心跳信息间隔" + this._heartTime);
            if (this._state == NetNodeState.Working) {
                this._protocolHelper.onHearbeat();
            }

        }, this._heartTime);
    }

    // 启动心跳机制，定期发送心跳包
    protected repeatHeartBeat() {
        if (this._keepAliveTimer) {
            clearInterval(this._keepAliveTimer);
        }
        this._keepAliveTimer = setInterval(() => {
            if (this._state == NetNodeState.Working) {
                this._protocolHelper.onHearbeat();
            }
        }, this._heartTime); // 每隔指定的时间发送一次心跳包
    }


    /** 重置定时器 */
    protected clearTimer() {
        if (this._receiveMsgTimer !== null) {
            clearTimeout(this._receiveMsgTimer);
        }
        if (this._keepAliveTimer !== null) {
            clearTimeout(this._keepAliveTimer);
        }
        if (this._reconnectTimer !== null) {
            clearTimeout(this._reconnectTimer);
        }
    }
    //#endregion


    protected updateNetTips(tipsType: NetTipsType, isShow: boolean) {
        if (this._networkTips) {
            if (tipsType == NetTipsType.Requesting) {
                this._networkTips.requestTips(isShow);
            }
            else if (tipsType == NetTipsType.Connecting) {
                this._networkTips.connectTips(isShow);
            }
            else if (tipsType == NetTipsType.ReConnecting) {
                this._networkTips.reconnectTips();
            }
            else if (tipsType == NetTipsType.Disconnecting) {
                this._networkTips.disconnectTips(isShow);
            }
            else if (tipsType == NetTipsType.Error) {
                this._networkTips.errorTips(isShow);
            }
        }
    }
}