import {
  EventTouch,
  _decorator,
  Component,
  Node,
  UITransform,
  Vec3,
  Contact2DType,
  Collider2D,
  IPhysics2DContact,
  PhysicsSystem2D,
} from 'cc';
import { ActorController } from './state/ActorController';
import { oops } from '../../../../extensions/oops-plugin-framework/assets/core/Oops';
import { UIID } from '../common/config/GameUIConfig';
import { UICallbacks } from '../../../../extensions/oops-plugin-framework/assets/core/gui/layer/Defines';
import { STBMerge } from '../shop/STBMerge';
import { EDITOR } from 'cc/env';
const { ccclass } = _decorator;

@ccclass('ActorDrag')
export class ActorDrag extends Component {
  private actorCtrl: ActorController | null = null!;
  private offset: Vec3 = new Vec3();
  private IsDragging: boolean = false;

  start() {
    PhysicsSystem2D.instance.enable = true;
    // if (EDITOR)
    //     PhysicsSystem2D.instance.debugDrawFlags = 1;

    this.actorCtrl = this.node.getComponent(ActorController);
    this.node.on(Node.EventType.TOUCH_START, this.onNodeTouchStart, this);
    this.node.on(Node.EventType.TOUCH_MOVE, this.onNodeTouchMove, this);
    this.node.on(Node.EventType.TOUCH_END, this.onNodeTouchEnd, this);
    this.node.on(Node.EventType.TOUCH_CANCEL, this.onNodeTouchEnd, this);

    const collider = this.getComponent(Collider2D);
    if (collider) {
      collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
    }
  }

  onDestroy() {
    this.node.off(Node.EventType.TOUCH_START, this.onNodeTouchStart, this);
    this.node.off(Node.EventType.TOUCH_MOVE, this.onNodeTouchMove, this);
    this.node.off(Node.EventType.TOUCH_END, this.onNodeTouchEnd, this);
    this.node.off(Node.EventType.TOUCH_CANCEL, this.onNodeTouchEnd, this);
  }

  onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
    if (this.IsDragging) {
      console.log('碰撞到了', otherCollider.node.name);
      let stbID1 = this.actorCtrl.stbId;
      let stbID2 = otherCollider.node.getComponent(ActorController)?.stbId ?? 0;
      if (stbID1 === 0 || stbID2 === 0) return;
      var uic: UICallbacks = {
        onAdded: (node: Node, params: any) => {
          const component = node.getComponent(STBMerge);
          if (component) {
            component.InitUI(stbID1, stbID2);
          }
        },
      };
      let uiArgs: any;
      oops.gui.open(UIID.STBMerge, uiArgs, uic);
      this.onNodeTouchEnd();
    }
    // this.actorCtrl?.setWaitState();
  }

  private onNodeTouchStart(event: EventTouch) {
    console.log('onNodeTouchStart');  
    this.IsDragging = true;
    this.actorCtrl.setDrag(true);
    this.calculateOffset(event);
    this.setNodeToTop(this.node);
  }

  private onNodeTouchMove(event: EventTouch) {
    console.log('onNodeTouchStart'); 
    if (!this.IsDragging) return;
    this.updateNodePosition(event);
  }

  private onNodeTouchEnd() {
    console.log('onNodeTouchStart'); 
    this.IsDragging = false;
    this.actorCtrl.setDrag(false);
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

  private updateNodePosition(event: EventTouch) {
    if (!this.IsDragging) return;

    const uiTransform = this.node.parent.getComponent(UITransform);
    if (uiTransform) {
      // 获取拖动中的世界坐标
      const touchLocation = event.getUILocation();
      const worldPosition = new Vec3(touchLocation.x, touchLocation.y, 0);

      // 将世界坐标转换为节点父级的本地坐标
      const localPosition = uiTransform.convertToNodeSpaceAR(worldPosition);

      // 根据偏移量设置新位置
      const newPos = localPosition.add(this.offset);

      // 限制节点移动范围
      if (this.actorCtrl) {
        newPos.x = Math.max(
          this.actorCtrl.widthLimit.x,
          Math.min(newPos.x, this.actorCtrl.widthLimit.y)
        );
        newPos.y = Math.max(
          this.actorCtrl.heightLimit.x,
          Math.min(newPos.y, this.actorCtrl.heightLimit.y)
        );
      }

      this.node.setPosition(newPos);
    }
  }

  private setNodeToTop(slef: Node) {
    if (slef.parent) {
      slef.setSiblingIndex(slef.parent.children.length - 1);
    }
  }
}
