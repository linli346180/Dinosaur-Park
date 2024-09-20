import { _decorator, Component, Node, Button, Prefab, instantiate } from 'cc';
import { oops } from '../../../../extensions/oops-plugin-framework/assets/core/Oops';
import { UIID } from '../common/config/GameUIConfig';
import { HatchNetService } from './HatchNet';
import { RewardConfig, RewardLevel } from './HatchDefine';
import { RewardGroup } from './RewardGroup';

const { ccclass, property } = _decorator;

/** 奖励预览表 */
@ccclass('RewardPrview')
export class RewardPrview extends Component {
    @property(Prefab)
    rewardItem: Prefab = null!;
    @property(Button)
    btn_close: Button = null!;
    @property(Button)
    btn_reward: Button = null!;
    @property(Node)
    rewardContent: Node = null!;

    onLoad() {
        this.rewardContent.removeAllChildren();
    }

    start() {
        this.btn_close?.node.on(Button.EventType.CLICK, this.closeUI, this);
        this.btn_reward?.node.on(Button.EventType.CLICK, this.closeUI, this);
        this.initUI();
    }

    async initUI() {
        this.rewardContent.removeAllChildren();
        const rewardList = await HatchNetService.getHatchReward();
        this.addRewardItems(rewardList, RewardLevel.Normal);
        this.addRewardItems(rewardList, RewardLevel.Intermediate);
        this.addRewardItems(rewardList, RewardLevel.Advanced);
        this.addRewardItems(rewardList, RewardLevel.Rare);
    }

    closeUI() {
        oops.gui.remove(UIID.RewardView, false);
    }

    addRewardItems(rewardList: RewardConfig[], level: RewardLevel) {
        const filteredRewards = rewardList.filter(reward => reward.level === level);
        if (filteredRewards.length === 0)
            return;
        const itemNode = instantiate(this.rewardItem);
        if(itemNode)
        {
            itemNode.setParent(this.rewardContent);
            const rewardItemComp = itemNode.getComponent(RewardGroup);
            if (rewardItemComp) {
                rewardItemComp.initItem(level, filteredRewards);
            }
        }
    }
}