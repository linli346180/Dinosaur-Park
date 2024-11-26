import { _decorator, Component, Label, Sprite, SpriteFrame } from 'cc';
import { RewardConfig, RewardType } from './HatchDefine';
import { TableItemConfig } from '../common/table/TableItemConfig';
import { oops } from '../../../../extensions/oops-plugin-framework/assets/core/Oops';
import { StringUtil } from '../common/utils/StringUtil';
const { ccclass, property } = _decorator;

@ccclass('RewardItem')
export class RewardItem extends Component {
    @property(Sprite)
    private icon: Sprite = null!;
    @property(Label)
    private goodName: Label = null!;
    
    private itemConfig: TableItemConfig = new TableItemConfig();
    private rewardConfig: RewardConfig = null;

    async initItem(rewardConfig: RewardConfig) {
        this.rewardConfig = rewardConfig;
        let itemId = StringUtil.combineNumbers(rewardConfig.rewardType, rewardConfig.rewardGoodsID, 2);
        this.itemConfig.init(itemId);

        // 加载图标
        if (this.itemConfig.icon) {
            oops.res.loadAsync(this.itemConfig.icon + '/spriteFrame', SpriteFrame).then((spriteFrame) => {
                this.icon.spriteFrame = spriteFrame;
            });
        }
        // 显示名称
        this.updateName();
    }

    onEnable() {
        this.updateName();
    }

    private updateName() {
        if (this.rewardConfig) {
            if (this.rewardConfig.rewardNum > 1)
                this.goodName.string = this.rewardConfig.rewardNum.toString();
            else {
                const name: string[] = this.itemConfig.name.split("|");
                this.goodName.string = `${oops.language.getLangByID(name[0])}`;
                if (name.length > 1) {
                    this.goodName.string = `${oops.language.getLangByID(name[0])} ${name[1]}`;
                }
            }
        }
    }
}