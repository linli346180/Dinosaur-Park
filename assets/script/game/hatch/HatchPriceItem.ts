import { Label } from 'cc';
import { _decorator, Component, Node } from 'cc';
import { CoinType, HatchPriceConfig, HserHatchEvent } from './HatchDefine';
import { Button } from 'cc';
import { HatchNetService } from './HatchNet';
import { oops } from '../../../../extensions/oops-plugin-framework/assets/core/Oops';
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
        this.btn_buy.node.on(Button.EventType.CLICK, this.buy, this);
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

    buy() {
        console.log("buy")
        HatchNetService.requestHatchNum(this._priceData.id).then((response) => {
            if(response)
            {   
                console.log("剩余次数:" + response.remainNum)
                oops.message.dispatchEvent(HserHatchEvent.RemainNumChange, response.remainNum)
            }
        });
    }
}