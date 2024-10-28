import { _decorator, Animation } from 'cc';
import { IState } from './State';
import { StateDefine } from './StateDefine';
import { Actor } from './Actor';
const { ccclass, property } = _decorator;


export abstract class ActorState implements IState<StateDefine> {
    id: StateDefine;
    actor: Actor
    animation: Animation

    constructor(name: StateDefine, actor: Actor) {
        this.actor = actor;
        this.animation = actor.animation;
        this.id = name;
    }

    onEnter(): void { }
    onExit(): void { }
    update(deltaTime: number): void { }
    onDestory(): void { }
    canTransit(to: StateDefine): boolean { return true; }
}


