import { _decorator, Component, Node } from 'cc';
import { ecs } from '../../../../extensions/oops-plugin-framework/assets/libs/ecs/ECS';
import { DinosaurModelComp } from './model/DinosaurModel';
import { DinosaurMergeComp } from './system/MergeSystem';

const { ccclass, property } = _decorator;

/** 恐龙实体 */
@ecs.register('Dinosaur')
export class Dinosaur extends ecs.Entity {

    /** 恐龙数据模型  */
    dinosaurModel !: DinosaurModelComp;

    /** 业务层 */
    dinosaurMerge !: DinosaurMergeComp;


    protected init() {
        this.addComponents<ecs.Comp>(DinosaurModelComp);
        this.addEvent();
    }

    destroy(): void {
        super.destroy();
        this.removeEvent();
    }

    private addEvent() {

    }

    private removeEvent() {

    }
}


