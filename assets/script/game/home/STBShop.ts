import { Button } from 'cc';
import { _decorator, Component, Node } from 'cc';
import { oops } from '../../../../extensions/oops-plugin-framework/assets/core/Oops';
import { UIID } from '../common/config/GameUIConfig';
const { ccclass, property } = _decorator;

/** 星兽商店:
 * 使用砖石购买星兽
 */
@ccclass('STBShop')
export class STBShop extends Component {
    @property(Button)
    btn_clsoe: Button = null!;

    start() {
        this.btn_clsoe.node.on(Button.EventType.CLICK, this.CloseUI, this);
    }
    CloseUI() {
        oops.gui.remove(UIID.STBShop, false);
    }
}


