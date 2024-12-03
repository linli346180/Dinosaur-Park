import { Label } from 'cc';
import { _decorator, Component, Node, Animation } from 'cc';
import { TableSTBConfig } from '../../common/table/TableSTBConfig';
import { smc } from '../../common/SingletonModuleComp';
import { UserInstbConfigData } from '../../account/model/STBConfigModeComp';
import { StringUtil } from '../../common/utils/StringUtil';
const { ccclass, property } = _decorator;

@ccclass('ActorAnimComp')
export class ActorAnimComp extends Component {
    @property(Label)
    private level: Label = null!;
    @property(Animation)
    private idleAnim: Animation = null!;   // 待机动画

    private stbTableConfig: TableSTBConfig = new TableSTBConfig();

    start() {
        this.idleAnim.on(Animation.EventType.FINISHED, this.onAnimationFinished, this);
    }

    onDestroy() {
        this.idleAnim.off(Animation.EventType.FINISHED, this.onAnimationFinished, this);
        this.unscheduleAllCallbacks();
    }

    public InitUI(stbConfigID: number) {
        const config: UserInstbConfigData = smc.account.getSTBConfigById(stbConfigID);
        if (config == null) {
            this.idleAnim.stop();
            return;
        }
        
        this.level.string = config.stbGrade.toString();
        const itemID = StringUtil.combineNumbers(config.stbKinds, config.stbGrade, 2);
        this.stbTableConfig.init(itemID);
        if(this.stbTableConfig.animation != undefined && this.stbTableConfig.animation != '')
            this.idleAnim.play(this.stbTableConfig.animation);
    }

    private onAnimationFinished() {
        const randomDelay = Math.random() * 2 + 10; // 随机延迟2到5秒
        this.scheduleOnce(() => {  
            this.idleAnim.play(this.stbTableConfig.animation);
         }, randomDelay);
    }
}
