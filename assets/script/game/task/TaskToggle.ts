import { Label } from 'cc';
import { Toggle } from 'cc';
import { _decorator, Component, Node } from 'cc';
import { oops } from '../../../../extensions/oops-plugin-framework/assets/core/Oops';
import { TaskEvent, TaskType } from './TaskDefine';
import { Enum } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('TaskToggle')
export class TaskToggle extends Component {
    @property({ type: Enum(TaskType) })
    taskType: TaskType = TaskType.daily;

    private toggle: Toggle = null!;
    private UnCheckLabel: Label = null!;


    start() {
        this.toggle = this.node.getComponent(Toggle)!;
        this.UnCheckLabel = this.node.getChildByName("UnCheckLabel")?.getComponent(Label)!;
        this.toggle?.node.on(Toggle.EventType.TOGGLE, this.onToggle, this);
       
        if(this.toggle.isChecked)
            this.UnCheckLabel.node.active = false;
    }

    onToggle(toggle: Toggle) {
        if (toggle.isChecked) {
            oops.message.dispatchEvent(TaskEvent.TaskUpdate, this.taskType);
            this.UnCheckLabel.node.active = false;
        } else {
            this.UnCheckLabel.node.active = true;
        }
    }
}


