import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

// 用户孵蛋数据
interface UserHatchData {
    id: number;                 // 用户孵化记录ID
    createdAt: string;          // 创建时间
    updatedAt: string;          // 更新时间
    userID: number;             // 用户ID
    remainNum: number;          // 剩余孵蛋次数
    hatchNum: number;           // 已经孵蛋次数
}


// 孵蛋价格配置
export interface HatchPriceConfig {
    id: number;                 // ID
    // createdAt: string;          // 创建时间
    // updatedAt: string;          // 更新时间
    hatchNum: number;           // 购买次数
    conCoinType: CoinType;        // 所需货币类型(1.金币,2.宝石,3.星兽币,4.USDT)
    purNeedCoinNum: number;     // 购买价格
    limitedNum: number;         // 限购次数，当限购次数为0时，表示不限购
    desc: string;               // 描述
}

// 所需货币类型枚举
export enum CoinType {
    Gold = 1,       // 金币
    Gems,           // 宝石
    StarBeast,      // 星兽币
    USDT            // USDT
}