import { Vec2, v2 } from "cc";
import { RVOMath, Vector2 } from "./Common";
import { Simulator } from "./Simulator";
import { RvoCollider } from "./RvoCollider";

const tmpV1 = v2();
const tmpV2 = v2();

/**RVO 管理器 */
export class RvoMgr {
    // 在寻找周围邻居的搜索距离，这个值设置过大，会让小球在很远距离时做出避障行为,
    // 应该以最大碰撞体的半径作为参考 不然无法检测到超出这个距离的物体
    public static neighborDist = 6;
    // 寻找周围邻居的最大数目，这个值设置越大，最终计算的速度越精确，但会增大计算量, 所有物体的半径都相同的情况下 可设置为1 减少计算量,
    //  不同半径的物体 需设置>1 否则检测不正确
    public static maxNeighbors = 1;
    // 代表计算动态的物体时的时间窗口
    public static timeHorizon = 1;
    // 代表计算静态的物体时的时间窗口，比如在RTS游戏中，小兵向城墙移动时，没必要做出避障，这个值需要设置得很小
    public static timeHorizonObst = 0.1;
    // 代表计算ORCA时的小球的半径，这个值不一定与小球实际显示的半径一样，偏小有利于小球移动顺畅
    public static radius = 10;
    // 小球最大速度值
    public static maxSpeed = 10;
    // 小球初始速度
    public static initVec = v2(0, 0);

    public static simulator = Simulator.instance;
    //存储所有代理对象速度:idx=aid
    public static allAgentVec: { [aid: number]: Vector2 } = {};

    //设置RVO更新频率-提高性能，坐标使用插值之后 依然可以平滑的移动
    public static updateCd = 0.033;
    public static rvoCurt = 0;

    /**初始化模拟器 */
    public static initSimulator() {
        this.rvoCurt = this.updateCd;
        this.simulator.setAgentDefaults(
            this.neighborDist, this.maxNeighbors,
            this.timeHorizon, this.timeHorizonObst,
            this.radius, this.maxSpeed, new Vector2(0, 0));
    }

    /**
     * 创建代理
     * @param cld - RVO碰撞体
     * @param pos - 坐标
     * @param vec - 速度
     * @param mass - 质量
     * @param radius - 代理半径
     * @returns 代理id
     */
    public static createAgent(cld: RvoCollider, pos: Vec2, vec: Vec2, mass: number, radius = this.radius): number {
        let p = new Vector2(pos.x, pos.y);
        let aid = this.simulator.addAgent(p);
        this.simulator.setAgentMass(aid, mass);
        this.simulator.setAgentRadius(aid, radius);
        this.allAgentVec[aid] = new Vector2(vec.x, vec.y);
        return aid;
    }

    /**移除指定代理坐标*/
    public static removeAgent(aid: number) {
        if (!!this.allAgentVec[aid]) {
            this.simulator.removeAgent(aid);
            delete this.allAgentVec[aid];
        }
    }

    /**更新模拟器 */
    public static update(dt: number) {
        //更新速度
        this.rvoCurt += dt;
        if (this.rvoCurt >= this.updateCd) {
            this.rvoCurt = 0;
            this.setPreferredVelocities(this.updateCd);
        }
    }

    /** 重置 */
    public static reset() {
        this.allAgentVec = {};
        this.simulator.clear();
    }

    static tmpZero: Vector2 = new Vector2(0.0, 0.0);
    static tmpVec1: Vector2 = new Vector2();
    static tmpVec2: Vector2 = new Vector2();

    /**​函数根据代理的目标位置计算出最优速度，并设置智能体的优选速度。 */
    private static setPreferredVelocities(dt: number) {
        let angle, dist;
        for (let i = 0; i < this.simulator.agentIdLst.length; i++) {
            const aid = this.simulator.agentIdLst[i];
            const v = this.allAgentVec[aid];
            tmpV1.set(v.x, v.y);
            if (tmpV1.lengthSqr() < RVOMath.RVO_EPSILON) {
                this.simulator.setAgentPrefVelocity(aid, this.tmpZero);
            } else {
                this.simulator.setAgentPrefVelocity(aid, this.tmpVec1.set(tmpV1.x, tmpV1.y));

                angle = Math.random() * 2.0 * Math.PI;
                dist = Math.random() * 0.0001;

                this.tmpVec2.setVec(this.simulator.getAgentPrefVelocity(aid));
                this.tmpVec2.x += Math.cos(angle) * dist;
                this.tmpVec2.y += Math.sin(angle) * dist;

                this.simulator.setAgentPrefVelocity(aid, this.tmpVec2);
            }
        }
        this.simulator.run(dt);
    }
}

