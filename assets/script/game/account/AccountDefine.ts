import { ResultCode } from "../common/network/HttpManager";
import { IStartBeastData } from "./model/AccountModelComp";


/** 用户货币数据 */
export interface IUserCoinData {
    id: number;
    createdAt: string;
    updatedAt: string;
    userID: number; // 用户ID
    goldCoin: number; // 金币(金币星兽产出)
    gemsCoin: number; // 宝石(宝石星兽产出)
    usdt: number; // USDT(钻石星兽产出)
    starBeastCoin: number; // 星兽币(sbpc,至尊星兽产出)
}

//收益星兽合成返回
export interface IMergeResponse {
    isSucc:boolean;
    resultCode: ResultCode;
    resultMsg: string;
    userInStb: IStartBeastData
}
