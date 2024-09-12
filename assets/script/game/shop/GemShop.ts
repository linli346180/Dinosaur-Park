import { Button } from 'cc';
import { _decorator, Component, Node } from 'cc';
import { oops } from '../../../../extensions/oops-plugin-framework/assets/core/Oops';
import { UIID } from '../common/config/GameUIConfig';
const { ccclass, property } = _decorator;

/** 宝石商店 */
@ccclass('GemShop')
export class GemShop extends Component {
    private btn_close: Button = null!;

    start() {
        this.btn_close = this.node.getChildByName("btn_close")?.getComponent(Button)!;
        this.btn_close?.node.on(Button.EventType.CLICK, this.closeUI, this);
    }

    closeUI() {
        oops.gui.remove(UIID.GemShop, false);
    }
}


