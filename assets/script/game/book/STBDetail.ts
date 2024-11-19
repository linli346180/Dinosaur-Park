import { Button } from 'cc';
import { _decorator, Component, Node,Animation } from 'cc';
import { oops } from '../../../../extensions/oops-plugin-framework/assets/core/Oops';
import { UIID } from '../common/config/GameUIConfig';
import { Label } from 'cc';
import { SpriteFrame } from 'cc';
import { smc } from '../common/SingletonModuleComp';
import { Sprite } from 'cc';
import { RichText } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('STBDetail')
export class STBDetail extends Component {
    @property(Button)
    private btn_close:Button = null!;
    @property(Sprite)
    private configIcon: Sprite = null!;
    @property(Label)
    private configName:Label = null!;
    @property(RichText)
    private configDesc: RichText = null!;

    public InitUI(stbType : number){    
        console.log("stbType", stbType);
        const configData = smc.account.getSTBConfigByType(stbType);
        if(configData) {
            this.configName.string = configData.stbName;
            this.configDesc.string = configData.desc;
        }
    }

    onLoad() {
        this.btn_close?.node.on(Button.EventType.CLICK, this.onClose, this);
    }

    onEnable() {
        this.getComponent(Animation)?.play('open');
    }

    onClose() {
        oops.gui.remove(UIID.STBDetail);
    }
}