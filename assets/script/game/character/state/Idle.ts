import { _decorator, Component, Node, Vec2 } from 'cc';
import { ActorState } from './ActorState';
import { StateDefine } from './StateDefine';
const { ccclass, property } = _decorator;

export class Idle extends ActorState {    
    onEnter(): void {      
        if(this.actor.rigidbody){
            this.actor.rigidbody.linearVelocity = Vec2.ZERO;
            let hasIdle = this.animation.getState(StateDefine.Idle);
            if (hasIdle){
                this.animation.play(StateDefine.Idle);
            } 
        }           
    }
    update(deltaTime: number) {}
    onExit(): void {}
    onDestory(): void {} 
    canTransit(to: StateDefine): boolean {
        if (to == StateDefine.Idle) {
            return false;
        }
        return true;
    }
} 
