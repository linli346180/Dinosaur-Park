import { _decorator, Component, Node, Sprite, Label, EventTouch, sp, SpriteFrame } from 'cc';
import { DragComponent } from './dragComponent';
import { IStartBeastData } from '../account/model/AccountModelComp';
const { ccclass, property } = _decorator;


@ccclass('KnapsackSlot')
export class KnapsackSlot extends Component {
    @property(Node)
    container: Node = null!;
    @property(Sprite)
    slotPrite: Sprite = null!;
    @property(Label)
    slotLabel: Label = null!;
    // @property(Number)
    slotId: number = 0;
    public stbData: IStartBeastData | null = null;
    public stbIcon: SpriteFrame | null = null;

    onLoad() {
        this.container.active = false;
    }

    onEnable() {
        // 监听移入事件
        this.node.on(Node.EventType.MOUSE_ENTER, this.onMouseEnter, this);
        this.node.on(Node.EventType.MOUSE_LEAVE, this.onMouseLeave, this);
    }

    onDisable() {
        // 移除监听器
        this.node.off(Node.EventType.MOUSE_ENTER, this.onMouseEnter, this);
        this.node.off(Node.EventType.MOUSE_LEAVE, this.onMouseLeave, this);
    }

    onMouseEnter(event: EventTouch) {
        DragComponent.DragSlotId = this.slotId;
    }

    onMouseLeave(event: EventTouch) {
        DragComponent.DragSlotId = -1;
    }

    /** 判断是否为空 */
    IsEmpty(): boolean {
        return !this.container.active;
    }

    /** 获取星兽配置ID(等级) */
    get STDLevel(): number {
        if (this.stbData == null)
            return -1;
        return this.stbData.stbConfigID;
    }

    get STDID(): number {
        if (this.stbData == null)
            return -1;
        return this.stbData.id;
    }

    InitSlot(slotData: IStartBeastData | null, icon: SpriteFrame | null) {
        if (slotData == null) {
            this.ResetSlot();
            return;
        }
        // console.log("InitSlot: " + this.node.name + JSON.stringify(slotData));
        this.container.active = true;
        this.stbData = slotData;
        this.stbIcon = icon;
        this.slotPrite.spriteFrame = icon;
        this.slotLabel.string = slotData.stbConfigID.toString();
    }

    ResetSlot() {
        // console.log("ResetSlot 开始" + this.node.name);
        this.container.active = false;
        this.stbData = null;
        this.slotPrite.spriteFrame = null;
        this.slotLabel.string = "";
        // console.log("ResetSlot 结束"+ this.node.name);
    }
}