import { _decorator, Component, Node, Button } from 'cc';
import { oops } from '../../../../extensions/oops-plugin-framework/assets/core/Oops';
import { UIID } from '../common/config/GameUIConfig';
const { ccclass, property } = _decorator;

@ccclass('Invite')
export class Invite extends Component {

    @property(Button)
    btn_clsoe: Button = null!;

    start() {
        this.btn_clsoe.node.on(Button.EventType.CLICK, this.CloseUI, this);
    }

    CloseUI() {
        oops.gui.remove(UIID.Invite, true);
    }
}