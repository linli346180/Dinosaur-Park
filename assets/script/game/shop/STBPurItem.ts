import { _decorator, Component, Node, Button, Label, Sprite } from 'cc';
import { UserInstbConfigData } from '../account/model/STBConfigModeComp';
import { TableSTBConfig } from '../common/table/TableSTBConfig';
import { oops } from '../../../../extensions/oops-plugin-framework/assets/core/Oops';
import { SpriteFrame } from 'cc';
import { moneyUtil } from '../common/utils/moneyUtil';
import { smc } from '../common/SingletonModuleComp';
const { ccclass, property } = _decorator;

@ccclass('STBPurItem')
export class STBPurItem extends Component {
    @property(Sprite)
    icon: Sprite = null!;
    @property(Button)
    btn_buy: Button = null!;
    @property(Label)
    num: Label = null!;
    @property(Label)
    stbName: Label = null!;

    private configId: number = 0;
    private STBConfig: TableSTBConfig = new TableSTBConfig();

    start() {
        this.btn_buy.node.on(Button.EventType.CLICK, this.onBuy, this);
    }

    initItem(config: UserInstbConfigData) {
        this.configId = config.id;
        this.num.string = config.purConCoinNum.toString();
        this.stbName.string = config.stbName;

        const stbType = moneyUtil.combineNumbers(config.stbKinds, config.stbGrade, 2);
        this.STBConfig.init(stbType);
        if (this.STBConfig.puricon != undefined && this.STBConfig.puricon != '') {
            oops.res.loadAsync(this.STBConfig.puricon + '/spriteFrame', SpriteFrame).then((spriteFrame) => {
                if (spriteFrame)
                    this.icon.spriteFrame = spriteFrame;
            });
        }
    }

    onBuy() {
        smc.account.adopStartBeastNet(this.configId, false, (success: boolean, msg: string) => {
            if (success) {
                oops.gui.toast('领养星兽成功');
            } else {
                oops.gui.toast(msg);
            }
        });
    }
}