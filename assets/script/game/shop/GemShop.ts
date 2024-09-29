import { Button } from 'cc';
import { _decorator, Component, Node } from 'cc';
import { oops } from '../../../../extensions/oops-plugin-framework/assets/core/Oops';
import { UIID } from '../common/config/GameUIConfig';
import { Label } from 'cc';
import { AccountNetService } from '../account/AccountNet';
import { IUserCoinData } from '../account/AccountDefine';
import { moneyUtil } from '../common/utils/moneyUtil';
const { ccclass, property } = _decorator;

/** 宝石商店 */
@ccclass('GemShop')
export class GemShop extends Component {
    private btn_close: Button = null!;

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

    async onLoad(){
        let coinData :IUserCoinData = await AccountNetService.getUserCoinData();
        if (coinData) {
            this.gemNum.string = moneyUtil.formatMoney(coinData.gemsCoin);
        }
    }

    start() {
        this.btn_close = this.node.getChildByName("btn_close")?.getComponent(Button)!;
        this.btn_close?.node.on(Button.EventType.CLICK, this.closeUI, this);
        this.btn_buy_lv1?.node.on(Button.EventType.CLICK, this.buyGemLv1, this);
        this.btn_buy_lv2?.node.on(Button.EventType.CLICK, this.buyGemLv2, this);
        this.btn_buy_lv3?.node.on(Button.EventType.CLICK, this.buyGemLv3, this);
        this.btn_buy_lv4?.node.on(Button.EventType.CLICK, this.buyGemLv4, this);
    }

    closeUI() {
        oops.gui.remove(UIID.GemShop, false);
    }

    buyGemLv1() {
        oops.gui.toast("暂不支持购买宝石");
    }
    buyGemLv2() {
        oops.gui.toast("暂不支持购买宝石");
    }
    buyGemLv3() {
        oops.gui.toast("暂不支持购买宝石");
    }
    buyGemLv4() {
        oops.gui.toast("暂不支持购买宝石");
    }
}