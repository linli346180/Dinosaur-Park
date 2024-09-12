import { Button } from 'cc';
import { _decorator, Component, Node } from 'cc';
import { oops } from '../../../../extensions/oops-plugin-framework/assets/core/Oops';
import { UIID } from '../common/config/GameUIConfig';
import { HatchNetService } from './HatchNet';
import { HatchPriceConfig } from './HatchDefine';
import { Prefab } from 'cc';
import { instantiate } from 'cc';
import { HatchPriceItem } from './HatchPriceItem';
const { ccclass, property } = _decorator;

/** 孵化商店:
 * 使用砖石购买孵化次数 */
@ccclass('HatchShop')
export class HatchShop extends Component {
    @property(Prefab)
    hatchPriceItem:Prefab = null!;
    @property(Button)
    btn_close: Button = null!;
    @property(Node)
    content: Node = null!;
   
    start() {
        this.btn_close?.node.on(Button.EventType.CLICK, this.closeUI, this);
        this.initUI();
    }

    async initUI() {
        this.content.removeAllChildren();
        const priceDataList = await HatchNetService.getHatchPrice();
        if (priceDataList) {
            priceDataList.forEach((priceData: HatchPriceConfig) => {
                this.createItem(priceData);
            });
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


