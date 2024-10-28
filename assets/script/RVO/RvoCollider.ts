import { _decorator, clamp01, v3, Vec2, Vec3 } from "cc";
import { RvoMgr } from "./RvoMgr";
import { Vector2 } from "./Common";
const { ccclass, property } = _decorator;

/** 
 * RVO碰撞体
 */
@ccclass('RvoCollider')
export class RvoCollider {
    public curPos = v3();   // 当前坐标
    private lineSpd = v3(); // 线速度
    private aid: number;    // 代理id

    public initCollider(pos: Vec2, vec: Vec2, mass: number, radius?: number) {
        this.curPos.set(pos.x, pos.y);
        this.aid = RvoMgr.createAgent(this, pos, vec, mass, radius);
    }

    public reset() {
        RvoMgr.removeAgent(this.aid);
    }

    public setRadius(r: number) {
        RvoMgr.simulator.setAgentRadius(this.aid, r);
    }

    update(dt: number) {
        this.updateLineSpd();
        this.updatePosition(dt);
    }

    public setMass(m: number) {
        RvoMgr.simulator.setAgentMass(this.aid, m);
    }

    public getVelocity(): Vector2 {
        return RvoMgr.simulator.getAgentPrefVelocity(this.aid);
    }

    //设置位置2d xy
    public setPosition(p: Vec3) {
        this.curPos.set(p);
        const agent = RvoMgr.simulator.getAgentByAid(this.aid);
        agent && agent.position_.set(p.x, p.y);
    }

    //设置线速度2d xy
    public setLineSpd(v: Vec3) {
        this.lineSpd.set(v);
        const vec = RvoMgr.allAgentVec[this.aid];
        vec && vec.set(this.lineSpd.x, this.lineSpd.y);
    }

    //RVO内部当前坐标 2d
    getRvoPos() {
        return RvoMgr.simulator.getAgentPosition(this.aid);
    }

    //从rvo获取位置2d
    lerpSpd = 0.1;
    private updatePosition(dt: number) {
        const p = RvoMgr.simulator.getAgentPosition(this.aid);
        if (p && this.curPos) {
            //使用插值获取rvo坐标 
            let _lerpSpd = clamp01(this.lerpSpd * (dt / 0.016));
            this.curPos.x += (p.x - this.curPos.x) * _lerpSpd;
            this.curPos.y += (p.y - this.curPos.y) * _lerpSpd;
        }
    }

    //同步速度到RVO 2d
    private updateLineSpd() {
        RvoMgr.allAgentVec[this.aid].set(this.lineSpd.x, this.lineSpd.y);
    }
}

