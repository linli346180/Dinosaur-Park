import { Label } from 'cc';
import { Button } from 'cc';
import { _decorator, Component, Node } from 'cc';
import { AccountNetService } from '../account/AccountNet';
import { oops } from '../../../../extensions/oops-plugin-framework/assets/core/Oops';
import { AccountEvent } from '../account/AccountEvent';
import { CoinPoolViewModel } from '../account/viewModel/CoinPoolViewModel';
import { moneyUtil } from '../common/utils/moneyUtil';
import { macro } from 'cc';
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
    @property(Label)
    gem_speed: Label = null!;

    // 金币池数据
    private coinPoolVM: CoinPoolViewModel = new CoinPoolViewModel();
    private interval: number = 15;

    start() {
        this.btn_collectGold.node.on(Button.EventType.CLICK, this.collect, this);
        this.btn_collectGem.node.on(Button.EventType.CLICK, this.collect, this);

        oops.message.on(AccountEvent.AddInComeSTB, this.onHandler, this);
        oops.message.on(AccountEvent.DedIncomeSTB, this.onHandler, this);
        oops.message.on(AccountEvent.LoginSuccess, this.onHandler, this);
        oops.message.on(AccountEvent.UserCollectCoin, this.onHandler, this);
        this.coinPoolVM.Init();
        this.initUI();
    }

    private onHandler(event: string, args: any) {
        switch (event) {
            case AccountEvent.AddInComeSTB:
            case AccountEvent.DedIncomeSTB:
            case AccountEvent.LoginSuccess:
            case AccountEvent.UserCollectCoin:
                this.initUI();
                break
        }
    }

    private async collect() {
        console.log("user collect coin");
        const res = await AccountNetService.UserCoinReceive();
        if (res) {
            this.coinPoolVM.GoldNum = 0;
            this.coinPoolVM.GemNum = 0;
            oops.message.dispatchEvent(AccountEvent.UserCollectCoin);
        }
    }

    private initUI() {
        this.gold_speed.string = moneyUtil.formatMoney(Math.floor(this.coinPoolVM.GoldSpeed / 60)).toString() + "/s";
        this.gem_speed.string = moneyUtil.formatMoney(Math.floor(this.coinPoolVM.gemSpeed / 60)).toString() + "/s";
        this.gold_num.string = moneyUtil.formatMoney(this.coinPoolVM.GoldNum);
        this.gem_num.string = moneyUtil.formatMoney(this.coinPoolVM.GemNum);

        // 间隔x秒后更新一次收益
        this.unschedule(this.updateCoinPool);
        this.schedule(this.updateCoinPool, this.interval, macro.REPEAT_FOREVER, 5);
    }

    private updateCoinPool() {
        this.coinPoolVM.GoldNum += Math.floor(this.coinPoolVM.GoldSpeed * this.interval / 60);
        this.coinPoolVM.GemNum += Math.floor(this.coinPoolVM.gemSpeed * this.interval / 60);
        this.gold_num.string = moneyUtil.formatMoney(this.coinPoolVM.GoldNum);
        this.gem_num.string = moneyUtil.formatMoney(this.coinPoolVM.GemNum);
    }
}