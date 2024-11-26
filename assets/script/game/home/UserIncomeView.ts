import { _decorator, Component, Node, macro, Label, Button } from 'cc';
import { AccountNetService } from '../account/AccountNet';
import { oops } from '../../../../extensions/oops-plugin-framework/assets/core/Oops';
import { AccountEvent } from '../account/AccountEvent';
import { coinPoolVM } from '../account/viewModel/CoinPoolViewModel';
import { smc } from '../common/SingletonModuleComp';
import { tween } from 'cc';
import { STBTypeID } from '../character/STBDefine';
import { IncomeType, UserInstbConfigData } from '../account/model/STBConfigModeComp';
import { AccountCoinType } from '../account/AccountDefine';
import { GameEvent } from '../common/config/GameEvent';
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


    private goldConfig: UserInstbConfigData = null;
    private gemConfig: UserInstbConfigData = null;

    start() {
        this.btn_collectGold.node.on(Button.EventType.CLICK, this.UseCollectGold, this);
        this.btn_collectGem.node.on(Button.EventType.CLICK, this.UseCollectGem, this);

        oops.message.on(GameEvent.NetConnectFail, this.onHandler, this);

        coinPoolVM.Init();
        this.initUI();
    }

    protected onDestroy(): void {
        oops.message.off(GameEvent.NetConnectFail, this.onHandler, this);
    }

    private onHandler() {
        console.log("停止金币池更新")
        this.unschedule(this.updateGoldPool);
        this.unschedule(this.updateGenPool);
    }

    private initUI() {
        this.goldConfig = smc.account.getSTBConfigByType(STBTypeID.STB_Gold_Level10);
        if (this.goldConfig == null) return;
        this.schedule(this.updateGoldPool, this.goldConfig.incomeCycle + 5, macro.REPEAT_FOREVER, this.goldConfig.incomeCycle);
        this.playAnim(this.gold_num, coinPoolVM.GoldNum);

        this.gemConfig = smc.account.getSTBConfigByType(STBTypeID.STB_Gem);
        if (this.gemConfig == null) return;

        this.schedule(this.updateGenPool, this.gemConfig.incomeCycle + 5, macro.REPEAT_FOREVER, this.gemConfig.incomeCycle);

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
        this.playAnim(this.gold_num, coinPoolVM.GoldNum);
        // 通知主界面播放金币动画
        oops.message.dispatchEvent(AccountEvent.UserCollectGold);

        // 重启定时器
        this.unschedule(this.updateGoldPool);
        this.schedule(this.updateGoldPool, this.goldConfig.incomeCycle + 5, macro.REPEAT_FOREVER, this.goldConfig.incomeCycle);
    }

    /** 点击收集宝石 */
    private async UseCollectGem() {
        if (coinPoolVM.GemNum <= 0) return;
        coinPoolVM.GemNum = 0;
        smc.account.UseCollectCoin(AccountCoinType.Gems);
        this.playAnim(this.gem_num, coinPoolVM.GemNum, () => {
            this.btn_collectGem.node.active = false;
        });

        // 重启定时器
        this.unschedule(this.updateGenPool);
        this.schedule(this.updateGenPool, this.gemConfig.incomeCycle + 5, macro.REPEAT_FOREVER, this.gemConfig.incomeCycle);
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