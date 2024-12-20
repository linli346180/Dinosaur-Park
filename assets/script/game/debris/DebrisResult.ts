import { Button } from 'cc';
import { _decorator, Component, Node } from 'cc';
import { oops } from '../../../../extensions/oops-plugin-framework/assets/core/Oops';
import { UIID } from '../common/config/GameUIConfig';
import { Label } from 'cc';
import { Sprite } from 'cc';
import { TableSTBConfig } from '../common/table/TableSTBConfig';
import { SpriteFrame } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('DebrisResult')
export class DebrisResult extends Component {
    @property(Button)
    private btn_close: Button = null!;
    @property(Button)
    private btn_ok: Button = null!;
    @property(Label)
    private title: Label = null!;
    @property(Sprite)
    private icon: Sprite = null!;
    @property(Label)
    private desc: Label = null!;

    start() {
        this.btn_close?.node.on(Button.EventType.CLICK, this.closeUI, this);
        this.btn_ok?.node.on(Button.EventType.CLICK, this.closeUI, this);
    }

    initUI(stbId: number, count: number) {
        console.log("initUI", stbId, count);
        let STBConfig: TableSTBConfig = new TableSTBConfig();
        STBConfig.init(stbId);
        oops.res.loadAsync(STBConfig.icon + '/spriteFrame', SpriteFrame).then((spriteFrame) => {
            this.icon.spriteFrame = spriteFrame;
        });
        this.desc.string = STBConfig.name + "*" + count;
    }

    closeUI() {
        oops.gui.remove(UIID.DebrisResult);
    }
}


