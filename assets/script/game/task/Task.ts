import { _decorator, Component, Node, Button, Prefab, instantiate, ToggleContainer } from 'cc';
import { oops } from '../../../../extensions/oops-plugin-framework/assets/core/Oops';
import { UIID } from '../common/config/GameUIConfig';
import { TaskItem } from './TaskItem';
import { TaskNetService } from './TaskNet';
import { TaskData, TaskEvent, TaskList, TaskType } from './TaskDefine';
const { ccclass, property } = _decorator;

@ccclass('TaskView')
export class TaskView extends Component {
    @property(Node)
    content: Node = null!;
    @property(Prefab)
    itemPrefab: Node = null!;
    @property(ToggleContainer)
    toggleContainer: ToggleContainer = null!;
    @property(Button)
    btn_close: Button = null!;
    @property(Button)
    btn_left: Button = null!;
    @property(Button)
    btn_right: Button = null!;

    private index: TaskType = TaskType.daily;
    private taskList: TaskList = new TaskList();
    private TaskItems: TaskItem[] = [];

    start() {
        this.btn_close?.node.on(Button.EventType.CLICK, this.closeUI, this);
        oops.message.on(TaskEvent.TaskClaimed, this.onHandler, this);
        oops.message.on(TaskEvent.TaskUpdate, this.onHandler, this);
        this.initUI(this.index);
    }

    onDestroy() {
        oops.message.off(TaskEvent.TaskClaimed, this.onHandler, this);
        oops.message.off(TaskEvent.TaskUpdate, this.onHandler, this);
    }

    private closeUI() {
        oops.gui.remove(UIID.Task, false);
    }

    private onHandler(event: string, args: any) {
        switch (event) {
            case TaskEvent.TaskUpdate:
                this.index = args;
                this.initUI(this.index);
                break;
            case TaskEvent.TaskClaimed:
                break;
        }
    }

    private async initUI(taskType:TaskType) {
        this.TaskItems = [];
        this.content.removeAllChildren();
        const res = await TaskNetService.getTaskData(this.index);
        if (res && res.taskList != null) {
            this.taskList.fillData(this.index, res.taskList);

            for (let i = 0; i < res.taskList.length; i++) {
                let taskData = res.taskList[i];
                this.crteateTaskItem(taskData);
            }
        }
    }

    crteateTaskItem(taskData: TaskData) {
        let item = instantiate(this.itemPrefab);
        if (item) {
            item.parent = this.content;
            let taskItem = item.getComponent(TaskItem);
            if (taskItem) {
                taskItem.initItem(taskData);
                this.TaskItems.push(taskItem);
            }
        }
    }
}