import { ecs } from '../../../../../extensions/oops-plugin-framework/assets/libs/ecs/ECS';


/** 恐龙数据模型 */
@ecs.register('dinosaurModel')
export class DinosaurModelComp extends ecs.Comp {
    /** 恐龙ID */
    id: number = 0;

    /** 恐龙等级 */
    level: number = 0;

    /** 是否可以合并 */
    canMerge: boolean = true;  

    /** 是否允许升级 */
    canUpgrade: boolean = true;

    reset(): void {
        this.id = 0;
        this.level = 0;
    }
}