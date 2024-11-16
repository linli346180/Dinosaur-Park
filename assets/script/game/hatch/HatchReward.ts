import { Button } from 'cc';
import { Prefab } from 'cc';
import { _decorator, Component, Node } from 'cc';
import { RewardConfig } from './HatchDefine';
import { instantiate } from 'cc';
import { RewardItem } from './RewardItem';
import { oops } from '../../../../extensions/oops-plugin-framework/assets/core/Oops';
import { UIID } from '../common/config/GameUIConfig';
import { smc } from '../common/SingletonModuleComp';
const { ccclass, property } = _decorator;

@ccclass('HatchReward')
export class HatchReward extends Component {
    @property(Prefab)
    itemPrefab: Prefab = null!;
    @property(Button)
    btn_reward: Button = null!;
    @property(Node)
    container: Node = null!;

    private rewardData: RewardConfig[] = [];

    start() {
        this.btn_reward?.node.on(Button.EventType.CLICK, this.closeUI, this);
    }

    closeUI() {
        console.log("领取奖励");
        oops.gui.remove(UIID.HatchReward, false);
        let rewardType: number[] = [];
        if (this.rewardData.length > 0) {
            for(const reward of this.rewardData){
                if(!rewardType.includes(reward.rewardType))
                    rewardType.push(reward.rewardType);
            }
        }
        for(const type of rewardType){
            smc.account.OnClaimAward(type);
        }
    }

    InitUI(rewardList: RewardConfig[]) {
        this.rewardData = rewardList;
        this.container.removeAllChildren();
        rewardList.forEach(reward => {
            const itemNode = instantiate(this.itemPrefab);
            itemNode.parent = this.container;
            itemNode.getComponent<RewardItem>(RewardItem)?.initItem(reward);
        });
    }
}