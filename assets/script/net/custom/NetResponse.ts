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
