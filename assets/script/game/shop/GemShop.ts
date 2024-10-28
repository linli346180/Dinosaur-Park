import { _decorator, Component, Button, Label } from 'cc';
import { oops } from '../../../../extensions/oops-plugin-framework/assets/core/Oops';
import { UIID } from '../common/config/GameUIConfig';
import { AccountNetService } from '../account/AccountNet';
import { moneyUtil } from '../common/utils/moneyUtil';
import { smc } from '../common/SingletonModuleComp';
import { AccountEvent } from '../account/AccountEvent';
const { ccclass, property } = _decorator;

/** 宝石商店 */
@ccclass('GemShop')
export class GemShop extends Component {
    @property(Button)
    btn_close: Button = null!;
    @property(Label)
    gemNum: Label = null!;
    @property(Button)
    btn_buy_lv1: Button = null!;
    @property(Button)
    btn_buy_lv2: Button = null!;
    @property(Button)
    btn_buy_lv3: Button = null!;
    @property(Button)
    btn_buy_lv4: Button = null!;

    onEnable() {
        this.initCoinData();
    }

    start() {
        this.btn_close?.node.on(Button.EventType.CLICK, this.closeUI, this);
        this.btn_buy_lv1?.node.on(Button.EventType.CLICK, this.buyGemLv1, this);
        this.btn_buy_lv2?.node.on(Button.EventType.CLICK, this.buyGemLv2, this);
        this.btn_buy_lv3?.node.on(Button.EventType.CLICK, this.buyGemLv3, this);
        this.btn_buy_lv4?.node.on(Button.EventType.CLICK, this.buyGemLv4, this);
        oops.message.on(AccountEvent.CoinDataChange, this.onHandler, this);
    }

    onDestroy() {
        oops.message.off(AccountEvent.CoinDataChange, this.onHandler, this);
    }

    private onHandler(event: string, args: any) {
        switch (event) {
            case AccountEvent.CoinDataChange:
                this.initCoinData();
                break
        }
    }

    private initCoinData() {
        let coinData = smc.account.AccountModel.CoinData;
        if (coinData) {
            this.gemNum.string = moneyUtil.formatMoney(coinData.gemsCoin);
        }
    }

    private closeUI() {
        oops.gui.remove(UIID.GemShop, false);
    }

    private buyGemLv1() {
        const tips = oops.language.getLangByID("common_tips_Not_Enabled");
        oops.gui.toast(tips);
    }
    private buyGemLv2() {
        const tips = oops.language.getLangByID("common_tips_Not_Enabled");
        oops.gui.toast(tips);
    }
    private buyGemLv3() {
        const tips = oops.language.getLangByID("common_tips_Not_Enabled");
        oops.gui.toast(tips);
    }
    private buyGemLv4() {
        const tips = oops.language.getLangByID("common_tips_Not_Enabled");
        oops.gui.toast(tips);
    }
}