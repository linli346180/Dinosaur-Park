import { _decorator, Component, Node, Sprite, Label, EventTouch, sp, SpriteFrame, Animation } from 'cc';
import { ActorDragComponent } from './dragComponent';
import { IStartBeastData } from '../account/model/AccountModelComp';
import { ActorAnimComp } from '../character/actor/ActorLevelUp';
import { oops } from '../../../../extensions/oops-plugin-framework/assets/core/Oops';
import { AccountEvent } from '../account/AccountEvent';
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

    public slotId: number = 0;  // 插槽ID
    public stbData: IStartBeastData | null = null;
    private LevelUpComp: ActorAnimComp = null!;
    private landingAnim: Animation = null!;   // 着陆动画
    private levelUpAnim: Animation = null!;   // 升级动画
    private drapTipAnim: Animation = null!;   // 拖拽动画

    /** 获取星兽配置ID(等级) */
    get STBConfigId(): number {
        if (this.stbData == null)
            return -1;
        return this.stbData.stbConfigID;
    }

    /** 获取星兽ID */
    get STBId(): number {
        if (this.stbData == null)
            return -1;
        return this.stbData.id;
    }

    onLoad() {
        this.container.active = false;
        this.landingNode.active = false;
        this.levelUpNode.active = false;
        this.dragTipNode.active = false;

        this.LevelUpComp = this.actorDragNode.getComponent(ActorAnimComp)!;
        this.landingAnim = this.landingNode.getComponent(Animation)!;
        this.levelUpAnim = this.levelUpNode.getComponent(Animation)!;
        this.drapTipAnim = this.dragTipNode.getComponent(Animation)!;
    }

    start() {
        this.landingAnim?.on(Animation.EventType.FINISHED, this.onAnimFinished, this);
        this.levelUpAnim?.on(Animation.EventType.FINISHED, this.onAnimFinished, this);
    }

    InitUI(stbData: IStartBeastData | null, showLand: boolean = false, showLevelUp: boolean = false) {
        console.log("初始化UI 槽位:"+ this.slotId + " 配置ID:"+ stbData?.stbConfigID  +"显示降落伞:", showLand + " 显示升级:", showLevelUp);
        this.stbData = stbData;
        if (this.stbData == null) {
            this.container.active = false;
            this.LevelUpComp?.InitUI(-1);
            return;
        }
        if (showLevelUp == true) {
            this.levelUpNode.active = true;
            this.levelUpAnim.play();
            return;
        }
        if (showLand == true) {
            this.landingNode.active = true;
            this.landingAnim.play();
            return;
        }
        this.container.active = true;
        this.LevelUpComp?.InitUI(this.stbData.stbConfigID);
    }

    public showDragTip(show: boolean) {
        this.dragTipNode.active = show;
        this.drapTipAnim.play();
    }

    /** 判断是否为空 */
    IsSlotEmpty(): boolean {
        return this.STBId == -1;
    }

    private onAnimFinished() {
        this.landingNode.active = false;
        this.levelUpNode.active = false;
        this.dragTipNode.active = false;
        // console.log("动画播放结束");
        if (this.stbData) {
            this.container.active = true;
            this.LevelUpComp?.InitUI(this.stbData.stbConfigID);
        }
    }
}