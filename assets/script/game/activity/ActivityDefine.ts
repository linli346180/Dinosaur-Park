

export interface ActivityData {
    id: number;
    putinUsdtTotal: number;                 // 周期内投放USDT总数量
    putinUsdtRemainTotal: number;           // 周期内投放剩余usdt数量
    putinRedPacketTotal: number;            // 周期内投放红包总数量
    putinRedPacketRemainTotal: number;      // 周期内投放红包剩余数量
    desc: string;                           // 福利说明
    bounsRankArr: BounsRankData[];
}

export interface BounsRankData {
    id: number;
    bounsID: number;        // 福利ID  
    userID: number;         // 用户ID
    name: string;           // 用户名称
    createdAt: string;      // 获得红包时间         
    rpAmount: string;      // 获得的金额 
}