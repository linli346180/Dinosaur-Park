/*
 * @Author: dgflash
 * @Date: 2022-04-21 13:45:51
 * @LastEditors: dgflash
 * @LastEditTime: 2022-04-21 13:51:33
 */
import { netChannel } from "../custom/NetChannelManager";
import { NetErrorCode } from "../custom/NetErrorCode";
import { NetResponse } from "../custom/NetResponse";
import { IProtocolHelper, IRequestProtocol, IResponseProtocol } from "../NetInterface";

/** JSON数据协议 */
export class NetProtocolJson extends IProtocolHelper {
    /** 处理请求包数据 */
    encode(ireqp: IRequestProtocol): void {
        ireqp.id = this.getRequestId();
        ireqp.buffer = JSON.stringify({
            seq: ireqp.id,
            requestType: ireqp.cmd,
        });
    }

    /** 解析通用响应数据 */
    decodeCommon(msg: string): IResponseProtocol {
        const response:NetResponse = JSON.parse(msg);
        var ipp: IResponseProtocol = {
            id: response.header.seq,
            cmd: response.header.msgType,
            code: NetErrorCode.Success,
            data: response.body.data,
        }
        return ipp;
    }

    decodeCustom(ireqp: IRequestProtocol, iresp: IResponseProtocol): void {
        iresp.id = ireqp.id;
        iresp.cmd = ireqp.cmd;
        iresp.cmd = 0;
        iresp.data = iresp.data
    }

    /** 返回一个心跳包 */
    onHearbeat(): void { }
}