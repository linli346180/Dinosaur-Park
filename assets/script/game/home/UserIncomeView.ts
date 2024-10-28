import { _decorator, Component, Node, macro, Label, Button } from 'cc';
import { AccountNetService } from '../account/AccountNet';
import { oops } from '../../../../extensions/oops-plugin-framework/assets/core/Oops';
import { AccountEvent } from '../account/AccountEvent';
import { coinPoolVM } from '../account/viewModel/CoinPoolViewModel';
import { smc } from '../common/SingletonModuleComp';
import { tween } from 'cc';
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

    private intervalSec: number = 15;   // 间隔时间
    private gemMinShow: number = 15; // 宝石最小显示数量
    private goldMinsHow: number = 500; // 金币最小显示数量

    start() {
        this.btn_collectGold.node.on(Button.EventType.CLICK, this.UseCollectGold, this);
        this.btn_collectGem.node.on(Button.EventType.CLICK, this.UseCollectGem, this);
        oops.message.on(AccountEvent.AddInComeSTB, this.onHandler, this);
        oops.message.on(AccountEvent.DelIncomeSTB, this.onHandler, this);
        oops.message.on(AccountEvent.UserCollectGold, this.onHandler, this);
        coinPoolVM.Init();
        this.initUI();
    }

    private onHandler(event: string, args: any) {
        switch (event) {
            case AccountEvent.AddInComeSTB:
            case AccountEvent.DelIncomeSTB:
            case AccountEvent.UserCollectGold:
                this.initUI();
                break
        }
    }

    private async UseCollectGold() {
        if (coinPoolVM.GoldNum <= this.goldMinsHow) return;
        coinPoolVM.GoldNum = 0;

        const res = await AccountNetService.UseCollectCoin();
        if (res) {
            smc.account.AccountModel.CoinData = res.userCoin;
            oops.message.dispatchEvent(AccountEvent.CoinDataChange);
        }
        oops.message.dispatchEvent(AccountEvent.UserCollectGold);
    }

    private async UseCollectGem() {
        if (coinPoolVM.GemNum <= 0) return;
        this.btn_collectGem.node.active = false;
        coinPoolVM.GemNum = 0;

        const res = await AccountNetService.UseCollectGem();
        if (res) {
            smc.account.AccountModel.CoinData = res.userCoin;
            oops.message.dispatchEvent(AccountEvent.CoinDataChange);
        }
    }

    private initUI() {
        this.gold_speed.string = Math.floor(coinPoolVM.GoldSpeed / 60).toString() + "/s";

        this.gold_num.string = coinPoolVM.GoldNum.toString();
        this.gem_num.string = coinPoolVM.GemNum.toString();

        this.btn_collectGem.node.active = coinPoolVM.GemNum > 0;

        this.unschedule(this.updateCoinPool);
        this.schedule(this.updateCoinPool, this.intervalSec, macro.REPEAT_FOREVER, 0);
    }

    private updateCoinPool() {
        coinPoolVM.GoldNum += Math.floor(coinPoolVM.GoldSpeed * this.intervalSec / 60);
        coinPoolVM.GemNum += Math.floor(coinPoolVM.GemSpeed * this.intervalSec / 60);

        this.btn_collectGem.node.active = coinPoolVM.GemNum > 0;

        this.playAnim(this.gold_num, coinPoolVM.GoldNum);
        this.playAnim(this.gem_num, coinPoolVM.GemNum);
    }

    private playAnim(label: Label, endNum: number) {
        let startNum = parseInt(label.string);
        tween(label)
            .to(0.5, {}, {
                onUpdate: (target, ratio) => { label.string = Math.floor(startNum + (endNum - startNum) * ratio).toString(); }
            })
            .start();
    }
}