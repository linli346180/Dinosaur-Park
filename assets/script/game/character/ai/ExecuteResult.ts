
 // 执行结果
 export enum ExecuteState {
    Fail = 'fail',
    Success = 'success',
    Running = 'running',
}

// AI 的黑板
export interface Blackboard {
    has(name: string): boolean;
    set(name: string, val: any): void;
    get(name: string): any;
    delete(name: string): void;
}

export function markFail(result: ExecuteResult) {
    result.executeState = ExecuteState.Fail;
}

export function markRunning(result: ExecuteResult) {
    result.executeState = ExecuteState.Running;
}

export function markSuccess(result: ExecuteResult) {
    result.executeState = ExecuteState.Success;
}

// 执行结果(状态+黑板)
export class ExecuteResult {
    executeState: ExecuteState = ExecuteState.Fail;
    blackboard: Blackboard = new Map();
}