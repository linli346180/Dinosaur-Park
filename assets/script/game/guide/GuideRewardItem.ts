import { Label } from 'cc';
import { Sprite } from 'cc';
import { _decorator, Component, Node } from 'cc';
import { GuideRewardInfo } from './GuideDefine';
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

    public initItem(rewardConfig: GuideRewardInfo) {
        this.num.string = `x${StringUtil.formatMoney(rewardConfig.rewardNum)}`;
        let itemConfig = new TableItemConfig();
        let itemId = StringUtil.combineNumbers(rewardConfig.rewardType, rewardConfig.rewardGoodsID, 2);
        itemConfig.init(itemId);
        if (itemConfig.icon) {
            oops.res.loadAsync(itemConfig.icon + '/spriteFrame', SpriteFrame).then((spriteFrame) => {
                if (spriteFrame)
                    this.icon.spriteFrame = spriteFrame;
            })
        }
    }
}