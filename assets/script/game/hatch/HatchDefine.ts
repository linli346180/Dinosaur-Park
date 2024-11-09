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
export class HatchPriceConfig {
    id: number = 0;                 // ID
    hatchNum: number = 0;           // 购买次数
    conCoinType: CoinType = CoinType.Gems;      // 所需货币类型(1.金币,2.宝石,3.星兽币,4.USDT)
    purNeedCoinNum: number = 0;     // 购买价格
    limitedNum: number = 0;         // 限购次数，当限购次数为0时，表示不限购
    purNum:number = 0;              // 已经购买次数
    desc: string = '';               // 描述
}

// 所需货币类型枚举
export enum CoinType {
    Gold = 1,       // 金币
    Gems,           // 宝石
    StarBeast,      // 星兽币
    USDT            // USDT
}

// 奖励配置结构体
export interface RewardConfig {
    goodName: string;       // 奖励名称
    level: RewardLevel;     // 奖励级别(1.普通,2.中级,3.高级,4.稀有)
    rewardType: RewardType; // 奖励类型(1.货币,2.星兽,3.星兽碎片)
    rewardGoodsID: number;  // 奖励物品ID
    rewardNum: number;      // 奖励数量
    standbyID: number;      // 星兽配置表ID
}

// 奖励级别枚举
export enum RewardLevel {
    Normal = 1,    // 普通
    Intermediate,  // 中级
    Advanced,      // 高级
    Rare           // 稀有
}

// 奖励类型枚举
export enum RewardType {
    Currency = 1,  // 货币
    StarBeast,     // 星兽
    StarBeastFragment // 星兽碎片
}


export enum UserHatchEvent {
    HatchRemailChange = "HatchRemailChange", // 孵蛋次数变化
}