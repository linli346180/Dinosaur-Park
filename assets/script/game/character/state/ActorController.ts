import { _decorator, Component, math, v3, Vec2, Vec3, Color, UITransform, size, Sprite, Quat, macro } from 'cc';
import { IStartBeastData } from '../../account/model/AccountModelComp';
import { RvoCollider } from '../../../RVO/RvoCollider';
import { GridCollider } from '../../../RVO/Collision/GridCollider';
import { GridGroup } from '../../../RVO/Collision/GridColliderMgr';
import { MathUtil } from '../../common/utils/MathUtil';
import { Actor } from './Actor';
import { StateDefine } from './StateDefine';
import { Idle } from './Idle';
import { Run } from './Run';
import { Vector2 } from '../../../RVO/Common';
import { smc } from '../../common/SingletonModuleComp';
import { UIOpacity } from 'cc';
import { tween } from 'cc';

const { ccclass, property } = _decorator;

const tmpP0 = new Vec2();

@ccclass('ActorController')
export class ActorController extends Component {
    public stbId: number = 0;  // 星兽ID
    public stbData: IStartBeastData | undefined; // 星兽数据
    public widthLimit: Vec2 = new Vec2();
    public heightLimit: Vec2 = new Vec2();
    public actor: Actor = null!;

    private isDrag: boolean = false;
    private curLineSpd = new Vec3();  //当前线性速度
    private curPos = new Vec3();      //当前位置
    private checkCd = 0.5;
    private checkCurt = 0;
    private rvoCollider: RvoCollider;
    private gridCollider: GridCollider;
    private moveSpeed: number = 100;
    private radius: number = 80;
    private runTime: number = 0;
    private idleTime: number = 0;
    private runInterval: number = 0;
    private idleInterval: number = 0;

    private isSurvival: boolean = true; // 是否存活
    private survivalSec: number = 0;    //生命周期

    public init(pos: Vec3, vec: Vec3): void {
        this.runTime = 0;
        this.idleInterval = 0;
        this.randomRunInterval();
        this.randomIdleInterval();
        this.curPos.set(pos);
        this.curLineSpd.set(vec).normalize().multiplyScalar(this.moveSpeed);
        this.node.setPosition(this.curPos);

        this.initCollider();
    }

    public reset() {
        this.resetCollider();
    }

    public setDrag(isDrag: boolean) {
        this.isDrag = isDrag;
        if (isDrag) {
            this.resetCollider();
        } else {
            this.init(this.node.position, Vec3.ZERO);
        }
    }

    start() {
        this.runInterval = math.randomRange(3, 7);
        this.idleInterval = math.randomRange(3, 7);
        this.actor = this.node.getComponent(Actor);
        this.actor.stateMgr.registState(new Idle(StateDefine.Idle, this.actor));
        this.actor.stateMgr.registState(new Run(StateDefine.Run, this.actor));
        this.actor.stateMgr.startWith(StateDefine.Idle);
        this.initSurvival();
    }

    update(dt: number) {
        this.updateCollider(dt);
        this.randomToRun(dt);
    }

    lateUpdate(dt: number): void {
        this.lateUpdateGridCld(dt);
    }

    onActorDeath() {
        this.resetCollider();
        this.actor.stateMgr.transit(StateDefine.Idle);
        let uiOpacity = this.node.getComponent(UIOpacity);
        if(uiOpacity == null)
            uiOpacity = this.node.addComponent(UIOpacity);

        tween(this.node)
        .call(() => { uiOpacity.opacity = 255; })
        .to(0.5, {}, { onUpdate: (target, ratio) => { uiOpacity.opacity = 255 * (1 - ratio * 0.5); } }) // 透明度从 255 变到 127.5
        .to(0.5, {}, { onUpdate: (target, ratio) => { uiOpacity.opacity = 127.5 + 127.5 * ratio; } }) // 透明度从 127.5 变到 255
        .to(0.5, {}, { onUpdate: (target, ratio) => { uiOpacity.opacity = 255 * (1 - ratio * 0.5); } }) // 透明度从 255 变到 127.5
        .to(0.5, {}, { onUpdate: (target, ratio) => { uiOpacity.opacity = 127.5 + 127.5 * ratio; } }) // 透明度从 127.5 变到 255
        .to(1, {}, { onUpdate: (target, ratio) => { uiOpacity.opacity = 255 * (1 - ratio); } }) // 透明度从 255 变到 0
        .call(() => { 
            this.node.removeFromParent();
            this.node.destroy();
        })
        .start();
        return;
    }

    /** 初始化生命周期 */
    private initSurvival() {
        if(!this.actor)
            return;

        this.survivalSec = smc.account.getSTBSurvivalSec(this.stbId);
        this.isSurvival = this.survivalSec > 0;
        this.actor.survival.node.active = this.isSurvival;
        if (this.isSurvival) {
            this.actor.updateSurvivalDisplay(this.survivalSec);
            this.schedule(this.updateSurvival, 1.0, this.survivalSec, 0);
        }
    }

    /** 更新生命周期 */
    private updateSurvival() {
        if (this.survivalSec > 0) {
            this.survivalSec--;
            this.actor.updateSurvivalDisplay(this.survivalSec);
        } else {
            console.log('时间到，执行相关逻辑');
            this.unschedule(this.updateSurvival);
            this.isSurvival = false;
        }
    }

