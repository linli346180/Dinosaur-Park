import { _decorator, Component, Button, Label } from 'cc';
import { oops } from '../../../../extensions/oops-plugin-framework/assets/core/Oops';
import { UIID } from '../common/config/GameUIConfig';
import { AccountNetService } from '../account/AccountNet';
import { StringUtil } from '../common/utils/StringUtil';
import { smc } from '../common/SingletonModuleComp';
import { AccountEvent } from '../account/AccountEvent';
import { tween } from 'cc';
import { v3 } from 'cc';
import { Vec3 } from 'cc';
import { AnimUtil } from '../common/utils/AnimUtil';
import { BuyGemsConfig } from './MergeDefine';
import { Prefab } from 'cc';
import { instantiate } from 'cc';
import { GemShopItem } from './GemShopItem';
const { ccclass, property } = _decorator;

/** 宝石商店 */
@ccclass('GemShop')
export class GemShop extends Component {
    @property(Button)
    btn_close: Button = null!;
    @property(Label)
    gemNum: Label = null!;

    @property(Node)
    gemsContainer: Node = null!;

    @property(Prefab)
    gemShopItem: Prefab = null!;

    async onLoad() {
        const res = await AccountNetService.getBugGemConfig();
        if (res && res.buyGemsConfigArr != null) {
            let gemConfigs: BuyGemsConfig[] = res.buyGemsConfigArr;
            gemConfigs.sort((a, b) => a.id - b.id);
            for (const gemConfig of gemConfigs) {
                let item = instantiate(this.gemShopItem);
                // this.gemsContainer.appendChild(item);
                // item.getComponent(GemShopItem)?.initItem(gemConfig);
            }
        }
    }

    onEnable() {
        AnimUtil.playAnim_Scale(this.node);
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

    private buyGemLv1() {
        const tips = oops.language.getLangByID("common_tips_Not_Enabled");
        oops.gui.toast(tips);
    }
}