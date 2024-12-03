import { _decorator, Component, Node, Button, Label, Sprite } from 'cc';
import { PurConCoin, UserInstbConfigData } from '../account/model/STBConfigModeComp';
import { TableSTBConfig } from '../common/table/TableSTBConfig';
import { oops } from '../../../../extensions/oops-plugin-framework/assets/core/Oops';
import { SpriteFrame } from 'cc';
import { StringUtil } from '../common/utils/StringUtil';
import { smc } from '../common/SingletonModuleComp';
import { UIID } from '../common/config/GameUIConfig';
import { AccountEvent } from '../account/AccountEvent';
const { ccclass, property } = _decorator;

@ccclass('STBPurItem')
export class STBPurItem extends Component {
    @property(Sprite)
    private icon: Sprite = null!;
    @property(Button)
    private btn_buy: Button = null!;
    @property(Label)
    private num: Label = null!;
    @property(Label)
    private stbName: Label = null!;
    @property(Label)
    private level: Label = null!;

    private config: UserInstbConfigData;
    private configId: number = 0;
    private STBConfig: TableSTBConfig = new TableSTBConfig();

    start() {
        this.btn_buy.node.on(Button.EventType.CLICK, this.onBuySTB, this);
    }

    initItem(config: UserInstbConfigData) {
        this.config = config;

        this.configId = config.id;
        this.num.string = config.purConCoinNum.toString();
        this.stbName.string = config.stbName;

        const stbType = StringUtil.combineNumbers(config.stbKinds, config.stbGrade, 2);
        this.STBConfig.init(stbType);
        if (this.STBConfig.puricon) {
            oops.res.loadAsync(this.STBConfig.puricon + '/spriteFrame', SpriteFrame).then((spriteFrame) => {
                if (spriteFrame)
                    this.icon.spriteFrame = spriteFrame;
            });
        }
        this.level.string = config.stbGrade.toString();
    }

    onBuySTB() {
        const letNum = Math.floor(smc.account.AccountModel.CoinData.gemsCoin) - Math.floor(this.config.purConCoinNum);
        console.log(`剩余宝石数量:${smc.account.AccountModel.CoinData.gemsCoin},所需宝石:${this.config.purConCoinNum}`);
        if (letNum < 0) {
            oops.gui.toast("tips_gem_noenough", true);
            oops.gui.open(UIID.GemShop);
            oops.gui.remove(UIID.STBShop, false);
            return;
        }
        
        this.btn_buy.interactable = false;
        smc.account.adopStartBeastNet(this.configId, false, (success: boolean, msg: string) => {
            if (success) {
                oops.gui.toast('adopt_tips_success', true);
            }
            this.btn_buy.interactable = true;
            this.num.string = this.config.purConCoinNum.toString();
        });
    }
}