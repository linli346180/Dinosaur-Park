import { Button } from 'cc';
import { Prefab } from 'cc';
import { _decorator, Component, Node } from 'cc';
import { oops } from '../../../../extensions/oops-plugin-framework/assets/core/Oops';
import { UIID } from '../common/config/GameUIConfig';
import { RewardConfig } from './HatchDefine';
import { instantiate } from 'cc';
import { RewardItem } from './RewardItem';
const { ccclass, property } = _decorator;

@ccclass('HatchReward')
export class HatchReward extends Component {
    @property(Prefab)
    itemPrefab: Prefab = null!;
    @property(Button)
    btn_close: Button = null!;
    @property(Button)
    btn_reward: Button = null!;
    @property(Node)
    container: Node = null!;

    start() {
        this.btn_close?.node.on(Button.EventType.CLICK, this.closeUI, this);
        this.btn_reward?.node.on(Button.EventType.CLICK, this.closeUI, this);
    }

    closeUI() {
        oops.gui.remove(UIID.HatchReward);
    }

    InitUI(rewardList: RewardConfig[]) {
        this.container.removeAllChildren();
        rewardList.forEach(reward => {
            this.createItem(reward);
        });
    }

    createItem(reward: RewardConfig) {
        const itemNode = instantiate(this.itemPrefab);
        itemNode.parent = this.container;
        itemNode.getComponent<RewardItem>(RewardItem)?.initItem(reward);
    }
}


