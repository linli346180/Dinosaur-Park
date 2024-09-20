import { _decorator, Component, Node } from 'cc';
import { bt } from './BehaviourTree';
import { BlackboardKey } from './BlackboardKey';
import { Actor } from '../state/Actor';
import { Vec3 } from 'cc';
import { StateDefine } from '../state/StateDefine';
import { v3 } from 'cc';
import { ActorController } from '../state/ActorController';
const { ccclass, property } = _decorator;

export class MoveToDest extends bt.Action {
    execute(dt: number, result: bt.ExecuteResult) {
        let actor = result.blackboard.get(BlackboardKey.Actor) as Actor;
        let moveDest = result.blackboard.get(BlackboardKey.MoveDest) as Vec3;
        if (!actor || !moveDest) {
            bt.markFail(result);
            return;
        }

        let dur = result.blackboard.get(BlackboardKey.MoveDestDuration) - dt;
        result.blackboard.set(BlackboardKey.MoveDestDuration, dur);

        let dir = v3();
        Vec3.subtract(dir, moveDest, actor.node.position);
        let distance = dir.length();
        dir.normalize();

        // 添加距离阈值检查
        const distanceThreshold = 5.0; // 你可以根据需要调整这个阈值
        let movedDistance = dir.length();
        if (distance < distanceThreshold || dur < 0) {
            bt.markSuccess(result);
            result.blackboard.delete(BlackboardKey.MoveDest);
            actor.stateMgr.transit(StateDefine.Idle);
            return;
        }
        actor.input.set(dir.x, dir.y)
        bt.markRunning(result);
        actor.stateMgr.transit(StateDefine.Run);
    }
}

export class SetMoveDest extends bt.Action {
    execute(dt: number, result: bt.ExecuteResult) {
        bt.markSuccess(result);
        let actor = result.blackboard.get(BlackboardKey.Actor) as Actor;
        let ec = actor.node.getComponent(ActorController);
        if(ec)
            ec.randomNextMoveDest();
    }
}

/**
 * Stay Idle
 */
export class StayIdle extends bt.Action {
    execute(dt: number, result: bt.ExecuteResult) {
        bt.markSuccess(result);
        let actor: Actor = result.blackboard.get(BlackboardKey.Actor);
        actor.stateMgr.transit(StateDefine.Idle);
    }
}