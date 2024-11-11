import { Label } from 'cc';
import { Sprite } from 'cc';
import { _decorator, Component, Node } from 'cc';
import { Reward } from './GuideDefine';
import { TableItemConfig } from '../common/table/TableItemConfig';
import { StringUtil } from '../common/utils/StringUtil';
import { oops } from '../../../../extensions/oops-plugin-framework/assets/core/Oops';
import { SpriteFrame } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('GuideRewardItem')
export class GuideRewardItem extends Component {
    @property(Sprite)
    icon: Sprite = null!;
    @property(Label)
    num: Label = null!;

    public initItem(rewardConfig: Reward) {
        this.num.string = `x${StringUtil.formatMoney(rewardConfig.awardQuantity)}`;
        let itemConfig = new TableItemConfig();
        let itemId = StringUtil.combineNumbers(rewardConfig.awardType, rewardConfig.awardResourceId, 2);
        itemConfig.init(itemId);
        if (itemConfig.icon != null && itemConfig.icon != undefined && itemConfig.icon != '') {
            oops.res.loadAsync(itemConfig.icon + '/spriteFrame', SpriteFrame).then((spriteFrame) => {
                if (spriteFrame)
                    this.icon.spriteFrame = spriteFrame;
            })
        }
    }
}