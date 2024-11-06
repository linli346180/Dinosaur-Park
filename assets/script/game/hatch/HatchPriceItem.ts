import { _decorator, Component, Node, Label, Button } from 'cc';
import { CoinType, HatchPriceConfig, UserHatchEvent } from './HatchDefine';
import { HatchNetService } from './HatchNet';
import { oops } from '../../../../extensions/oops-plugin-framework/assets/core/Oops';
import { AccountEvent } from '../account/AccountEvent';
import { NetErrorCode } from '../../net/custom/NetErrorCode';
import { AccountNetService } from '../account/AccountNet';
import { smc } from '../common/SingletonModuleComp';
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

    @property(Node)
    maskNode: Node = null!;

    private _priceData: HatchPriceConfig = null!;

    start() {
        this.btn_buy.node.on(Button.EventType.CLICK, this.buyHatchNum, this);
    }

    async initItem(priceData: HatchPriceConfig) {
        this._priceData = priceData;
        this._priceData.purNum = 0;

        this.hatchNum.string = "X" + priceData.hatchNum.toString();
        this.hatchPrice.string = priceData.purNeedCoinNum.toString();
        this.coin_1.active = priceData.conCoinType === CoinType.Gold;
        this.coin_2.active = priceData.conCoinType === CoinType.Gems;
        this.coin_3.active = priceData.conCoinType === CoinType.StarBeast;
        this.coin_4.active = priceData.conCoinType === CoinType.USDT;

        this.checkLimitedNum();
    }

    private async checkLimitedNum() {
        if (this._priceData.limitedNum > 0) {
            const res = await HatchNetService.getHatchPurNum(this._priceData.id);
            if (res) {
                this._priceData.purNum = res.purNum;
                this.maskNode.active = this._priceData.purNum >= this._priceData.limitedNum; 
            }
        }
    }

    async buyHatchNum() {
        const res = await HatchNetService.requestHatchNum(this._priceData.id);
        if (res && res.resultCode == NetErrorCode.Success) {
            this._priceData.purNum++;
            if(this._priceData.limitedNum > 0 && this._priceData.purNum >= this._priceData.limitedNum)
                this.maskNode.active = false;

            smc.account.updateCoinData(); // 刷新金币数量
            oops.message.dispatchEvent(UserHatchEvent.HatchRemailChange, res.userHatch.remainNum);
            oops.gui.toast("购买成功");
            return;
        }
        oops.gui.toast("购买失败:" + res.resultMsg);
    }
}