import { _decorator, Component, Node, Button, Prefab, instantiate, ToggleContainer } from 'cc';
import { oops } from '../../../../extensions/oops-plugin-framework/assets/core/Oops';
import { UIID } from '../common/config/GameUIConfig';
import { TaskItem } from './TaskItem';
import { TaskNetService } from './TaskNet';
import { TaskData, TaskEvent, TaskDataList, TaskType } from './TaskDefine';
import { TaskToggle } from './TaskToggle';
const { ccclass, property } = _decorator;

/** 任务 */
@ccclass('TaskView')
export class TaskView extends Component {
    @property(Node)
    content: Node = null!;
    @property(Prefab)
    itemPrefab: Node = null!;
    @property(Node)
    toggleContainer: Node = null!;
    @property(Button)
    btn_close: Button = null!;
    @property(Button)
    btn_left: Button = null!;
    @property(Button)
    btn_right: Button = null!;
    @property(Node)
    emptyNode: Node = null!;

    private curGroupIndex = 1;
    private taskGroup: { [key: number]: TaskType[] } = {
        1: [TaskType.daily, TaskType.basic, TaskType.achievement],
        2: [TaskType.guide, TaskType.timed]
    }
    private curTaskType: TaskType = TaskType.daily;
    private taskList: TaskDataList = new TaskDataList();

    onEnable(): void {
        this.initUI(this.curTaskType);
    }

    start() {
        this.btn_close?.node.on(Button.EventType.CLICK, () => { oops.gui.remove(UIID.Task, false) }, this);
        this.btn_left.node.on(Button.EventType.CLICK, () => { this.changeTaskGroup(-1) }, this);
        this.btn_right.node.on(Button.EventType.CLICK, () => { this.changeTaskGroup(1) }, this);
        oops.message.on(TaskEvent.TaskClaimed, this.onHandler, this);
        oops.message.on(TaskEvent.TaskUpdate, this.onHandler, this);
    }

    onDestroy() {
        oops.message.off(TaskEvent.TaskClaimed, this.onHandler, this);
        oops.message.off(TaskEvent.TaskUpdate, this.onHandler, this);
    }

    private onHandler(event: string, args: any) {
        switch (event) {
            case TaskEvent.TaskUpdate:
                this.curTaskType = args;
                this.initUI(this.curTaskType);
                break;
            case TaskEvent.TaskClaimed:
                break;
        }
    }

    private async initUI(taskType: TaskType) {
        this.content.removeAllChildren();
        let taskCount = 0;
        const res = await TaskNetService.getTaskData(this.curTaskType);
        if (res && res.taskList != null) {
            this.taskList.fillData(this.curTaskType, res.taskList);
            for (let i = 0; i < res.taskList.length; i++) {
                let taskData = res.taskList[i];
                this.crteateTaskItem(taskData);
                taskCount++;
            }
        }
        this.emptyNode.active = taskCount == 0;
        // this.updateTaskVisibility(this.taskGroup[this.curGroupIndex]);
    }

    crteateTaskItem(taskData: TaskData) {
        let item = instantiate(this.itemPrefab);
        if (item) {
            item.parent = this.content;
            item.getComponent(TaskItem)?.initItem(taskData);
        }
    }

    private changeTaskGroup(direction: number) {
        const taskGroupKeys = Object.keys(this.taskGroup).map(Number);
        const currentIndex = taskGroupKeys.indexOf(this.curGroupIndex);
        const nextIndex = (currentIndex + direction + taskGroupKeys.length) % taskGroupKeys.length;
        this.curGroupIndex = taskGroupKeys[nextIndex];
        // this.updateTaskVisibility(this.taskGroup[this.curGroupIndex]);
    }

    // private updateTaskVisibility(taskGroup: TaskType[]) {
    //     for (const itemNode of this.toggleContainer.children) {
    //         let taskType: TaskType = itemNode.getComponent(TaskToggle).taskType;
    //         itemNode.active = taskGroup.includes(taskType);
    //     }
    // }

}