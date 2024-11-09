import { _decorator, Component, Node, macro, Label, Button } from 'cc';
import { AccountNetService } from '../account/AccountNet';
import { oops } from '../../../../extensions/oops-plugin-framework/assets/core/Oops';
import { AccountEvent } from '../account/AccountEvent';
import { coinPoolVM } from '../account/viewModel/CoinPoolViewModel';
import { smc } from '../common/SingletonModuleComp';
import { tween } from 'cc';
import { STBTypeID } from '../character/STBDefine';
import { IncomeType } from '../account/model/STBConfigModeComp';
import { AccountCoinType } from '../account/AccountDefine';
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

    start() {
        this.btn_collectGold.node.on(Button.EventType.CLICK, this.UseCollectGold, this);
        this.btn_collectGem.node.on(Button.EventType.CLICK, this.UseCollectGem, this);
        coinPoolVM.Init();
        this.initUI();
    }

    private initUI() {
        let config = smc.account.getSTBConfigByType(STBTypeID.STB_Gold_Level10);
        if(config == null) return;
        this.schedule(this.updateGoldPool, config.incomeCycle, macro.REPEAT_FOREVER, config.incomeCycle);
        this.playAnim(this.gold_num, coinPoolVM.GoldNum);

        config = smc.account.getSTBConfigByType(STBTypeID.STB_Gem);
        if(config == null) return;
        this.schedule(this.updateGenPool, config.incomeCycle, macro.REPEAT_FOREVER, config.incomeCycle);
        this.btn_collectGem.node.active = coinPoolVM.GemNum > 0;
        this.playAnim(this.gem_num, coinPoolVM.GemNum, () => {
            this.btn_collectGem.node.active = coinPoolVM.GemNum > 0;
        });
    }

    /** 收集金币池 */
    private async UseCollectGold() {
        if (coinPoolVM.GoldNum <= 0) return;
        coinPoolVM.GoldNum = 0;
        smc.account.UseCollectCoin(AccountCoinType.Gold);
        // 通知主界面播放金币动画
        oops.message.dispatchEvent(AccountEvent.UserCollectGold);
        this.playAnim(this.gold_num, coinPoolVM.GoldNum);
    }

    /** 点击收集宝石 */
    private async UseCollectGem() {
        if (coinPoolVM.GemNum <= 0) return;
        coinPoolVM.GemNum = 0;
        smc.account.UseCollectCoin(AccountCoinType.Gems);
        this.playAnim(this.gem_num, coinPoolVM.GemNum, () => {
            this.btn_collectGem.node.active = false;
        });
    }

    /** 更新金币池 */
    private updateGoldPool() {
        coinPoolVM.GoldNum = Number(coinPoolVM.GoldNum) + Number(coinPoolVM.GoldSpeed);
        this.playAnim(this.gold_num, coinPoolVM.GoldNum);
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