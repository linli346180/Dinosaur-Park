import { _decorator } from "cc";
import { smc } from "../../common/SingletonModuleComp";
import { STBID } from "../../character/STBDefine";
import { oops } from "../../../../../extensions/oops-plugin-framework/assets/core/Oops";

/** 视图层对象 - 支持 MVVM 框架的数据绑定 */
/** 用户金币池 */
export class CoinPoolViewModel {

    private goldConfig: any;
    private gemConfig: any;

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
        this.gold_speed = 0;
        const goldstbList = smc.account.getSTBDataByConfigId(STBID.STB_Gold_Level10);
        goldstbList.forEach((stbData) => {
            if (smc.account.getSTBSurvivalSec(stbData.id) != 0) {
                this.gold_speed += Number(this.goldConfig.incomeNumMin);
            }
        });
        // console.log("金币速度", Math.floor(this.gold_speed));
        return Math.floor(this.gold_speed);
    }

    /** 宝石速度 */
    private gem_speed: number = 0;
    get gemSpeed(): number {
        this.gold_speed = 0;
        const gemstbList = smc.account.getSTBDataByConfigId(STBID.STB_Gem);
        gemstbList.forEach((stbData) => {
            if (smc.account.getSTBSurvivalSec(stbData.id) != 0)
                this.gold_speed += Number(this.gemConfig.incomeNumMin);
        });
        // console.log("宝石速度", Math.floor(this.gem_speed));
        return Math.floor(this.gem_speed);
    }

    Init() {
        const pool_gold_num = oops.storage.getNumber("pool_gold_num", 0);
        const pool_gem_num = oops.storage.getNumber("pool_gem_num", 0);

        this.goldConfig = smc.account.getSTBConfig(STBID.STB_Gold_Level10);
        this.gemConfig = smc.account.getSTBConfig(STBID.STB_Gem);
        if (this.goldConfig == null || this.gemConfig == null) {
            console.error("配置为空");
            return;
        }

        let godNum = 0;
        const goldstbList = smc.account.getSTBDataByConfigId(STBID.STB_Gold_Level10);
        goldstbList.forEach((stbData) => {
            if (smc.account.getSTBSurvivalSec(stbData.id) != 0) {
                const lastTime = new Date(stbData.lastIncomeTime);
                const diffTime = new Date().getTime() - lastTime.getTime();
                const diffMins = Math.floor(diffTime / 60000);
                // console.log(`${stbData.id} ${goldConfig.stbName} 时间间隔为 ${diffMins} 分钟`);
                godNum += this.goldConfig.incomeNumMin * diffMins / this.goldConfig.incomeCycle;
            }
        });

        let gemNum = 0;
        const gemstbList = smc.account.getSTBDataByConfigId(STBID.STB_Gem);
        gemstbList.forEach((stbData) => {
            const lastTime = new Date(stbData.lastIncomeTime);
            const diffTime = new Date().getTime() - lastTime.getTime();
            const diffMins = Math.floor(diffTime / 60000);
            // console.log(`${stbData.id} ${gemConfig.stbName} 时间间隔为 ${diffMins} 分钟`);
            gemNum += this.gemConfig.incomeNumMin * diffMins / this.gemConfig.incomeCycle;
        });

        this.gold_num = Math.max(pool_gold_num, godNum);
        this.gem_num = Math.max(pool_gem_num, gemNum);
    }
}