import { _decorator, Component, Node, Button, Label, Prefab, instantiate } from 'cc';
import { oops } from '../../../../extensions/oops-plugin-framework/assets/core/Oops';
import { UIID } from '../common/config/GameUIConfig';
import { IsPur, PurConCoin, UserInstbConfigData } from '../account/model/STBConfigModeComp';
import { STBPurItem } from './STBPurItem';
import { smc } from '../common/SingletonModuleComp';
import { AccountEvent } from '../account/AccountEvent';
const { ccclass, property } = _decorator;

/** 
 *  星兽商店:使用砖石购买星兽
 */
@ccclass('STBPurShop')
export class STBPurShop extends Component {
    @property(Prefab)
    itemPrefab: Prefab = null!;
    @property(Label)
    gemNum: Label = null!;
    @property(Node)
    content: Node = null!;
    @property(Button)
    btn_close: Button = null!;
    private configDataList: UserInstbConfigData[] = [];

    onLoad() {
        this.btn_close?.node.on(Button.EventType.CLICK, () => { oops.gui.remove(UIID.STBShop, false) }, this);
        oops.message.on(AccountEvent.CoinDataChange, this.initCoinData, this);
        this.initUI();
        oops.message.on(AccountEvent.GemExtraPrizeChange, this.GemExtraPrizeChange, this);
    }

    GemExtraPrizeChange() {
        this.initUI();
    }

    protected onDestroy(): void {
        oops.message.off(AccountEvent.CoinDataChange, this.initCoinData, this);
    }

    onEnable() {
        this.initCoinData();
    }

    initCoinData() {
        this.gemNum.string = Math.floor(smc.account.AccountModel.CoinData.gemsCoin).toString();
    }

    private initUI() {
        this.content.removeAllChildren();
        this.getSTBConfig_PurGem();
        this.configDataList.forEach(element => {
            let item = instantiate(this.itemPrefab);
            item.parent = this.content;
            item.getComponent(STBPurItem)?.initItem(element);
        });
        this.initCoinData();
    }

    /** 获取使用宝石购买的星兽配置 */
    getSTBConfig_PurGem() {
        this.configDataList = [];
        smc.account.STBConfigMode.instbConfigData.forEach(element => {
            if (element.isPur === IsPur.Yes && element.purConCoin === PurConCoin.gems) {
                this.configDataList.push(element);
            }
        });
        this.configDataList.sort((a, b) => a.id - b.id);
    }
}