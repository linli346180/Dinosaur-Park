import { _decorator, Component, Node, macro, Label, Button } from 'cc';
import { AccountNetService } from '../account/AccountNet';
import { oops } from '../../../../extensions/oops-plugin-framework/assets/core/Oops';
import { AccountEvent } from '../account/AccountEvent';
import { coinPoolVM } from '../account/viewModel/CoinPoolViewModel';
import { smc } from '../common/SingletonModuleComp';
import { tween } from 'cc';
import { STBTypeID } from '../character/STBDefine';
import { IncomeType } from '../account/model/STBConfigModeComp';
const { ccclass, property } = _decorator;

/** 用户收益提示牌 */
@ccclass('UserIncomeView')
export class UserIncomeView extends Component {
    @property(Button)
    btn_collectGold: Button = null!;
    @property(Button)
    btn_collectGem: Button = null!;
    @property(Label)
    gold_num: Label = null!;
    @property(Label)
    gold_speed: Label = null!;
    @property(Label)
    gem_num: Label = null!;

    // private intervalSec: number = 15;   // 间隔时间
    // private gemMinShow: number = 15; // 宝石最小显示数量
    // private goldMinsHow: number = 500; // 金币最小显示数量

    start() {
        this.btn_collectGold.node.on(Button.EventType.CLICK, this.UseCollectGold, this);
        this.btn_collectGem.node.on(Button.EventType.CLICK, this.UseCollectGem, this);
        oops.message.on(AccountEvent.AddInComeSTB, this.onHandler, this);
        oops.message.on(AccountEvent.DelIncomeSTB, this.onHandler, this);
        coinPoolVM.Init();
        this.initUI();
    }

    private onHandler(event: string, args: any) {
        switch (event) {
            case AccountEvent.AddInComeSTB:
            case AccountEvent.DelIncomeSTB:
                this.OnUserIncomeSTBChanged(args);
                break;
        }
    }

    private OnUserIncomeSTBChanged(stbId : number) { 
        const stbData = smc.account.getUserSTBData(stbId);
        if (stbData == null) return;

        const stbConfig = smc.account.getSTBConfigById(stbData.stbConfigID);
        if (stbConfig == null) return;

        if(stbConfig.incomeType == IncomeType.gold) {
            this.initGoldPool();
        }
        if(stbConfig.incomeType == IncomeType.gems) {
            this.initGemPool();
        }
    }

    /** 收集金币池 */
    private async UseCollectGold() {
        if (coinPoolVM.GoldNum <= 0) return;
        coinPoolVM.GoldNum = 0;
        const res = await AccountNetService.UseCollectCoin();
        if (res) {
            smc.account.AccountModel.CoinData = res.userCoin;
            oops.message.dispatchEvent(AccountEvent.CoinDataChange);
        }
        oops.message.dispatchEvent(AccountEvent.UserCollectGold);

        this.initGoldPool();
    }

    /** 收集宝石池 */
    private async UseCollectGem() {
        if (coinPoolVM.GemNum <= 0) return;
        coinPoolVM.GemNum = 0;

        const res = await AccountNetService.UseCollectGem();
        if (res) {
            smc.account.AccountModel.CoinData = res.userCoin;
            oops.message.dispatchEvent(AccountEvent.CoinDataChange);
        }
        this.initGemPool();
    }

    private initUI() {
        this.initGoldPool();
        this.initGemPool();
    }

    /** 初始化金币池 */
    private initGoldPool() { 
        const config = smc.account.getSTBConfigByType(STBTypeID.STB_Gold_Level10);
        if(config == null) return;
      
        // this.gold_num.string = coinPoolVM.GoldNum.toString();
        this.playAnim(this.gold_num, coinPoolVM.GoldNum);
        this.unschedule(this.updateGoldPool);
        this.schedule(this.updateGoldPool, config.incomeCycle, macro.REPEAT_FOREVER, config.incomeCycle);
    }

    /** 更新金币池 */
    private updateGoldPool() {
        coinPoolVM.GoldNum = Number(coinPoolVM.GoldNum) + Number(coinPoolVM.GoldSpeed);
        this.playAnim(this.gold_num, coinPoolVM.GoldNum);
    }

    /** 初始化宝石池 */
    private initGemPool() { 
        const config = smc.account.getSTBConfigByType(STBTypeID.STB_Gem);
        if(config == null) return;

        this.playAnim(this.gem_num, coinPoolVM.GemNum, () => {
            this.btn_collectGem.node.active = coinPoolVM.GemNum > 0;
        });

        this.unschedule(this.updateGenPool);
        this.schedule(this.updateGenPool, config.incomeCycle, macro.REPEAT_FOREVER, config.incomeCycle);
    }

    /** 更新宝石池 */
    private updateGenPool() {
        coinPoolVM.GemNum = Number(coinPoolVM.GemNum) + Math.floor(coinPoolVM.GemSpeed);
        this.btn_collectGem.node.active = coinPoolVM.GemNum > 0;
        this.playAnim(this.gem_num, coinPoolVM.GemNum);
    }

    private playAnim(label: Label, endNum: number, callback?: Function) {
        let startNum = parseInt(label.string);
        tween(label)
            .to(0.5, {}, {
                onUpdate: (target, ratio) => { label.string = Math.floor(startNum + (endNum - startNum) * ratio).toString(); }
            })
            .call(() => { if (callback) callback(); })
            .start();
    }
}