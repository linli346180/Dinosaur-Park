

export interface TaskData {
    taskId: number;              // 任务表id
    taskProgressId: number;      // 任务进度表id
    taskLevel: number;           // 任务等级
    taskName: string;            // 任务名称
    rewardName: string;          // 奖励名称
    rewardType: number;          // 奖励的物资类型: 0-未知 1-非物资 2-货币 3-星兽 4-星兽碎片
    rewardId: number;            // 奖励物资Id
    rewardQuantity: number;      // 奖励数量
    taskState: number;           // 任务状态：0-未知 1-未完成 2-可领取 3-已领取
}
 
export enum TaskState {
    unknown = 0,
    unfinished = 1,
    canGet = 2,
    got = 3
}

// 任务类型:0-未知 1-日常任务 2-基础任务 3-成就任务 4-新手任务 5-限时任务
export enum TaskType {
    unknown = 0,
    daily = 1,
    basic = 2,
    achievement = 3,
    newbie = 4,
    timeLimited = 5
}