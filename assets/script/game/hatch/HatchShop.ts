import { Button } from 'cc';
import { _decorator, Component, Node } from 'cc';
import { oops } from '../../../../extensions/oops-plugin-framework/assets/core/Oops';
import { UIID } from '../common/config/GameUIConfig';
import { HatchNetService } from './HatchNet';
import { HatchPriceConfig } from './HatchDefine';
import { Prefab } from 'cc';
import { instantiate } from 'cc';
import { HatchPriceItem } from './HatchPriceItem';
import { Label } from 'cc';
import { AccountNetService } from '../account/AccountNet';
import { moneyUtil } from '../common/utils/moneyUtil';
import { IUserCoinData } from '../account/AccountDefine';
const { ccclass, property } = _decorator;

/** 孵化商店:
 * 使用砖石购买孵化次数 */
@ccclass('HatchShop')
export class HatchShop extends Component {
    @property(Prefab)
    hatchPriceItem: Prefab = null!;
    @property(Button)
    btn_close: Button = null!;
    @property(Node)
    content: Node = null!;
    @property(Label)
    gemNum: Label = null!;

    protected onLoad(): void {
        this.content.removeAllChildren();
    }

    start() {
        this.btn_close?.node.on(Button.EventType.CLICK, this.closeUI, this);
        this.initUI();
    }

    async initUI() {
        this.content.removeAllChildren();
        const priceDataList = await HatchNetService.getHatchPrice();
        if (priceDataList) {
            priceDataList.sort((a: HatchPriceConfig, b: HatchPriceConfig) => a.id - b.id);
            priceDataList.forEach((priceData: HatchPriceConfig) => {
                this.createItem(priceData);
            });
        }

        const userCoinData = await AccountNetService.getUserCoinData()
        if (userCoinData) {
            console.log("用户货币数据", userCoinData.gemsCoin);  
            this.gemNum.string = moneyUtil.formatMoney(userCoinData.gemsCoin);
        }
    }

    closeUI() {
        oops.gui.remove(UIID.HatchShop);
    }

    createItem(priceData: HatchPriceConfig) {
        const item = instantiate(this.hatchPriceItem);
        item.parent = this.content;
        item.getComponent<HatchPriceItem>(HatchPriceItem)?.initItem(priceData);
    }
}
