import { Label } from 'cc';
import { Sprite } from 'cc';
import { _decorator, Component, Node } from 'cc';
import { RewardConfig, RewardType } from './HatchDefine';
import { TableItemConfig } from '../common/table/TableItemConfig';
import { error } from 'console';
import { oops } from '../../../../extensions/oops-plugin-framework/assets/core/Oops';
import { SpriteFrame } from 'cc';
import { sp } from 'cc';
import { moneyUtil } from '../common/utils/moneyUtil';
const { ccclass, property } = _decorator;

@ccclass('RewardItem')
export class RewardItem extends Component {
    @property(Sprite)
    icon: Sprite = null!;

    @property(Label)
    goodName: Label = null!;
    @property(Label)
    levelName: Label = null!;

    private itemConfig: TableItemConfig = new TableItemConfig();

    protected start(): void {

    }

    async initItem(rewardConfig: RewardConfig) {
        if (rewardConfig) {

            let itemId = moneyUtil.combineNumbers(rewardConfig.rewardType, rewardConfig.rewardGoodsID, 2);
            this.itemConfig.init(itemId);
            if (this.itemConfig) {
                this.goodName.string = rewardConfig.goodName;
                if (rewardConfig.rewardNum > 1)
                    this.goodName.string = rewardConfig.rewardNum.toString();

                oops.res.loadAsync(this.itemConfig.icon + '/spriteFrame', SpriteFrame).then((spriteFrame) => {
                    if (spriteFrame)
                        this.icon.spriteFrame = spriteFrame;
                });

                if (rewardConfig.rewardType == RewardType.StarBeastFragment) {
                    const parent = this.levelName.node.getParent();
                    if (parent) {
                        parent.active = true;
                    }
                    this.levelName.string = rewardConfig.standbyID == 1 ? "Novice" : "Middle";
                }
            }
        }
    }

   
}


