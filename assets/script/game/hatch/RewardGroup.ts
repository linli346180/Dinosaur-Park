import { _decorator, Component, Node, Label, Prefab, instantiate } from 'cc';
import { RewardConfig, RewardLevel } from './HatchDefine';
import { RewardItem } from './RewardItem';
const { ccclass, property } = _decorator;

/** 奖励组 */
@ccclass('RewardGroup')
export class RewardGroup extends Component {
    @property(Prefab)
    itemPrefab: Prefab = null!;
    @property(Node)
    groupTitle: Node = null!;
    @property(Node)
    container: Node = null!;
    @property(Node)
    title: Label = null!;

    protected onLoad(): void {
        this.container.removeAllChildren();
    }

    start() {

    }

    initItem(level: RewardLevel, rewardList: RewardConfig[]) {
        this.container.removeAllChildren();
        rewardList.forEach(reward => {
            this.createItem(reward);
        });

        // TODO 多语言
        if(level == RewardLevel.Normal)
            this.title.string = "Ordinary reward";
        if(level == RewardLevel.Intermediate)
            this.title.string = "Intermediate reward";
        if(level == RewardLevel.Advanced)
            this.title.string = "Premium reward";
        if(level == RewardLevel.Rare)
            this.title.string = "Rarity bonus";
    }

    createItem(reward: RewardConfig) {
        const itemNode = instantiate(this.itemPrefab);
        itemNode.parent = this.container;
        itemNode.getComponent<RewardItem>(RewardItem)?.initItem(reward);
    }
}


