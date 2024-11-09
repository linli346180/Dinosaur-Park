

/** 收益星兽合成配置 */
export class STBSynthConfig {
    baseProb: number = 5;    // 基础概率
    upProb: number = 15;    // 宝石提升后的概率
    conCoinType: number = 2;    // 消耗货币的类型
    conCoinNum: number = 200;    // 消耗货币的数量
}


export class BuyGemsConfig {
    id: number = 0;
    dollarAmount: number = 0;  // 美元金额
    gemsNumber: number = 0;      // 宝石数量
    rebate: number = 0;      // 返现比例
}