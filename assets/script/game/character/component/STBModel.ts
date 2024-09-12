import { ecs } from "../../../../../extensions/oops-plugin-framework/assets/libs/ecs/ECS";
import { VM } from "../../../../../extensions/oops-plugin-framework/assets/libs/model-view/ViewModel";

/** 数据层对象 */
@ecs.register('STBModel')
export class STBModelComp extends ecs.Comp {

    

    /** 数据层组件移除时，重置所有数据为默认值 */
    reset() {

    }
}