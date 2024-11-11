import { Prefab } from 'cc';
import { Button } from 'cc';
import { _decorator, Component, Node } from 'cc';
import { instantiate } from 'cc';
import { Reward } from './GuideDefine';
import { GuideRewardItem } from './GuideRewardItem';
import { oops } from '../../../../extensions/oops-plugin-framework/assets/core/Oops';
import { UIID } from '../common/config/GameUIConfig';
const { ccclass, property } = _decorator;

@ccclass('GuideReward')
export class GuideReward extends Component {
    @property(Button)
    btn_sure: Button = null!;
    @property(Node)
    itemContain: Node = null!;
    @property(Prefab)
    itemPerfab: Prefab = null!;

    start() {
        this.btn_sure.node.on(Button.EventType.CLICK, () => { oops.gui.remove(UIID.GuideReward, true); });
    }

    public initUI(rewards: Reward[]) {
        this.itemContain.removeAllChildren();
        if (rewards == null || rewards.length == 0) { return; }
        rewards.forEach((reward) => {
            let itemNode = instantiate(this.itemPerfab);
            if (itemNode) {
                this.itemContain.addChild(itemNode);
                itemNode.getComponent(GuideRewardItem)?.initItem(reward);
            }
        });
    }
}