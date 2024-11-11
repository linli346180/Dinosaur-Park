import { _decorator, Component, Button, Label, Node, Prefab, instantiate } from 'cc';
import { oops } from '../../../../extensions/oops-plugin-framework/assets/core/Oops';
import { UIID } from '../common/config/GameUIConfig';
import { AccountNetService } from '../account/AccountNet';
import { StringUtil } from '../common/utils/StringUtil';
import { smc } from '../common/SingletonModuleComp';
import { AccountEvent } from '../account/AccountEvent';
import { AnimUtil } from '../common/utils/AnimUtil';
import { BuyGemsConfig } from './MergeDefine';
import { GemShopItem } from './GemShopItem';

const { ccclass, property } = _decorator;

/** 宝石商店 */
@ccclass('GemShop')
export class GemShop extends Component {
    @property(Button)
    btn_close: Button = null!;
    @property(Label)
    gemNum: Label = null!;

    @property({type: Node,})
    public itemContent: Node = null!;
    @property(Prefab)
    itemPrefab: Prefab = null!;

    async onLoad() {
        this.itemContent.removeAllChildren();
        const res = await AccountNetService.getBugGemConfig();
        if (res && res.buyGemsConfigArr != null) {
            let gemConfigs: BuyGemsConfig[] = res.buyGemsConfigArr;
            gemConfigs.sort((a, b) => a.id - b.id);
            for (const gemConfig of gemConfigs) {
                let itemNode = instantiate(this.itemPrefab);
                if(itemNode){
                    this.itemContent.addChild(itemNode);
                    itemNode.getComponent(GemShopItem)?.initItem(gemConfig);
                } 
            }
        }
    }

    onEnable() {
        this.initCoinData();
    }

    start() {
        this.btn_close?.node.on(Button.EventType.CLICK, this.closeUI, this);
        oops.message.on(AccountEvent.CoinDataChange, this.initCoinData, this);
    }

    onDestroy() {
        oops.message.off(AccountEvent.CoinDataChange, this.initCoinData, this);
    }

    private initCoinData() {
        this.gemNum.string = Math.floor(smc.account.AccountModel.CoinData.gemsCoin).toString();
    }

    private closeUI() {
        oops.gui.remove(UIID.GemShop, false);
    }
}