import { _decorator, Component, Node, Button, Label, Prefab, instantiate } from 'cc';
import { oops } from '../../../../extensions/oops-plugin-framework/assets/core/Oops';
import { UIID } from '../common/config/GameUIConfig';
import { StringUtil } from '../common/utils/StringUtil';
import { IsPur, PurConCoin, UserInstbConfigData } from '../account/model/STBConfigModeComp';
import { STBPurItem } from './STBPurItem';
import { smc } from '../common/SingletonModuleComp';
import { AccountEvent } from '../account/AccountEvent';
import { tween } from 'cc';
import { v3 } from 'cc';
import { Vec3 } from 'cc';
import { AnimUtil } from '../common/utils/AnimUtil';
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

    start() {
        this.btn_close?.node.on(Button.EventType.CLICK, () => { oops.gui.remove(UIID.STBShop) }, this);
        oops.message.on(AccountEvent.CoinDataChange, this.onHandler, this);
        AnimUtil.playAnim_Scale(this.node);
        this.initUI();
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