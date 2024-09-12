import { ecs } from '../../../../../extensions/oops-plugin-framework/assets/libs/ecs/ECS';
import { oops } from '../../../../../extensions/oops-plugin-framework/assets/core/Oops';
import { DinosaurModelComp } from '../model/DinosaurModel';
import { Dinosaur } from '../Dinosaur';

@ecs.register('dinosaurMerge')
export class DinosaurMergeComp extends ecs.Comp {

    dinosaurId: number = 0;

    reset(): void {

    }
}

@ecs.register('Dinosaur')
export class DinosaurMergeSystem extends ecs.ComblockSystem implements ecs.IEntityEnterSystem {
    filter(): ecs.IMatcher {
        return ecs.allOf(DinosaurMergeComp, DinosaurModelComp);
    }

    entityEnter(dinosaur: Dinosaur): void {
        // 合并逻辑: 恐龙等级+1, 移除合并组件, 通知视图层刷新界面
        // dinosaur.dinosaurModel.level += 1;
        // oops.message.dispatchEvent(DinosaurEvent.upgrade, dinosaur.dinosaurModel.id);

        dinosaur.remove(DinosaurMergeComp);
    }
}