import { v2 } from 'cc';
import { Vec2 } from 'cc';
import { _decorator, Component, Node, RigidBody2D, CircleCollider2D, Collider2D, Animation } from 'cc';
import { StateMachine } from './StateMachine';
import { StateDefine } from './StateDefine';
import { Sprite } from 'cc';
import { mathutil } from '../../common/utils/MathUtil';
import { Quat } from 'cc';
import { Label } from 'cc';
const { ccclass, property, requireComponent, disallowMultiple } = _decorator;

@ccclass('Actor')
@requireComponent(RigidBody2D)
@requireComponent(CircleCollider2D)
@disallowMultiple(true)
export class Actor extends Component {
    rigidbody: RigidBody2D | null = null;
    collider: Collider2D | null = null;
    stateMgr: StateMachine<StateDefine> = new StateMachine();

    @property(Animation)
    animation: Animation = null!;
    @property(Sprite)
    mainRenderer: Sprite = null!;
    @property(Label)
    survival:Label = null!;

    @property
    linearSpeed: number = 3;    // 移动速度

    _input: Vec2 = v2();
    set input(v: Vec2) { this._input.set(v.x, v.y); }
    get input(): Vec2 { return this._input; }

    start() {
        this.rigidbody = this.node.getComponent(RigidBody2D);
        this.collider = this.node.getComponent(Collider2D);
    }

    update(deltaTime: number) {
        this.stateMgr.update(deltaTime);
        if (this.input.x < 0) {
            this.mainRenderer.node.rotation = Quat.IDENTITY ;
        } else if (this.input.x > 0) {
            this.mainRenderer.node.rotation = mathutil.ROT_Y_180;
        }
    }
}