import { NetErrorCode } from "../../net/custom/NetErrorCode";
import { StartBeastData } from "./model/AccountModelComp";


/** 用户货币数据 */
export class UserCoinData {
    id: number              = 0;
    userID: number          = 0;      // 用户ID
    goldCoin: number        = 1000;      // 金币(金币星兽产出)
    gemsCoin: number        = 1000;      // 宝石(宝石星兽产出)
    usdt: number            = 1000;      // USDT(钻石星兽产出)
    starBeastCoin: number   = 1000;      // 星兽币(sbpc,至尊星兽产出)
}

/** 货币池数量 */
export class UserCoinIncome {
    goldCoin: number        = 1000; // 金币
    gemsCoin: number        = 1000; // 宝石数量
}

export class UserData {
    id: number =            0; // 用户ID
    createdAt: string       = ''; // 创建时间
    updatedAt: string       = ''; // 更新时间
    deletedAt: string       = ''; // 删除时间
    name: string            = ''; // 名称
    email: string           = ''; // 邮箱
    mobile: string          = ''; // 手机号
    account: string         = ''; // 账号
    registerType: RegisterType = RegisterType.Unknow; // 注册类型
    externalAccountType: AccountType = AccountType.Unknow; // 外部账号类型
    externalAccountUid: string = ''; // 用户外部ID
    avatarPath: string      = ''; // 头像路径
    state: number           = 0; // 用户状态
    prohibitionState: number = 0; // 用户封禁状态
    releaseAt: string | null = null; // 解禁时间
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
