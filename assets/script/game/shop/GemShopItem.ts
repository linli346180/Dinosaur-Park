import { Label } from 'cc';
import { _decorator, Component } from 'cc';
import { BuyGemsConfig } from './MergeDefine';
import { Button } from 'cc';
import { oops } from '../../../../extensions/oops-plugin-framework/assets/core/Oops';
const { ccclass, property } = _decorator;

@ccclass('GemShopItem')
export class GemShopItem extends Component {
    @property(Label)
    gemsNumber: Label = null!;
    @property(Label)
    dollarAmount: Label = null!;
    @property(Label)
    rebate: Label = null!;
    @property(Button)
    btn_buy: Button = null!;

    private config: BuyGemsConfig = null!;

    onLoad() {
        this.btn_buy.node.on(Button.EventType.CLICK, this.buyGems, this);
    }

    public initItem(config: BuyGemsConfig) {
        console.log("购买参数:", config);
        this.config = config;
        this.gemsNumber.string = `x${config.gemsNumber}`;
        this.dollarAmount.string = `$${config.dollarAmount}`;
        this.rebate.string = `+${config.rebate}%`;
    }

    private buyGems() {
        console.log("购买宝石:", this.config.id);
        oops.gui.toast("common_tips_Not_Enabled", true);
    }

}