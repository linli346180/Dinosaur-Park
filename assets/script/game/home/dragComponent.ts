import { _decorator, Component, Node, EventTouch, UITransform, Vec3 } from 'cc';
import { KnapsackControlle } from './KnapsackControlle';
import { KnapsackSlot } from './KnapsackSlot';
const { ccclass, property } = _decorator;

type dragCallBack = (data: number) => void;

@ccclass('ActorDragComponent')
export class ActorDragComponent extends Component {
    /** 是否正在拖动 */
    static IsDragging: boolean = false;

    // @property(Node)
    public dragNode: Node = null!;
    public slotId: number = 0;  // 插槽ID
    private _orgParent: Node | null = null;
    private _orgPosition: Vec3 = new Vec3();
    private offset: Vec3 = new Vec3();

    public beginDragCallBack: dragCallBack | null = null;
    public endDragCallBack: dragCallBack | null = null;;

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
        ActorDragComponent.IsDragging = true;
        this.beginDragCallBack?.(this.slotId);

        // 将节点添加到新的父节点
        const worldPos = this.node.getWorldPosition();
        this.dragNode?.addChild(this.node);
        this.node.setWorldPosition(worldPos);

        this.calculateOffset(event);
    }

    private calculateOffset(event: EventTouch) {
        const uiTransform = this.node.parent.getComponent(UITransform);
        if (uiTransform) {
            // 获取触摸点的世界坐标
            const touchLocation = event.getUILocation();
            const worldPosition = new Vec3(touchLocation.x, touchLocation.y, 0);

            // 将世界坐标转换为节点的局部坐标（相对于锚点）
            const localPosition = uiTransform.convertToNodeSpaceAR(worldPosition);

            // 计算节点当前位置与点击位置的偏移
            this.offset = this.node.position.clone().subtract(localPosition);
        }
    }

    onTouchMove(event: EventTouch) {
        if (!ActorDragComponent.IsDragging)
            return;

        // const uiTransform = this.node.getComponent(UITransform);
        // if (uiTransform) {
        //     const touchPos = event.getUILocation();
        //     const nodePos = uiTransform.convertToNodeSpaceAR(new Vec3(touchPos.x, touchPos.y, 0));
        //     this.node.setPosition(this.node.position.add(nodePos));
        // }

        const uiTransform = this.node.parent.getComponent(UITransform);
        if (uiTransform) {
            // 获取拖动中的世界坐标
            const touchLocation = event.getUILocation();
            const worldPosition = new Vec3(touchLocation.x, touchLocation.y, 0);

            // 将世界坐标转换为节点父级的本地坐标
            const localPosition = uiTransform.convertToNodeSpaceAR(worldPosition);

            // 根据偏移量设置新位置
            const newPos = localPosition.add(this.offset);
            this.node.setPosition(newPos);
        }
    }

    onTouchEnd(event: EventTouch) {
        ActorDragComponent.IsDragging = false;
        this._orgParent?.addChild(this.node);
        this.node.setPosition(this._orgPosition)
        this.endDragCallBack?.(this.slotId);

        let dragSlotId = 0;
        if (KnapsackControlle.instance) {
            for (const slot of KnapsackControlle.instance?.SlotNodes) {
                if (this.isNodeInSlot(event, slot)) {
                    // console.log('进入插槽区域' + slot.getComponent(KnapsackSlot)?.slotId);
                    const comp = slot.getComponent(KnapsackSlot);
                    if (comp && comp.CanSwap) {
                        dragSlotId = slot.getComponent(KnapsackSlot)?.slotId || 0;
                    }
                    break;
                }
            }
        }

        if (dragSlotId > 0 && dragSlotId != this.slotId) {
            // console.log(`拖动从${this.slotId}到${dragSlotId}`);
            KnapsackControlle.instance?.swapSlot(this.slotId, dragSlotId);
        }
    }

    isNodeInSlot(event: EventTouch, slot: Node): boolean {
        const touchPos = event.getUILocation();
        const slotBox = slot.getComponent(UITransform)!.getBoundingBoxToWorld();
        return slotBox.contains(touchPos)
    }
}

