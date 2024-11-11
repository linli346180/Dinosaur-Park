import { _decorator, Component, Button, Label, Sprite, SpriteFrame } from 'cc';
import { oops } from '../../../../extensions/oops-plugin-framework/assets/core/Oops';
import { TaskNetService } from './TaskNet';
import { TaskData, TaskEvent, TaskStatus } from './TaskDefine';
import { TableItemConfig } from '../common/table/TableItemConfig';
import { StringUtil } from '../common/utils/StringUtil';
import { UIID } from '../common/config/GameUIConfig';
import { smc } from '../common/SingletonModuleComp';
const { ccclass, property } = _decorator;

@ccclass('TaskItem')
export class TaskItem extends Component {
    @property(Button)
    btn_incomplete: Button = null!;
    @property(Button)
    btn_available: Button = null!;
    @property(Button)
    btn_claimed: Button = null!;

    @property(Sprite)
    rewardIcon: Sprite = null!;
    @property(Label)
    title: Label = null!;
    @property(Label)
    rewardNum: Label = null!;

    @property(Label)
    completed: Label = null!;

    taskData: TaskData = null!;

    start() {
        this.btn_incomplete?.node.on(Button.EventType.CLICK, this.closeUI, this);
        this.btn_available?.node.on(Button.EventType.CLICK, this.onClaim, this);
    }

    initItem(taskData: TaskData) {
        this.taskData = taskData;
        this.title.string = taskData.taskName;
        this.completed.string = `(${taskData.completedQuantity}/${taskData.requiredQuantity})`;   // 任务进度

        this.btn_incomplete.node.active = this.taskData.taskState == TaskStatus.Incomplete;
        this.btn_available.node.active = this.taskData.taskState == TaskStatus.Available;
        this.btn_claimed.node.active = this.taskData.taskState == TaskStatus.Claimed;

        if (this.taskData.rewards && this.taskData.rewards.length > 0) {
            let rewardConfig = this.taskData.rewards[0];
            this.rewardIcon.spriteFrame = null!;
            this.rewardNum.string = this.taskData.rewards[0].awardQuantity.toString();

            let itemConfig = new TableItemConfig();
            let itemId = StringUtil.combineNumbers(rewardConfig.awardType, rewardConfig.awardResourceId, 2);
            itemConfig.init(itemId);
            if (itemConfig.icon != undefined && itemConfig.icon != null && itemConfig.icon != '') {
                oops.res.loadAsync(itemConfig.icon + '/spriteFrame', SpriteFrame).then((spriteFrame) => {
                    if (spriteFrame)
                        this.rewardIcon.spriteFrame = spriteFrame;
                });
            }
        } else {
            console.error('任务奖励为空');
            this.rewardIcon.spriteFrame = null!;
            this.rewardNum.string = '';
        }
    }

    closeUI() {
        oops.gui.remove(UIID.Task, false);
    }

    onClaim() {
        this.btn_available.interactable = false;
        TaskNetService.claimTaskReward(this.taskData.taskCompileConditionId, this.taskData.taskProgressId).then((res) => {
            this.btn_available.interactable = true;
            if (res) {
                oops.message.dispatchEvent(TaskEvent.TaskClaimed, this.taskData.taskId);
                this.taskData.taskState = TaskStatus.Claimed;
                this.initItem(this.taskData);

                let rewardType: number[] = [];
                if (this.taskData.rewards.length > 0) {
                    for(const reward of this.taskData.rewards){
                        if(!rewardType.includes(reward.awardType))
                            rewardType.push(reward.awardType);
                    }
                }
                for(const type of rewardType){
                    smc.account.OnClaimAward(type);
                }
            }
        });
    }
}