
export class DinosaurConfig {
    /** 恐龙ID */
    id: number = 0;

    /** 恐龙名称 */
    name: string = '';

    /** 生产金币 */
    produceGold: number = 0;
    /** 生产金币时间 */
    produceGoldTime: number = 0;
    /** 使用金币购买的数量 */
    buyGold: number = 0;

    /** 生产宝石 */
    produceGem: number = 0;
    /** 生产宝石时间 */
    pproduceGemTime: number = 0;
    /** 使用宝石购买的价格 */
    buyGem: number = 0;

    /** 是否允许合成 */
    canMerge: boolean = true;

    /** 是否允许升级 */
    canUpgrade: boolean = true;
}

/** 资产 */
export class Resource {
    gold: number = 1000
    diamond: number = 100
    soul: number = 1000
}
