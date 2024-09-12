import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

export enum DinosaurEvent {
    merge = "合并",
    upgrade = "升级",
    delete = "删除",
}

// 定义恐龙的基础接口
interface IDinosaur {
    id: number;               // 恐龙的ID
    name: string;             // 恐龙的名字
    type: string;             // 恐龙的类型，例如 "砖石恐龙"
    earnings: number;         // 收益
    lifespan: number;         // 有效时间（单位：分钟或小时）
    adoptionCost: number;     // 领养费用
}

// 收益货币类型
export enum IncomeType {
    Gold = 1,   // 金币
    Gem = 2,    // 宝石
    STBC = 3,    // 星兽币
    USTD =4,    // USTD
}

// 星兽种类
export enum StbKind {
    STB_Gold = 1,   // 黄金星兽
    STB_Gem = 2, // 宝石星兽
    STB_Diamond = 3, // 至尊星兽"
    STB_Super = 4, // 钻石星兽
}

//星兽名称
export enum STBName {
    STB_Gold_Level1 = "1级黄金星兽",
    STB_Gold_Level2 = "2级黄金星兽",
    STB_Gold_Level3 = "3级黄金星兽",
    STB_Gold_Level4 = "4级黄金星兽",
    STB_Gold_Level5 = "5级黄金星兽",
    STB_Gold_Level6 = "6级黄金星兽",
    STB_Gold_Level7 = "7级黄金星兽",
    STB_Gold_Level8 = "8级黄金星兽",
    STB_Gold_Level9 = "9级黄金星兽",
    STB_Gold_Level10 = "10级黄金星兽",
    STB_Super_Level1 = "初级至尊星兽",
    STB_Super_Level2 = "中级至尊星兽",
    STB_Super_Level3 = "高级至尊星兽",
    STB_Gem = "宝石星兽",
    STB_Diamond = "砖石星兽",
}

//星兽ID
export enum STBID {
    STB_Gold_Level1 = 1,
    STB_Gold_Level2,
    STB_Gold_Level3,
    STB_Gold_Level4,
    STB_Gold_Level5,
    STB_Gold_Level6,
    STB_Gold_Level7,
    STB_Gold_Level8,
    STB_Gold_Level9,
    STB_Gold_Level10,
    STB_Super_Level1,
    STB_Super_Level2,
    STB_Super_Level3,
    STB_Gem,
    STB_Diamond,
}