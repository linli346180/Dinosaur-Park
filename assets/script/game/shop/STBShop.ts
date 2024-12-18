import { Button } from 'cc';
import { _decorator, Component, Node } from 'cc';
import { oops } from '../../../../extensions/oops-plugin-framework/assets/core/Oops';
import { UIID } from '../common/config/GameUIConfig';
import { IUserCoinData } from '../account/AccountDefine';
import { AccountNetService } from '../account/AccountNet';
import { Label } from 'cc';
import { moneyUtil } from '../common/utils/moneyUtil';
import { IsPur, PurConCoin, UserInstbConfigData } from '../account/model/STBConfigModeComp';
import { Prefab } from 'cc';
import { instantiate } from 'cc';
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

    start() {
        this.btn_close?.node.on(Button.EventType.CLICK, ()=>{oops.gui.remove(UIID.STBShop, false)}, this);
        oops.message.on(AccountEvent.CoinDataChange, this.onHandler, this);
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
    
    async initCoinData() {
        const userCoinData = await AccountNetService.getUserCoinData()
        if (userCoinData) {
            console.log("用户货币数据", userCoinData.gemsCoin);  
            this.gemNum.string = moneyUtil.formatMoney(userCoinData.gemsCoin);
        }
    }

    async initUI() {
        this.content.removeAllChildren();
        this.getSTBConfig_PurGem(smc.account.STBConfigMode.instbConfigData);
        this.configDataList.sort((a, b) => a.id - b.id);
        this.configDataList.forEach(element => {
            let item = instantiate(this.itemPrefab);
            item.parent = this.content;
            item.getComponent(STBPurItem)?.initItem(element);
        });

        this.initCoinData();
    }

    /** 获取使用宝石购买的星兽配置 */
    getSTBConfig_PurGem(userInstbConfig: UserInstbConfigData[]) {
        this.configDataList = [];
        userInstbConfig.forEach(element => {
            if (element.isPur === IsPur.Yes && element.purConCoin === PurConCoin.gems) {
                console.log("getSTBConfig_PurGem", element);
                this.configDataList.push(element);
            }
        });
    }
}