import { _decorator, Component, Node } from 'cc';
import { ecs } from '../../../../extensions/oops-plugin-framework/assets/libs/ecs/ECS';
const { ccclass, property } = _decorator;

@ecs.register('STBEntity')
export class STBEntity extends ecs.Entity {

    protected init() {
        console.error('STBEntity init' + this.eid);
    }
}


