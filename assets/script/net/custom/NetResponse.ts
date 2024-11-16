import { NetErrorCode } from "./NetErrorCode";


export interface NetResponse {
    resultCode: NetErrorCode;
    resultMsg: string;
    header: NetHead;
    body: NetBody;
}

export interface NetHead {
    seq: number;
    msgType: number;
    length: number;
}

export interface NetBody {
    data: any;
}

// 网络返回数据基类
export class NetResponseBase {
    resultCode: string = "";
    resultMsg: string = "";
}