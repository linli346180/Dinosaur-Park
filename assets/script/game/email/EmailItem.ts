import { Button } from 'cc';
import { _decorator, Component, Node } from 'cc';
import { oops } from '../../../../extensions/oops-plugin-framework/assets/core/Oops';
import { UIID } from '../common/config/GameUIConfig';
const { ccclass, property } = _decorator;

@ccclass('EmailItem')
export class EmailItem extends Component {
    @property(Node)
    bg_claimed: Node = null!;
    @property(Node)
    bg_unclaimed: Node = null!;

    private btn_unclaimed: Button = null!;
    private btn_claimed: Button = null!;

    start() {
        this.btn_unclaimed = this.node.getChildByName("btn_unclaimed")?.getComponent(Button)!;
        this.btn_claimed = this.node.getChildByName("btn_claimed")?.getComponent(Button)!;
        this.btn_unclaimed?.node.on(Button.EventType.CLICK, this.onClaimed, this);
        this.btn_claimed?.node.on(Button.EventType.CLICK, this.onClaimed, this);
    }

    update(deltaTime: number) {

    }

    onClaimed () {
        console.log("查看邮件")
        oops.gui.open(UIID.EmailDetail);
    }
}


