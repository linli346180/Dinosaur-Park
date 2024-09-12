import { _decorator, Component, Node, EventTouch, UITransform, Vec3 } from 'cc';
import { KnapsackControlle } from './KnapsackControlle';
const { ccclass, property } = _decorator;

@ccclass('DragComponent')
export class DragComponent extends Component {
    /** 是否正在拖动 */
    static IsDragging: boolean = false;
    /** 拖动到的槽位ID */
    static DragSlotId: number = -1;

    @property(Node)
    public dragNode: Node = null!;
    public slotId: number = 0;
    private _orgParent: Node | null = null;
    private _orgPosition: Vec3 = new Vec3();

    start() {
        this._orgParent = this.node.parent;
        this._orgPosition = this.node.position.clone();
        this.node.on(Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.on(Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.on(Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
    }

    onDestroy() {
        this.node.off(Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.off(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.off(Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.off(Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
    }

    onTouchStart(event: EventTouch) {
        DragComponent.IsDragging = true;
        DragComponent.DragSlotId = this.slotId;
        const uiTransform = this.node.getComponent(UITransform);
        if (uiTransform) {
            // 将节点添加到新的父节点
            const worldPos = this.node.getWorldPosition();
            this.dragNode?.addChild(this.node);
            this.node.setWorldPosition(worldPos);
        }
    }

    onTouchMove(event: EventTouch) {
        if (!DragComponent.IsDragging)
            return;
        const uiTransform = this.node.getComponent(UITransform);
        if (uiTransform) {
            const touchPos = event.getUILocation();
            const nodePos = uiTransform.convertToNodeSpaceAR(new Vec3(touchPos.x, touchPos.y, 0));
            this.node.setPosition(this.node.position.add(nodePos));
        }
    }

    onTouchEnd(event: EventTouch) {
        DragComponent.IsDragging = false;
        this._orgParent?.addChild(this.node);
        this.node.setPosition(this._orgPosition)

        if(DragComponent.DragSlotId > 0 && DragComponent.DragSlotId != this.slotId)
        {
            console.log(`拖动从${this.slotId}到${DragComponent.DragSlotId}`);
            KnapsackControlle.instance?.swapSlot(this.slotId, DragComponent.DragSlotId);
        }
    }
}

