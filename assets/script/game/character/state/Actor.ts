import { _decorator, Component, Node, RigidBody2D, CircleCollider2D, Collider2D, Animation, v2, Vec2, Sprite, Quat, Label } from 'cc';
import { StateMachine } from './StateMachine';
import { StateDefine } from './StateDefine';
import { MathUtil } from '../../common/utils/MathUtil';
import { Contact2DType } from 'cc';
import { Color } from 'cc';
const { ccclass, property, requireComponent, disallowMultiple } = _decorator;

@ccclass('Actor')
@requireComponent(RigidBody2D)
@requireComponent(Collider2D)
@disallowMultiple(true)
export class Actor extends Component {
    public rigidbody: RigidBody2D | null = null;
    public collider: Collider2D | null = null;

    @property(Animation)
    public animation: Animation = null!;
    @property(Sprite)
    public mainRenderer: Sprite = null!;
    @property(Label)
    public survival: Label = null!;
    // @property
    // public linearSpeed: number = 5;    // 移动速度
    public stateMgr: StateMachine<StateDefine> = new StateMachine();

    _input: Vec2 = v2();
    set input(v: Vec2) { this._input.set(v.x, v.y); }
    get input(): Vec2 { return this._input; }

    start() {
        this.rigidbody = this.node.getComponent(RigidBody2D);
        this.collider = this.node.getComponent(Collider2D);
    }

    /** 图片镜像 */
    update(deltaTime: number) {
        this.stateMgr.update(deltaTime);
        if (this.input.x < 0) {
            this.mainRenderer.node.rotation = Quat.IDENTITY;
        } else if (this.input.x > 0) {
            this.mainRenderer.node.rotation = MathUtil.ROT_Y_180;
        }
    }

    /** 更新存活时间显示 */
    public updateSurvivalDisplay(survivalSec: number) {
        this.survival.node.active = true;
        const hours = Math.floor(survivalSec / 3600);
        const minutes = Math.floor((survivalSec % 3600) / 60);
        const seconds = survivalSec % 60;

        let formattedTime = "";
        if (hours > 0) {
            formattedTime = `${this.padZero(hours)}:${this.padZero(minutes)}:${this.padZero(seconds)}`;
        } else {
            formattedTime = `${this.padZero(minutes)}:${this.padZero(seconds)}`;
        }

        this.survival.string = formattedTime;

        if (survivalSec <= 3)
            this.survival.color = Color.RED;
    }

    private padZero(num: number): string {
        return num < 10 ? `0${num}` : `${num}`;
    }

}