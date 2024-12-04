import { UIOpacity } from "cc";
import { oops } from "../../../../extensions/oops-plugin-framework/assets/core/Oops";
import { ecs } from "../../../../extensions/oops-plugin-framework/assets/libs/ecs/ECS";
import { GuideModelComp } from "../model/GuideModelComp";
import { GuideViewComp } from "../view/GuideViewComp";

@ecs.register('Guide')
export class GuideEntity extends ecs.Entity {
    GuideModel!: GuideModelComp;
    GuideView!: GuideViewComp;

    private uiOpacity:UIOpacity = null;

    protected init() {
        console.log("新手引导开始");
        this.addComponents<ecs.Comp>(GuideModelComp);
    }

    /** 加载引导资源 */
    load(callback: Function) {
        oops.res.loadDir(this.GuideModel.res_dir, (err: Error | null) => {
            if (err) {
                console.error("引手引导资源加载失败");
            }
            // 注册显示对象到 ECS 实体中
            var gv = oops.gui.guide.addComponent(GuideViewComp);
            this.add(gv);
            this.hide();
            callback();
        });
    }

    hide() {
        this.uiOpacity = oops.gui.guide.getComponent(UIOpacity);
        if(!this.uiOpacity) {
            this.uiOpacity = oops.gui.guide.addComponent(UIOpacity);
        }
        this.uiOpacity.opacity = 0;
    }

    startGuide() {
        this.uiOpacity.opacity = 255;
    }

    /** 检查指定引导是否触发 */
    check(step: number) {
        console.error("验证引导【" + step + "】");
        if (this.GuideModel) {
            this.GuideModel.step = step;
            this.GuideView.check();
        }
    }

    destroy(): void {
        oops.res.releaseDir(this.GuideModel.res_dir);
        this.remove(GuideViewComp);
        this.remove(GuideModelComp);
        super.destroy();
    }
}


