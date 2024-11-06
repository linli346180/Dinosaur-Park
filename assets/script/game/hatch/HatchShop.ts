import { _decorator, Component, Node, Button, Prefab, instantiate, Label } from 'cc';
import { oops } from '../../../../extensions/oops-plugin-framework/assets/core/Oops';
import { UIID } from '../common/config/GameUIConfig';
import { HatchNetService } from './HatchNet';
import { HatchPriceConfig } from './HatchDefine';
import { HatchPriceItem } from './HatchPriceItem';
import { moneyUtil } from '../common/utils/moneyUtil';
import { AccountEvent } from '../account/AccountEvent';
import { smc } from '../common/SingletonModuleComp';
import { tween } from 'cc';
import { v3 } from 'cc';
import { Vec3 } from 'cc';
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

    private isInit = false;

    protected onEnable(): void {
        tween()
        .target(this.node)
        .to(0.15, { scale: v3(1.1, 1.1, 1), }, { easing: 'fade' })
        .to(0.15, { scale: Vec3.ONE, }, { easing: 'fade' })
        .start()

        this.initCoinData();
        if (!this.isInit)
            this.initPriceItem();
    }

    start() {
        this.isInit = true;
        this.btn_close?.node.on(Button.EventType.CLICK, () => { oops.gui.remove(UIID.HatchShop, false); }, this);
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

    /** 获取孵蛋次数价格 */
    private async initPriceItem() { 
        this.content.removeAllChildren();
        const priceDataList = await HatchNetService.getHatchPrice();
        if (priceDataList) {
            priceDataList.sort((a: HatchPriceConfig, b: HatchPriceConfig) => a.id - b.id);
            priceDataList.forEach((priceData: HatchPriceConfig) => {
                this.createPriceItem(priceData);
            });
        }
    }

    private createPriceItem(priceData: HatchPriceConfig) {
        const item = instantiate(this.hatchPriceItem);
        if (item) {
            item.parent = this.content;
            item.getComponent<HatchPriceItem>(HatchPriceItem)?.initItem(priceData);
        }
    }

    initCoinData() {
        let coinData = smc.account.AccountModel.CoinData;
        this.gemNum.string = Math.floor(coinData.gemsCoin).toString();
    } 
}
