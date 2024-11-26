import { Button } from 'cc';
import { _decorator, Component, Node, Animation } from 'cc';
import { oops } from '../../../../extensions/oops-plugin-framework/assets/core/Oops';
import { UIID } from '../common/config/GameUIConfig';
import { Label } from 'cc';
import { SpriteFrame } from 'cc';
import { smc } from '../common/SingletonModuleComp';
import { Sprite } from 'cc';
import { RichText } from 'cc';
import { TableSTBConfig } from '../common/table/TableSTBConfig';
import { ReportNetService } from './ReportNet';
const { ccclass, property } = _decorator;

@ccclass('STBDetail')
export class STBDetail extends Component {
    @property(Button)
    private btn_close: Button = null!;
    @property(Sprite)
    private configIcon: Sprite = null!;
    @property(Label)
    private configName: Label = null!;
    @property(RichText)
    private configDesc: RichText = null!;

    private STBConfig: TableSTBConfig = new TableSTBConfig();

    public async InitUI(stbType: number) {
        this.STBConfig.init(stbType);
        if (this.STBConfig.bigicon) {
            oops.res.loadAsync(this.STBConfig.bigicon + '/spriteFrame', SpriteFrame).then((spriteFrame) => {
                if (spriteFrame)
                    this.configIcon.spriteFrame = spriteFrame;
            });
        }
        // this.configName.string = oops.language.getLangByID(this.STBConfig.name);
        let stbConfig = smc.account.getSTBConfigByType(stbType);
        if (stbConfig) {
            const res = await ReportNetService.getStartBeastDesc(stbConfig.id);
            if (res && res.stbDesc) {
                this.configName.string = res.stbDesc.stbName
                this.configDesc.string = res.stbDesc.stbDesc;
            }
        }
    }

    onLoad() {
        this.btn_close?.node.on(Button.EventType.CLICK, this.onClose, this);
    }

    onClose() {
        oops.gui.remove(UIID.STBDetail);
    }
}