    private randomToRun(dt: number) {
        if(!this.rvoCollider)
            return

        if (this.isDrag) {
            this.curLineSpd.set(0, 0, 0);
            return;
        }

        const isRun = this.actor.stateMgr.currState.id == StateDefine.Run;
        if (isRun) {
            this.runTime += dt;
            if (this.runTime >= this.runInterval) {
                this.runTime = 0;
                this.curLineSpd.set(0, 0, 0);
                this.actor.stateMgr.transit(StateDefine.Idle);
                this.rvoCollider.setMass(999);
                this.randomIdleInterval(); // 生成新的随机 idle 时间
            }
        } else {
            this.idleTime += dt;
            if (this.idleTime >= this.idleInterval) {
                this.idleTime = 0;
                this.randomDirection();
                this.rvoCollider.setMass(1);
                this.randomRunInterval(); // 生成新的随机 run 时间
            }
        }
    }

    private randomRunInterval() {
        this.runInterval = math.randomRange(3, 5); // 生成 3 到 7 秒之间的随机值
    }

    private randomIdleInterval() {
        this.idleInterval = math.randomRange(5, 10); // 生成 3 到 7 秒之间的随机值
    }

    /** 随机移动 */
    public randomDirection() {
        const randPos1 = new Vec3();
        const randPos2 = new Vec3();
        randPos1.x = math.randomRange(this.widthLimit.x, this.widthLimit.y);
        randPos1.y = math.randomRange(this.heightLimit.x, this.heightLimit.y);

        randPos2.x = math.randomRange(this.widthLimit.x, this.widthLimit.y);
        randPos2.y = math.randomRange(this.heightLimit.x, this.heightLimit.y);
        randPos2.subtract(randPos1).normalize();
        this.curLineSpd.set(randPos2).normalize().multiplyScalar(this.moveSpeed);
    }

    /** 初始化碰撞体 */
    private initCollider() {
        tmpP0.set(this.node.position.x, this.node.position.y);

        // RVO碰撞体
        this.rvoCollider = new RvoCollider();
        this.rvoCollider.initCollider(tmpP0, Vec2.ZERO, 999, this.radius);

        // 网格碰撞体
        this.gridCollider = new GridCollider(this);
        this.gridCollider.initCollider(this.node.position, size(this.radius * 2, this.radius * 2), GridGroup.Default);
    }

    /** 重置碰撞体 */
    private resetCollider() {
        this.rvoCollider?.reset();
        this.rvoCollider = null;

        this.gridCollider?.reset();
        this.gridCollider = null;
    }

    /** 更新碰撞体 */
    private updateCollider(dt: number) {
        // 刷新碰撞体
        if (this.rvoCollider) {
            this.rvoCollider.setLineSpd(this.curLineSpd);
            this.rvoCollider.update(dt);

            this.curPos.set(this.rvoCollider.curPos);
            this.node.setPosition(this.curPos);

            // 更新状态(Idle/Run)
            const velocity = this.rvoCollider.getVelocity();
            this.actor.input.set(this.curLineSpd.x, this.curLineSpd.y);
            if (this.actor.input.length() > 0.01) {
                this.actor.stateMgr.transit(StateDefine.Run);
            } else {
                this.actor.stateMgr.transit(StateDefine.Idle);
            }

            // 地图边缘检测
            this.checkCurt += dt;
            if (this.rvoCollider && this.checkCurt >= this.checkCd) {
                this.checkCurt = 0;
                const pos = this.rvoCollider.getRvoPos();
                this.checkBounds(pos);
            }
        }


        // 刷新网格碰撞体
        if (this.gridCollider) {
            this.gridCollider.setPos(this.node.position);
            this.gridCollider.update(dt);

            //---碰撞检测   ->少数类型检测多数 会提高性能，这里只是示范
            //1.粗略获取周围物体
            let res = this.gridCollider.getAroundGridClds();
            let isCld = false;

            // console.log('粗略获取周围物体', JSON.stringify(res));

            //2.精细比较
            // const _cldArr = res[GridGroup.Default];
            // if (_cldArr) {
            //     // console.log('精细比较');
            //     let minDist = this.radius ** 2;
            //     for (let i = 0; i < _cldArr.length; i++) {
            //         const cld = _cldArr[i];
            //         if (tmpP1.set(cld.pos).subtract(this.curPos).lengthSqr() <= minDist) {
            //             isCld = true;
            //             break;
            //         }
            //     }
            // }

            //3.碰撞处理
            // if (isCld) {
            //     // console.log('碰撞了');
            //     this.curLineSpd.set(0, 0, 0);
            // }
        }
    }

    private checkBounds(pos: Vector2) {
        if (pos.x < this.widthLimit.x && this.curLineSpd.x < 0) {
            this.curLineSpd.x *= -1;
        }
        if (pos.x > this.widthLimit.y && this.curLineSpd.x > 0) {
            this.curLineSpd.x *= -1;
        }
        if (pos.y < this.heightLimit.x && this.curLineSpd.y < 0) {
            this.curLineSpd.y *= -1;
        }
        if (pos.y > this.heightLimit.y && this.curLineSpd.y > 0) {
            this.curLineSpd.y *= -1;
        }
    }

    private lateUpdateGridCld(dt: number) {
        this.gridCollider?.lateUpdate(dt);
    }
}