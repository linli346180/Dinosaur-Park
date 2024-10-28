import { Size, Vec3, size, v3 } from "cc";
import { GridColliderMgr, GridGroup, GridGroupCfg } from "./GridColliderMgr";

//
export class GridCollider {
    private static GRID_CLD_ID = 0;
    public cldID = 0;       // 碰撞体ID
    public pos = v3();      // 坐标
    public group: GridGroup = GridGroup.Default;    // 当前分组
    public target: any;    // 目标对象

    /**记录上一帧碰撞数组的下标位置 v3(x,y,象限id)*/
    private _curIdxArr: Vec3[] = [];
    private _isDirty = true;

    constructor(target?: any) {
        this.target = target;
        this.cldID = GridCollider.GRID_CLD_ID++;
    }

    public initCollider(pos: Vec3, size: Size, group: GridGroup) {
        this.pos.set(pos);
        this.size.set(size);
        this.group = group;
        this._isDirty = true;
        this.recordToCldMgr();
    }

    public reset() {
        GridColliderMgr.inst.removeCld(this);
    }

    public update(dt: number) {

    }

    public lateUpdate(dt: number) {
        this.recordToCldMgr();
    }

    public setPos(p: Vec3) {
        if (p.x != this.pos.x ||
            p.y != this.pos.y ||
            p.z != this.pos.z) {
            this.pos.set(p);
            this._isDirty = true;
        }
    }

    /**碰撞盒大小-2d */
    public size = size();
    public setSize(s: Size) {
        if (s.width != this.size.width ||
            s.height != this.size.height) {
            this.size.set(s);
            this._isDirty = true;
        }
    }

    //记录到管理器
    private recordToCldMgr() {
        if (!this._isDirty) return;
        this._isDirty = false;

        //清除上一帧数据
        for (let i = 0; i < this._curIdxArr.length; i++) {
            const vec = this._curIdxArr[i];
            GridColliderMgr.inst.removeCldByIdx(vec, this);
        }

        //记录当前数据
        GridColliderMgr.inst.addCld(this, this._curIdxArr);
    }

    /**粗略获取当前碰撞体周围物体 按照分组获取*/
    public getAroundGridClds() {
        return GridColliderMgr.inst.getCldArrBySize(this.size, this.pos, GridGroupCfg[this.group]);
    }
}

