import { _decorator, Component, Node } from 'cc';
import { AnimUtil } from './utils/AnimUtil';
import { Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('ScaleComp')
export class ScaleComp extends Component {

    @property
    maxScale :Vec3 = new Vec3(1.1,1.1,1.1);

    protected onEnable(): void {
        AnimUtil.playAnim_Scale(this.node);
    }
}


