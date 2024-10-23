import { NetProtocolJson } from "../protocol/NetProtocolJson";
import { NetProtocolProtobuf } from "../protocol/NetProtocolProtobuf";
import { netChannel } from "./NetChannelManager";
import { NetCmd } from "./NetErrorCode";


/** 自定义Protobuf通讯协议 */
export class GameProtocol extends NetProtocolProtobuf {
    async onHearbeat() {
        // var ret = await netChannel.game.req(proto.ClientCmd.HEART.toString(), null!, "GameHeartResp");
        // if (ret.isSucc) {
        //     console.log(ret.res);
        // }
    }
}

/** 自定义Json通讯协议 */
export class GameJson extends NetProtocolJson {
    async onHearbeat() {
        // Logger.logNet("发送心跳包");
        netChannel.game.req(NetCmd.HeartBeatType, "GameHeartReq", "GameHeartResp");
    }
}