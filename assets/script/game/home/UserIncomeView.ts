import { _decorator, Component, Node, macro, Label, Button } from 'cc';
import { AccountNetService } from '../account/AccountNet';
import { oops } from '../../../../extensions/oops-plugin-framework/assets/core/Oops';
import { AccountEvent } from '../account/AccountEvent';
import { CoinPoolViewModel } from '../account/viewModel/CoinPoolViewModel';
import { moneyUtil } from '../common/utils/moneyUtil';
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

    private interval: number = 30;
    private coinPoolVM: CoinPoolViewModel = new CoinPoolViewModel();

    start() {
        this.btn_collectGold.node.on(Button.EventType.CLICK, this.UseCollectGold, this);
        this.btn_collectGem.node.on(Button.EventType.CLICK, this.UseCollectGem, this);
        oops.message.on(AccountEvent.AddInComeSTB, this.onHandler, this);
        oops.message.on(AccountEvent.DedIncomeSTB, this.onHandler, this);
        oops.message.on(AccountEvent.UserCollectGold, this.onHandler, this);
        this.coinPoolVM.Init();
        this.initUI();
    }

    private onHandler(event: string, args: any) {
        switch (event) {
            case AccountEvent.AddInComeSTB:
            case AccountEvent.DedIncomeSTB:
            case AccountEvent.UserCollectGold:
                this.initUI();
                break
        }
    }

    private async UseCollectGold() {
        if (this.coinPoolVM.GoldNum <= 0) return;
        this.coinPoolVM.GoldNum = 0;
        AccountNetService.UseCollectCoin();
        oops.message.dispatchEvent(AccountEvent.UserCollectGold);
    }

    private async UseCollectGem() {
        if (this.coinPoolVM.GemNum <= 0) return;
        this.btn_collectGem.node.active = false;
        this.coinPoolVM.GemNum = 0;
        AccountNetService.UseCollectGem();
    }

    private initUI() {
        this.gold_speed.string = moneyUtil.formatMoney(Math.floor(this.coinPoolVM.GoldSpeed / 60)).toString() + "/s";
        this.gold_num.string = moneyUtil.formatMoney(this.coinPoolVM.GoldNum);
        this.gem_num.string = moneyUtil.formatMoney(this.coinPoolVM.GemNum);
        this.btn_collectGem.node.active = this.coinPoolVM.GemNum > 0;

        this.unschedule(this.updateCoinPool);
        this.schedule(this.updateCoinPool, this.interval, macro.REPEAT_FOREVER, 0);
    }

    private updateCoinPool() {
        this.coinPoolVM.GoldNum += Math.floor(this.coinPoolVM.GoldSpeed * this.interval / 60);
        this.coinPoolVM.GemNum += Math.floor(this.coinPoolVM.gemSpeed * this.interval / 60);
        this.gold_num.string = moneyUtil.formatMoney(this.coinPoolVM.GoldNum);
        this.gem_num.string = moneyUtil.formatMoney(this.coinPoolVM.GemNum);
    }
}