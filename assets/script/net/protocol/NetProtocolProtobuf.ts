/*
 * @Author: dgflash
 * @Date: 2022-04-21 13:48:44
 * @LastEditors: dgflash
 * @LastEditTime: 2022-04-21 14:11:25
 */

import { IProtocolHelper, IRequestProtocol, IResponseProtocol } from "../NetInterface";

/** 自定义通用包头长度 */
var Head_Length = 8;

/** Protobuf.js 编码与解码逻辑 */
export class NetProtocolProtobuf extends IProtocolHelper {
    encode(ireqp: IRequestProtocol): void {
        ireqp.id = this.getRequestId();

        var length = Head_Length;

        // 自定义请求参数用Protobuf Api编码为Uint8Array对象
        var bytes: Uint8Array = null!;
        if (ireqp.reqName && ireqp.params) {
            //@ts-ignore
            var pb = proto[ireqp.reqName].encode(ireqp.params);
            bytes = pb.finish();
            length = length + bytes.length;                 // 计算请求包总长度
        }

        // 自定义包头编码
        var abHead = new ArrayBuffer(Head_Length);
        var dv = new DataView(abHead);

        /** 【开发者自定义通用包头协议修改点】 */
        var id = ireqp.id;
        var cmd = ireqp.cmd;
        var uid = 0;
        dv.setUint16(0, id)                                 // 向二进制流中写入唯一编号
        dv.setUint16(2, cmd);                               // 向二进制流中写入协议编号
        dv.setUint32(4, uid);                               // 向二进制流中写入玩家编号数据
        /** 【开发者自定义通用包头协议修改点】 */

        // 创建包头二进制数据
        var u8aBuffer = new Uint8Array(abHead);
        var buffer = new Uint8Array(length);
        buffer.set(u8aBuffer)

        // 创建请求参数二进制数据
        if (bytes) buffer.set(bytes, Head_Length);

        ireqp.buffer = buffer;
    }

    decodeCommon(msg: ArrayBuffer): IResponseProtocol {
        let dv = new DataView(msg);
        /** 【开发者自定义通用包头协议修改点】 */
        var id = dv.getUint16(0);                           // 二进制流中读取唯一编号
        var cmd = dv.getUint16(2);                          // 二进制流中读取协议编号
        var code = dv.getUint32(4);                         // 二进制流中读取服务器返回错误码信息
        /** 【开发者自定义通用包头协议修改点】 */

        // 自定义Protobuf协议数据
        var bytes: Uint8Array = null!;
        if (msg.byteLength >= Head_Length) {
            bytes = new Uint8Array(msg, Head_Length, msg.byteLength - Head_Length)
        }

        var ipp: IResponseProtocol = {
            id: id,
            code: code,
            cmd: cmd
        }
        if (bytes) ipp.data = bytes;

        return ipp;
    }

    decodeCustom(ireqp: IRequestProtocol, iresp: IResponseProtocol): void {
        if (ireqp.respName) {
            //@ts-ignore
            iresp.data = proto[ireqp.respName].decode(iresp.data);
        }
    }

    onHearbeat(): void { }
}