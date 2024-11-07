import { _decorator, Component, Label, Sprite,SpriteFrame } from 'cc';
import { RewardConfig, RewardType } from './HatchDefine';
import { TableItemConfig } from '../common/table/TableItemConfig';
import { oops } from '../../../../extensions/oops-plugin-framework/assets/core/Oops';
import { StringUtil } from '../common/utils/StringUtil';
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

    async initItem(rewardConfig: RewardConfig) {
        let itemId = StringUtil.combineNumbers(rewardConfig.rewardType, rewardConfig.rewardGoodsID, 2);
        this.itemConfig.init(itemId);
        this.goodName.string = rewardConfig.goodName;
        if (rewardConfig.rewardNum > 1)
            this.goodName.string = rewardConfig.rewardNum.toString();

        // 加载图标
        oops.res.loadAsync(this.itemConfig.icon + '/spriteFrame', SpriteFrame).then((spriteFrame) => {
            this.icon.spriteFrame = spriteFrame;
        });

        // 显示星兽碎片等级
        if (rewardConfig.rewardType == RewardType.StarBeastFragment) {
            const parent = this.levelName.node.getParent();
            if (parent) {
                parent.active = true;
            }
            this.levelName.string = rewardConfig.standbyID == 1 ? "Novice" : "Middle";
        }
    }
}