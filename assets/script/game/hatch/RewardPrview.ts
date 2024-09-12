import { _decorator, Component, Node, Button } from 'cc';
import { oops } from '../../../../extensions/oops-plugin-framework/assets/core/Oops';
import { UIID } from '../common/config/GameUIConfig';
const { ccclass, property } = _decorator;

@ccclass('RewardPrview')
export class RewardPrview extends Component {
    @property(Button)
    btn_close: Button = null!;
    @property(Button)
    btn_reward: Button = null!;
    @property(Node)
    rewardContent: Node = null!;

    start() {
        this.btn_close?.node.on(Button.EventType.CLICK, this.closeUI, this);
        this.btn_reward?.node.on(Button.EventType.CLICK, this.onReward, this);
    }

    closeUI() {
        oops.gui.remove(UIID.RewardView);
    }

    onReward() {
        oops.gui.remove(UIID.RewardView);
    }
}