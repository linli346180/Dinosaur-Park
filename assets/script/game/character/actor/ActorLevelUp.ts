import { Label } from 'cc';
import { _decorator, Component, Node, Animation } from 'cc';
import { TableSTBConfig } from '../../common/table/TableSTBConfig';
const { ccclass, property } = _decorator;

@ccclass('ActorAnimComp')
export class ActorAnimComp extends Component {
    @property(Label)
    level: Label = null!;
    @property(Animation)
    idleAnim: Animation = null!;   // 待机动画

    private stbTableConfig: TableSTBConfig = new TableSTBConfig();

    start() {
        this.idleAnim.on(Animation.EventType.FINISHED, this.onAnimationFinished, this);
    }

    public InitUI(stbConfigID: number) {
        console.log("ActorAnimComp InitUI stbConfigID = ", stbConfigID);
        if(stbConfigID == -1){
            this.idleAnim.stop();
            return;
        }
        this.level.string = stbConfigID.toString();
        this.stbTableConfig.init(stbConfigID);
        this.idleAnim.play(this.stbTableConfig.animation);
    }

    private onAnimationFinished() {
        const randomDelay = Math.random() * 2000 + 1000; // 随机延迟2到5秒
        setTimeout(() => {
            this.idleAnim.play(this.stbTableConfig.animation);
        }, randomDelay);
    }
}


