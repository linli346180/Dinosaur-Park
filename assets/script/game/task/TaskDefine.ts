
export class TaskList {
    dailyTask: TaskData[] = [];
    basicTask: TaskData[] = [];
    achievementTask: TaskData[] = [];
    guideTask: TaskData[] = [];
    timedTask: TaskData[] = [];

    constructor() {
        this.dailyTask = [];
        this.basicTask = [];
        this.achievementTask = [];
        this.guideTask = [];
        this.timedTask = [];
    }

    fillData(taskType:TaskType, data: TaskData[]) { 
        switch (taskType) {
            case TaskType.daily:
                this.dailyTask = data;
                break;
            case TaskType.basic:
                this.basicTask = data;
                break;
            case TaskType.achievement:
                this.achievementTask = data;
                break;
            case TaskType.guide:
                this.guideTask = data;
                break;
            case TaskType.timed:
                this.timedTask = data;
                break;
        }
    }
}

export interface TaskData {
    taskId: number;                          // 任务表id
    taskCompileConditionId: number;          // 任务条件表id
    taskProgressId: number;                  // 任务进度表id
    taskLevel: number;                       // 任务等级
    taskName: string;                        // 任务名称
    taskState: TaskStatus;                   // 任务状态：0-未知 1-未完成 2-可领取 3-已领取
    rewards: Reward[];                       // 任务奖励列表
}

export interface Reward {
    awardType: number;           // 奖品类型：0-未知 1-非物资 2-货币 3-星兽 4-星兽碎片
    awardResourceId: number;     // 奖品资源表id
    awardResourceName: string;   // 奖品资源名称
    awardQuantity: number;       // 奖品数量
}

export enum TaskStatus {
    Unknown = 0,
    Incomplete = 1,
    Available = 2,
    Claimed = 3
}

// 任务类型:0-未知 1-日常任务 2-基础任务 3-成就任务 4-新手任务 5-限时任务
export enum TaskType {
    unknown = 0,
    daily = 1,
    basic = 2,
    achievement = 3,
    guide = 4,
    timed = 5
}

export enum TaskEvent {
    TaskClaimed = 'TaskClaimed',
    TaskUpdate = 'TaskUpdate',
}
