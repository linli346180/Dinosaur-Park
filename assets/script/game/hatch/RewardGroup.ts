import { _decorator, Component, Node, Label, Prefab, instantiate } from 'cc';
import { RewardConfig, RewardLevel } from './HatchDefine';
import { RewardItem } from './RewardItem';
import { oops } from '../../../../extensions/oops-plugin-framework/assets/core/Oops';
const { ccclass, property } = _decorator;

/** 奖励组 */
@ccclass('RewardGroup')
export class RewardGroup extends Component {
    @property(Prefab)
    itemPrefab: Prefab = null!;
    @property(Node)
    container: Node = null!;
    @property(Label)
    title: Label = null!;

    protected onLoad(): void {
        this.container.removeAllChildren();
    }

    initItem(level: RewardLevel, rewardList: RewardConfig[]) {
        this.container.removeAllChildren();
        rewardList.forEach(reward => {
            this.createItem(reward);
        });

        if (level == RewardLevel.Normal)
            this.title.string = oops.language.getLangByID('reward_tip_normal');
        if (level == RewardLevel.Intermediate)
            this.title.string = oops.language.getLangByID('reward_tip_intermediate');
        if (level == RewardLevel.Advanced)
            this.title.string = oops.language.getLangByID('reward_tip_advanced');
        if (level == RewardLevel.Rare)
            this.title.string = oops.language.getLangByID('reward_tip_rare');
    }

    createItem(reward: RewardConfig) {
        const itemNode = instantiate(this.itemPrefab);
        itemNode.parent = this.container;
        itemNode.getComponent<RewardItem>(RewardItem)?.initItem(reward);
    }
}