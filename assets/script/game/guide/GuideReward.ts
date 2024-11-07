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
        this.btn_sure.node.on(Button.EventType.CLICK, () => { oops.gui.remove(UIID.GuideReward); });
    }

    public initUI(rewards: Reward[]) {
        this.itemContain.removeAllChildren();
        if (rewards == null || rewards.length == 0) {
            console.error('奖励数据为空');
            return;
        }
        console.error('奖励数据:', rewards);
        rewards.forEach((reward) => {
            this.createItem(reward);
        });
    }

    private createItem(reward: Reward) {
        let item = instantiate(this.itemPerfab);
        if (item) {
            this.itemContain.addChild(item);
            item.getComponent(GuideRewardItem)?.initItem(reward);
        }
    }
}