import { _decorator } from "cc";
import { smc } from "../../common/SingletonModuleComp";
import { STBTypeID } from "../../character/STBDefine";
import { oops } from "../../../../../extensions/oops-plugin-framework/assets/core/Oops";
import { UserInstbConfigData } from "../model/STBConfigModeComp";

/** 视图层对象 - 支持 MVVM 框架的数据绑定 */
/** 用户金币池 */
export class CoinPoolViewModel {

    private goldConfig: UserInstbConfigData;
    private gemConfig: UserInstbConfigData;

    /** 金币数量 */
    private gold_num: number = 0;
    get GoldNum(): number {
        return this.gold_num;
    }

    set GoldNum(value: number) {
        this.gold_num = value;
        oops.storage.set("pool_gold_num", this.gold_num);
    }

    /** 宝石数量 */
    private gem_num: number = 0;
    get GemNum(): number {
        return this.gem_num;
    }

    set GemNum(value: number) {
        this.gem_num = value;
        oops.storage.set("pool_gem_num", this.gem_num);
    }

    /** 金币速度 */
    private gold_speed: number = 0;
    get GoldSpeed(): number {
        if(!this.goldConfig)
            return 0;

        this.gold_speed = 0;
        const goldstbList = smc.account.getSTBDataByConfigType([STBTypeID.STB_Gold_Level10]);
        let surNum = 0;
        goldstbList.forEach((stbData) => {
            if (smc.account.getSTBSurvivalSec(stbData.id) != 0) {
                surNum ++;
                this.gold_speed += Number(this.goldConfig.incomeNumMin);
            }
        });
        this.gold_speed = Math.floor(this.gold_speed)
        console.log("金币生产速度:" + this.gold_speed + " 总数量:" + goldstbList.length + "存活量:" + surNum + " 收益(分钟):" + this.goldConfig.incomeNumMin);
        return this.gold_speed;
    }

    /** 宝石速度 */
    private gem_speed: number = 0;
    get GemSpeed(): number {
        if(!this.gemConfig)
            return 0;

        this.gem_speed = 0;
        const gemstbList = smc.account.getSTBDataByConfigType([STBTypeID.STB_Gem]);
        let surNum = 0;
        gemstbList.forEach((stbData) => {
            if (smc.account.getSTBSurvivalSec(stbData.id) != 0) {
                surNum ++;
                this.gem_speed += Number(this.gemConfig.incomeNumMin);
            }
        });
        this.gem_speed = Math.floor(this.gem_speed)
        console.log("宝石生产速度:" + this.gem_speed + " 总数量:" + gemstbList.length + "存活量:" + surNum + " 收益(分钟):" + this.gemConfig.incomeNumMin);
        return Math.floor(this.gem_speed);
    }

    Init() {
        const pool_gold_num = oops.storage.getNumber("pool_gold_num", 0);
        const pool_gem_num = oops.storage.getNumber("pool_gem_num", 0);

        this.goldConfig = smc.account.getSTBConfigByType(STBTypeID.STB_Gold_Level10);
        this.gemConfig = smc.account.getSTBConfigByType(STBTypeID.STB_Gem);

        if (this.goldConfig == null || this.gemConfig == null) {
            console.error("星兽配置为空");
            return;
        }

        let godNum = 0;
        let gemNum = 0;
        this.gold_num = Math.max(pool_gold_num, godNum);
        this.gem_num = Math.max(pool_gem_num, gemNum);
    }
}

export let coinPoolVM = new CoinPoolViewModel();