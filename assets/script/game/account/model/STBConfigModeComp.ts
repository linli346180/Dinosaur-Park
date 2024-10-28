import { _decorator, Component, Node } from 'cc';
import { ecs } from '../../../../../extensions/oops-plugin-framework/assets/libs/ecs/ECS';
const { ccclass, property } = _decorator;


@ecs.register('STBConfigMode')
export class STBConfigModeComp extends ecs.Comp {
    instbConfigData: UserInstbConfigData[] = [];

    reset(): void {
        this.instbConfigData = [];
    }

    GetSTBConfigData(configId: number): UserInstbConfigData | undefined {
        return this.instbConfigData.find((element) => element.id === configId);
    }
}

/** 星兽配置 */
export interface UserInstbConfigData {
    id: number; // 星兽ID
    createdAt: string;
    updatedAt: string;
    stbKinds: StbKinds; // 星兽种类(1.黄金星兽,2.宝石星兽,3.至尊星兽,4.钻石星兽)
    stbName: string; // 星兽名称
    stbGrade: number; // 星兽等级
    isIncome: IsIncome; // 是否可以收益(1.是,2.否)
    stbSurvival: number; // 星兽存活时间(秒) 0表示永久存活
    incomeType: number; // 收益货币的类型(1.金币,2.宝石,3.星兽币,4.USDT)
    incomeCycle: number; // 收益周期(秒)
    incomeNumMin: number; // 最小收益数量
    incomeNumMax: number; // 最大收益数量
    incomeGetOpport: number; // 收益获得时机(1.存活期间获得,2.死亡后计算)
    incomeGetMethod: number; // 收益获得方式(1.点击领取,2.邮件领取)
    isPur: IsPur; // 是否可以购买
    purConCoin: PurConCoin; // 购买消耗货币类型(1.金币,2.宝石,3.星兽币,4.USDT)
    purConCoinNum: number; // 购买消耗货币数量
    desc: string; // 概括
}

export enum StbKinds {
    黄金星兽 = 1,
    宝石星兽,
    至尊星兽,
    钻石星兽
}

export enum IsIncome {
    Yes = 1,
    No = 2
}

export enum IsPur {
    Yes = 1,
    No
}

export enum PurConCoin {
    gold = 1,
    gems,
    starBeast,
    usdt
}
