import { EventTouch, _decorator, Component, Node, UITransform, Vec3 } from 'cc';
import { ActorController } from './state/ActorController';
import { Collider } from 'cc';
import { Contact2DType } from 'cc';
import { Collider2D } from 'cc';
import { IPhysics2DContact } from 'cc';
import { PhysicsSystem2D } from 'cc';
import { oops } from '../../../../extensions/oops-plugin-framework/assets/core/Oops';
import { UIID } from '../common/config/GameUIConfig';
import { UICallbacks } from '../../../../extensions/oops-plugin-framework/assets/core/gui/layer/Defines';
import { STBMerge } from '../shop/STBMerge';
const { ccclass } = _decorator;

@ccclass('ActorDrag')
export class ActorDrag extends Component {
    private actorCtrl: ActorController | null = null!;
    private offset: Vec3 = new Vec3();
    private initialPosition: Vec3 = new Vec3();
    private IsDragging: boolean = false;

    protected onLoad(): void {
        PhysicsSystem2D.instance.enable = true;
        // PhysicsSystem2D.instance.debugDrawFlags = 1;
    }

    start() {
        this.actorCtrl = this.node.getComponent(ActorController);
        this.node.on(Node.EventType.TOUCH_START, this.onNodeTouchStart, this);
        this.node.on(Node.EventType.TOUCH_MOVE, this.onNodeTouchMove, this);
        this.node.on(Node.EventType.TOUCH_END, this.onNodeTouchEnd, this);
        this.node.on(Node.EventType.TOUCH_CANCEL, this.onNodeTouchEnd, this);

        const collider = this.getComponent(Collider2D);
        if (collider) {
            collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
            collider.on(Contact2DType.END_CONTACT, this.onEndContact, this);
        }
    }

    onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        this.actorCtrl?.setWaitState();
        if (this.IsDragging) {
            console.log('碰撞到了', otherCollider.node.name);
            this.onNodeTouchEnd()

            let stbID1 = 0;
            if (this.actorCtrl) stbID1 = this.actorCtrl.stbId;
            let stbID2 = 0;
            let otherNodeComp = otherCollider.node.getComponent(ActorController);
            if (otherNodeComp)
                stbID2 = otherNodeComp.stbId;

            var uic: UICallbacks = {
                onAdded: (node: Node, params: any) => {
                    const component = node.getComponent(STBMerge);
                    if (component) {
                        component.InitUI(stbID1, stbID2);
                    }
                }
            };
            let uiArgs: any;
            oops.gui.open(UIID.STBMerge, uiArgs, uic);
        }
    }

    onEndContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        // 只在两个碰撞体结束接触时被调用一次
        // console.log('onEndContact');
    }

    private onNodeTouchStart(event: EventTouch) {
        this.IsDragging = true;
        this.actorCtrl?.setDragState(true);
        this.calculateOffset(event);
        this.initialPosition.set(this.node.position); // 记录初始位置
        console.log('onNodeTouchStart' + this.node.name + 'offset' + this.offset);
        this.setNodeToTop(this.node)
    }

    private onNodeTouchMove(event: EventTouch) {
        if (!this.IsDragging) return;
        this.updateNodePosition(event);
    }

    private onNodeTouchEnd() {
        this.IsDragging = false;
        this.actorCtrl?.setDragState(false);
        // this.node.setPosition(this.initialPosition); // 返回到初始位置
    }

    private calculateOffset(event: EventTouch) {
        const uiTransform = this.node.getComponent(UITransform);
        if (uiTransform) {
            const touchPos = event.getUILocation();
            const nodePos = uiTransform.convertToNodeSpaceAR(new Vec3(touchPos.x, touchPos.y, 0));
            this.offset = this.node.position.subtract(nodePos);
        }
    }

    private updateNodePosition(event: EventTouch) {
        const uiTransform = this.node.getComponent(UITransform);
        if (uiTransform) {
            const touchPos = event.getUILocation();
            const nodePos = uiTransform.convertToNodeSpaceAR(new Vec3(touchPos.x, touchPos.y, 0));
            this.node.setPosition(nodePos.add(this.offset));
        }
    }

    private setNodeToTop(slef: Node) {
        if (slef.parent) {
            slef.setSiblingIndex(slef.parent.children.length - 1);
        }
    }
}