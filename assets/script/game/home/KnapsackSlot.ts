import { _decorator, Component, Node, Animation } from 'cc';
import { StartBeastData } from '../account/model/AccountModelComp';
import { ActorAnimComp } from '../character/actor/ActorLevelUp';
import { Label } from 'cc';
const { ccclass, property } = _decorator;

/** 背包插槽 */
@ccclass('KnapsackSlot')
export class KnapsackSlot extends Component {
    @property(Node)
    container: Node = null!;
    @property(Node)
    actorDragNode: Node = null!;
    @property(Node)
    landingNode: Node = null!;
    @property(Node)
    levelUpNode: Node = null!;
    @property(Node)
    dragTipNode: Node = null!;

    @property(Label)
    slotLabel: Label = null!;
    @property(Label)
    stbIdLabel: Label = null!;
    @property(Label)
    stbConfigIdLabel: Label = null!;

    public slotId: number = 0;  // 插槽ID
    public stbData: StartBeastData | null = null;
    private idleAnim: ActorAnimComp = null!;        // 待机动画
    private landingAnim: Animation = null!;         // 着陆动画
    private levelUpAnim: Animation = null!;         // 升级动画
    private drapTipAnim: Animation = null!;         // 拖拽动画

    /** 是否可以交换 */
    get CanSwap(): boolean {
        if (this.landingNode.active || this.levelUpNode.active)
            return false;
        return true;
    }

    /** 获取星兽配置ID(等级) */
    get STBConfigId(): number {
        if (this.stbData == null) return -1;
        return this.stbData.stbConfigID;
    }

    /** 获取星兽ID */
    get STBId(): number {
        if (this.stbData == null) return -1;
        return this.stbData.id;
    }

    /** 获取星兽配置ID */
    get STBConfigID(): number {
        if (this.stbData == null) return -1;
        return this.stbData.stbConfigID;
    }

    /** 设置星兽配置ID */
    set STBConfigID(stbConfigID: number) {
        console.log(`更新槽位:${this.slotId} 星兽配置:${stbConfigID}`);
        if (this.stbData) {
            this.stbData.stbConfigID = stbConfigID;
        }
        this.container.active = this.STBConfigID > 0;
        this.idleAnim.InitUI(this.STBConfigID);
        this.dump();
    }

    /** 判断是否为空 */
    public IsSlotEmpty(): boolean {
        // console.log(`判断槽位:${this.slotId} 是否为空${this.STBConfigID <= 0}  星兽id:${this.STBId}`);
        return this.STBConfigID <= 0;
    }

    onLoad() {
        this.container.active = false;
        this.landingNode.active = false;
        this.levelUpNode.active = false;
        this.dragTipNode.active = false;
        this.idleAnim = this.actorDragNode.getComponent(ActorAnimComp)!;
        this.landingAnim = this.landingNode.getComponent(Animation)!;
        this.levelUpAnim = this.levelUpNode.getComponent(Animation)!;
        this.drapTipAnim = this.dragTipNode.getComponent(Animation)!;
    }

    public InitUI(stbData: StartBeastData, showLand: boolean = false, showLevelUp: boolean = false) {
        console.log(`初始化槽位:${this.slotId} 星兽id:${stbData?.id} 星兽配置:${stbData?.stbConfigID} 降落伞:${showLand} 升级:${showLevelUp}`);

        this.stbData = stbData;
        this.dump();
        if (!stbData || stbData.stbConfigID <= 0) {
            this.container.active = false;
            return;
        }
        if (showLevelUp) {
            this.showLevelUpAnim(true);
            return;
        }

        if (showLand) {
            this.showLandingAnim(true);
            return;
        }

        this.container.active = true;
        this.idleAnim.InitUI(this.stbData.stbConfigID);
    }

    /** 显示拖拽提示 */
    public showDragTip(show: boolean) {
        this.dragTipNode.active = show;
        if (show) this.drapTipAnim.play();
    }

    /** 播放降落动画 */
    public showLandingAnim(show: boolean) {
        this.landingNode.active = show;
        if (show) {
            this.landingAnim.play();
            this.landingAnim.once(Animation.EventType.FINISHED, this.onLandAnimFinished, this);
        }
    }

    /** 播放升级动画 */
    public showLevelUpAnim(show: boolean, callback?: Function) {
        this.levelUpNode.active = show;
        if (show) {
            this.levelUpAnim.play();
            this.levelUpAnim.once(Animation.EventType.FINISHED, () => {
                this.onLevelUpAnimFinished();
                if (callback) callback();
            }, this);
        }
    }


    private onLandAnimFinished() {
        this.landingNode.active = false;
        this.container.active = true;
        this.idleAnim?.InitUI(this.STBConfigID);
    }

    private onLevelUpAnimFinished() {
        this.levelUpNode.active = false;
        this.container.active = true;
        this.idleAnim?.InitUI(this.STBConfigID);
    }

    dump() {
        this.slotLabel.string = `${this.slotId}`;
        this.stbIdLabel.string = `${this.STBId}`;
        this.stbConfigIdLabel.string = `${this.STBConfigID}`;
    }
}