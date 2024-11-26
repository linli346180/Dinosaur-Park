import { _decorator, Component, Button, Label, Sprite, Node } from 'cc';
import { oops } from '../../../../extensions/oops-plugin-framework/assets/core/Oops';
import { UIID } from '../common/config/GameUIConfig';
import { TableSTBConfig } from '../common/table/TableSTBConfig';
import { tween } from 'cc';
import { v3 } from 'cc';
import { Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('DebrisResult')
export class DebrisResult extends Component {
    @property(Button)
    private btn_close: Button = null!;
    @property(Button)
    private btn_ok: Button = null!;
    @property(Label)
    private title: Label = null!;
    @property(Node)
    private icon_lv1: Node = null!;
    @property(Node)
    private icon_lv2: Node = null!;
    @property(Label)
    private desc: Label = null!;

    start() {
        this.btn_close?.node.on(Button.EventType.CLICK, this.closeUI, this);
        this.btn_ok?.node.on(Button.EventType.CLICK, this.closeUI, this);
    }

    initUI(stbId: number) {
        let STBConfig: TableSTBConfig = new TableSTBConfig();
        STBConfig.init(stbId);
        this.desc.string = `${oops.language.getLangByID(STBConfig.name)} x1`;

        this.icon_lv1.active = stbId == 301;
        this.icon_lv2.active = stbId == 302;
    }

    closeUI() {
        oops.gui.remove(UIID.DebrisResult)
    }
}