import { _decorator, Component, Node } from 'cc';
import { oops } from '../../../../extensions/oops-plugin-framework/assets/core/Oops';
import { UIID } from '../common/config/GameUIConfig';
const { ccclass, property } = _decorator;

@ccclass('EvolveResult')
export class EvolveResult extends Component {
    @property(Node) icon_301: Node = null!;
    @property(Node) icon_302: Node = null!;
    @property(Node) icon_303: Node = null!;
    @property(Node) btn_close: Node = null!;

    onLoad() {
        this.btn_close.on(Node.EventType.TOUCH_END, this.closeUI, this);
    }

    public InitUI(index: number) {
        this.icon_301.active = index == 301;
        this.icon_302.active = index == 302;
        this.icon_303.active = index == 303;
    }

    private closeUI() {
        oops.gui.remove(UIID.EvolveResult, false);
    }
}


