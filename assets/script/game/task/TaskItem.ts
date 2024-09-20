import { _decorator, Component, Node } from 'cc';
import { TaskData, TaskEvent, TaskStatus } from './TaskDefine';
import { Button } from 'cc';
import { Label } from 'cc';
import { Sprite } from 'cc';
import { TaskNetService } from './TaskNet';
import { oops } from '../../../../extensions/oops-plugin-framework/assets/core/Oops';
import { SpriteFrame } from 'cc';
import { TableItemConfig } from '../common/table/TableItemConfig';
import { moneyUtil } from '../common/utils/moneyUtil';
import { UIID } from '../common/config/GameUIConfig';
const { ccclass, property } = _decorator;

@ccclass('TaskItem')
export class TaskItem extends Component {
    @property(Button)
    btn_incomplete: Button = null!;
    @property(Button)
    btn_available: Button = null!;
    @property(Button)
    btn_claimed: Button = null!;

    @property(Label)
    title: Label = null!;
    @property(Sprite)
    icon: Sprite = null!;
    @property(Label)
    num: Label = null!;

    get taskId(): number {
        return this.taskData.taskId;
    }

    private taskData: TaskData = null!;

    start() {
        this.btn_incomplete?.node.on(Button.EventType.CLICK, this.closeUI, this);
        this.btn_available?.node.on(Button.EventType.CLICK, this.onClaim, this);
    }

    initItem(taskData: TaskData) {
        this.taskData = taskData;
        this.title.string = taskData.taskName;

        this.btn_incomplete.node.active = this.taskData.taskState == TaskStatus.Incomplete;
        this.btn_available.node.active = this.taskData.taskState == TaskStatus.Available;
        this.btn_claimed.node.active = this.taskData.taskState == TaskStatus.Claimed;
        
        if (this.taskData.rewards.length > 0) {
            let rewardConfig = this.taskData.rewards[0];
            this.icon.spriteFrame = null!;
            this.num.string = this.taskData.rewards[0].awardQuantity.toString();

            let itemConfig = new TableItemConfig();
            let itemId = moneyUtil.combineNumbers(rewardConfig.awardType, rewardConfig.awardResourceId, 2);
            itemConfig.init(itemId);
            oops.res.loadAsync(itemConfig.icon + '/spriteFrame', SpriteFrame).then((spriteFrame) => {
                if (spriteFrame)
                    this.icon.spriteFrame = spriteFrame;
            });
        };
    }

    closeUI() {
        oops.gui.remove(UIID.Task);
    }

    onClaim() {
        TaskNetService.claimTaskReward(this.taskData.taskCompileConditionId, this.taskData.taskProgressId).then((res) => {
            if(res){
                oops.message.dispatchEvent(TaskEvent.TaskClaimed, this.taskData.taskId);
                this.taskData.taskState = TaskStatus.Claimed;
                this.initItem(this.taskData);
            }
        });
    }
}


