import { NetErrorCode } from "../../net/custom/NetErrorCode";
import { StartBeastData } from "./model/AccountModelComp";


/** 用户货币数据 */
export class UserCoinData {
    readonly id: number             = 0;
    readonly userID: number         = 0;      // 用户ID
    goldCoin: number                = 100;      // 金币(金币星兽产出)
    gemsCoin: number                = 0;      // 宝石(宝石星兽产出)
    usdt: number                    = 0;      // USDT(钻石星兽产出)
    starBeastCoin: number           = 0;      // 星兽币(sbpc,至尊星兽产出)
}

/** 货币池数量 */
export class UserCoinIncome {
    goldCoin: number                = 0; // 金币
    gemsCoin: number                = 0; // 宝石数量
}

export class UserData {
    readonly id: number =            0; // 用户ID
    readonly createdAt: string       = ''; // 创建时间
    readonly updatedAt: string       = ''; // 更新时间
    readonly deletedAt: string       = ''; // 删除时间
    readonly name: string            = ''; // 名称
    email: string           = ''; // 邮箱
    readonly mobile: string          = ''; // 手机号
    readonly account: string         = ''; // 账号
    readonly registerType: RegisterType = RegisterType.Unknow; // 注册类型
    readonly externalAccountType: AccountType = AccountType.Unknow; // 外部账号类型
    readonly externalAccountUid: string = ''; // 用户外部ID
    readonly avatarPath: string      = ''; // 头像路径
    readonly state: number           = 0; // 用户状态
    readonly prohibitionState: number = 0; // 用户封禁状态
    readonly releaseAt: string | null = null; // 解禁时间
}


// 所需货币类型枚举
export enum AccountCoinType {
    Gold = 1,       // 金币
    Gems,           // 宝石
    StarBeast,      // 星兽币
    USDT            // USDT
}

/** 外部账号类型 */
export enum AccountType {
    Unknow = 0,       // 未知
    Telegram = 1,     // Telegram
    TonWallet = 2,    // TON钱包
    OwnPlatform = 3   // 自主游戏平台
}

/** 注册来源 */
export enum RegisterType {
    Unknow = 0,       // 未知来源注册
    UserRegister = 1,     // 用户自主注册
    UserInvite = 2,    // 用户邀请
    AgentInvite = 3   // 代理商邀请
}

export enum AwardType {
    Unknow = 0,         // 未知
    Coin = 1,           // 货币
    StarBeast = 2,      // 星兽
    StarBeastDebris = 3 // 星兽碎片
}

export class MergeRespose {
    isSucc: boolean = false;    //合成是否成功，false：合成失败，true：合成成功，并且userInStb会返回新星兽数据
    isGainNum: boolean = false;      //合成成功后，获得的星兽数量
}
