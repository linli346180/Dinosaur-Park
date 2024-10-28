import { _decorator, Component, Node, Button, Prefab, instantiate, Label } from 'cc';
import { oops } from '../../../../extensions/oops-plugin-framework/assets/core/Oops';
import { UIID } from '../common/config/GameUIConfig';
import { HatchNetService } from './HatchNet';
import { HatchPriceConfig } from './HatchDefine';
import { HatchPriceItem } from './HatchPriceItem';
import { moneyUtil } from '../common/utils/moneyUtil';
import { AccountEvent } from '../account/AccountEvent';
import { smc } from '../common/SingletonModuleComp';
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

    async onLoad() {
        this.content.removeAllChildren();
        const priceDataList = await HatchNetService.getHatchPrice();
        if (priceDataList) {
            priceDataList.sort((a: HatchPriceConfig, b: HatchPriceConfig) => a.id - b.id);
            priceDataList.forEach((priceData: HatchPriceConfig) => {
                this.createItem(priceData);
            });
        }
        this.initCoinData();
    }

    protected onEnable(): void {
        this.initCoinData();
    }

    start() {
        this.btn_close?.node.on(Button.EventType.CLICK, this.closeUI, this);
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

    initCoinData() {
        let coinData = smc.account.AccountModel.CoinData;
        this.gemNum.string = moneyUtil.formatMoney(coinData.gemsCoin);
    }

    closeUI() {
        oops.gui.remove(UIID.HatchShop, false);
    }

    createItem(priceData: HatchPriceConfig) {
        const item = instantiate(this.hatchPriceItem);
        if (item) {
            item.parent = this.content;
            item.getComponent<HatchPriceItem>(HatchPriceItem)?.initItem(priceData);
        }
    }
}
