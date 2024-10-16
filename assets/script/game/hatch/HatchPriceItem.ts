import { _decorator, Component, Node, Label, Button } from 'cc';
import { CoinType, HatchPriceConfig, UserHatchEvent } from './HatchDefine';
import { HatchNetService } from './HatchNet';
import { oops } from '../../../../extensions/oops-plugin-framework/assets/core/Oops';
import { AccountEvent } from '../account/AccountEvent';
import { NetErrorCode } from '../../net/custom/NetErrorCode';
const { ccclass, property } = _decorator;

@ccclass('HatchPriceItem')
export class HatchPriceItem extends Component {
    @property(Node)
    coin_1: Node = null!;
    @property(Node)
    coin_2: Node = null!;
    @property(Node)
    coin_3: Node = null!;
    @property(Node)
    coin_4: Node = null!;
    @property(Label)
    hatchNum: Label = null!;
    @property(Label)
    hatchPrice: Label = null!;
    @property(Button)
    btn_buy: Button = null!;

    private _priceData: HatchPriceConfig = null!;

    start() {
        this.btn_buy.node.on(Button.EventType.CLICK, this.buyHatchNum, this);
    }

    initItem(priceData: HatchPriceConfig) {
        this._priceData = priceData;
        this.hatchNum.string = "X" + priceData.hatchNum.toString();
        this.hatchPrice.string = priceData.purNeedCoinNum.toString();
        this.coin_1.active = priceData.conCoinType === CoinType.Gold;
        this.coin_2.active = priceData.conCoinType === CoinType.Gems;
        this.coin_3.active = priceData.conCoinType === CoinType.StarBeast;
        this.coin_4.active = priceData.conCoinType === CoinType.USDT;
    }

    async buyHatchNum() {
        const res = await HatchNetService.requestHatchNum(this._priceData.id);
        if (res && res.resultCode == NetErrorCode.Success) {
            oops.message.dispatchEvent(AccountEvent.CoinDataChange);
            oops.message.dispatchEvent(UserHatchEvent.HatchNumChange);
            oops.gui.toast("购买成功");
            return;
        }
        oops.gui.toast("购买失败:" + res.resultMsg);
    }
}