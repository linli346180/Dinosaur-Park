import { _decorator, Component, Button, Label } from 'cc';
import { AccountNetService } from '../account/AccountNet';
import { IUserCoinData } from '../account/AccountDefine';
import { moneyUtil } from '../common/utils/moneyUtil';
import { oops } from '../../../../extensions/oops-plugin-framework/assets/core/Oops';
import { UIID } from '../common/config/GameUIConfig';
import { AccountEvent } from '../account/AccountEvent';
const { ccclass, property } = _decorator;

@ccclass('UserCoinView')
export class UserCoinView extends Component {
    @property(Label)
    goldCoin: Label = null!;
    @property(Label)
    gemsCoin: Label = null!;
    @property(Label)
    starBeastCoin: Label = null!;
    @property(Label)
    usdtCoin: Label = null!;
    @property(Button)
    btn_buygem: Button = null!;
    @property(Button)
    btn_buyusdt: Button = null!;

    start() {
        this.btn_buygem?.node.on(Button.EventType.CLICK, this.buyGem, this);
        this.btn_buyusdt?.node.on(Button.EventType.CLICK, this.buyUsdt, this);
        oops.message.on(AccountEvent.CoinDataChange, this.onHandler, this);
        this.initUI();
    }

    onDestroy() {
        oops.message.off(AccountEvent.CoinDataChange, this.onHandler, this);
    }   

    private onHandler(event: string, args: any) {
        switch (event) {
            case AccountEvent.CoinDataChange: this.initUI(); break
        }
    }

    async initUI() {
        let coinData: IUserCoinData = await AccountNetService.getUserCoinData();
        if (coinData) {
            this.goldCoin.string = moneyUtil.formatMoney(coinData.goldCoin);
            this.gemsCoin.string = moneyUtil.formatMoney(coinData.gemsCoin);
            this.starBeastCoin.string = moneyUtil.formatMoney(coinData.starBeastCoin);
            this.usdtCoin.string = moneyUtil.formatMoney(coinData.usdt);
        }
    }

    buyGem() {
        oops.gui.open(UIID.GemShop)
    }

    buyUsdt() {
        console.log("buyusdt");
    }
}


