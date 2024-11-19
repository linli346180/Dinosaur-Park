import { _decorator, Component, Node, Button, Prefab, instantiate, Label } from 'cc';
import { oops } from '../../../../extensions/oops-plugin-framework/assets/core/Oops';
import { UIID } from '../common/config/GameUIConfig';
import { HatchNetService } from './HatchNet';
import { HatchPriceConfig } from './HatchDefine';
import { HatchPriceItem } from './HatchPriceItem';
import { AccountEvent } from '../account/AccountEvent';
import { smc } from '../common/SingletonModuleComp';
const { ccclass, property } = _decorator;

/** 孵化商店:
 * 使用砖石购买孵化次数 */
@ccclass('HatchShop')
export class HatchShop extends Component {
    @property(Prefab)
    private hatchPriceItem: Prefab = null!;
    @property(Button)
    private btn_close: Button = null!;
    @property(Node)
    private content: Node = null!;
    @property(Label)
    private  gemNum: Label = null!;

    onLoad() {
        this.initPriceItem();
        this.btn_close?.node.on(Button.EventType.CLICK, () => { oops.gui.remove(UIID.HatchShop, false); }, this);
        oops.message.on(AccountEvent.CoinDataChange, this.initCoinData, this);
    }

    onEnable() {
        this.initCoinData();            
    }

    onDestroy() {
        oops.message.off(AccountEvent.CoinDataChange, this.initCoinData, this);
    }

    private initCoinData() {
        this.gemNum.string = Math.floor(smc.account.AccountModel.CoinData.gemsCoin).toString();
    } 

    /** 获取孵蛋次数价格 */
    private async initPriceItem() { 
        this.content.removeAllChildren();
        const priceDataList = await HatchNetService.getHatchPrice();
        if (priceDataList) {
            priceDataList.sort((a: HatchPriceConfig, b: HatchPriceConfig) => a.id - b.id);
            priceDataList.forEach((priceData: HatchPriceConfig) => {
                this.createItem(priceData);
            });
        }
    }

    private createItem(priceData: HatchPriceConfig) {
        const item = instantiate(this.hatchPriceItem);
        if (item) {
            item.parent = this.content;
            item.getComponent(HatchPriceItem)?.initItem(priceData);
        }
    }
}
