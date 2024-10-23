import { _decorator, Vec3, v3 } from 'cc';
import { bt } from './BehaviourTree';
import { BlackboardKey } from './BlackboardKey';
import { Actor } from '../state/Actor';
import { StateDefine } from '../state/StateDefine';
import { ActorController } from '../state/ActorController';
import { ExecuteResult, markFail, markRunning, markSuccess } from './ExecuteResult';

/** 移动到指定的位置 */
export class MoveToDest extends bt.Action {
    execute(dt: number, result: ExecuteResult) {
        let actor = result.blackboard.get(BlackboardKey.Actor) as Actor;
        let moveDest = result.blackboard.get(BlackboardKey.MoveDest) as Vec3;
        if (!actor || !moveDest) {
            markFail(result);
            return;
        }

        let isDrag = result.blackboard.get(BlackboardKey.Drag) as boolean;
        let dur = result.blackboard.get(BlackboardKey.MoveDestDuration) - dt;
        result.blackboard.set(BlackboardKey.MoveDestDuration, dur);

        let dir = v3();
        Vec3.subtract(dir, moveDest, actor.node.position);
        let distance = dir.length();
        dir.normalize();

        // 添加距离阈值检查
        const distanceThreshold = 5.0; // 你可以根据需要调整这个阈值
        let movedDistance = dir.length();
        if (isDrag || distance < distanceThreshold || dur < 0) {
            markSuccess(result);
            result.blackboard.delete(BlackboardKey.MoveDest);
            actor.stateMgr.transit(StateDefine.Idle);
            return;
        }
        actor.input.set(dir.x, dir.y)
        markRunning(result);
        actor.stateMgr.transit(StateDefine.Run);
    }
}

/** 设置移动坐标 */
export class SetMoveDest extends bt.Action {
    execute(dt: number, result: ExecuteResult) {
        markSuccess(result);
        let actor = result.blackboard.get(BlackboardKey.Actor) as Actor;
        let ec = actor.node.getComponent(ActorController);
        if (ec)
            ec.randomNextMoveDest();
    }
}


/** 停留在idle动画 */
export class StayIdle extends bt.Action {
    execute(dt: number, result: ExecuteResult) {
        markSuccess(result);
        let actor: Actor = result.blackboard.get(BlackboardKey.Actor);
        actor.stateMgr.transit(StateDefine.Idle);
    }
}

/** 等待一定时间 */
export class WaitAction extends bt.Action {
    elapsed: number = 0;
    interval: number = 1;
    start: boolean = false;

    execute(dt: number, result: ExecuteResult) {
        markFail(result);

        if (!this.start) {
            this.start = true;
            this.elapsed = 0;
        }

        this.elapsed += dt;
        if (this.elapsed < this.interval) {
            markRunning(result);
            return;
        }

        this.elapsed = 0;
        this.start = false;
        markSuccess(result);
    }
}