import { Size, Vec3, size, v3 } from "cc";
import { GridCollider } from "./GridCollider";

const tmpP0 = v3();
const tmpP1 = v3();
const tmpP2 = v3();
const tmpS0 = size();

/**网格碰撞分组 */
export enum GridGroup {
    Default = 0,
    Fish,
    Player,
    Obstacles,
}

/**网格碰撞分组配置- 与GridGroup 数值一致，每个分组只检测配置数组中的分组ID*/
export const GridGroupCfg = {
    //Default
    0: [1, 2, 3],
    //Fish
    1: [2],
    //Player
    2: [1, 3],
    //Obstacles
    3: [1, 2],
}


/** 2D网格碰撞管理器  */
export class GridColliderMgr {
    private static _inst: GridColliderMgr;
    public static get inst() {
        if (!this._inst) {
            this._inst = new GridColliderMgr();
        }
        return this._inst;
    }

    //缩放倍数 只能是整数，默认网格大小为 1x1,
    //尽量设置成所检测物体的大小，提高性能,比如当前鱼的大小为20x20,则设置缩放大小为20
    private gridScale = 20;

    /**根据坐标轴的象限-分别存储坐标对应的碰撞体数据--2d xy
    *  1 | 0
    * ——————
    *  2 | 3
    * 四维数组顺序: 象限-> x -> y ->碰撞体
    * 使用数组方便计算和加快遍历速度
    */
    private _allClds: GridCollider[][][][] = [];

    constructor() {
        //初始化-四个象限的数组
        this._allClds[0] = [];  //右上  
        this._allClds[1] = [];  //左上 
        this._allClds[2] = [];  //左下 
        this._allClds[3] = [];  //右下 
    }

    //#region ----工作流程--
    /**清除所有数据 */
    public clear() {
        for (let i = 0; i < this._allClds.length; i++) {
            this._allClds[i].length = 0;
        }
    }
    /**添加碰撞体 返回 outArr:v3(x,y,象限id)*/
    public addCld(cld: GridCollider, outArr?: Vec3[]) {

        const cw = cld.size.width * 0.5;
        const ch = cld.size.height * 0.5;

        const maxX = this.formatNum(cld.pos.x + cw);
        const minX = this.formatNum(cld.pos.x - cw);
        const maxY = this.formatNum(cld.pos.y + ch);
        const minY = this.formatNum(cld.pos.y - ch);

        let _x, _y, _z, idx = 0;

        for (let x = minX; x <= maxX; x++) {
            for (let y = minY; y <= maxY; y++) {
                //判断象限-> 记录
                if (x >= 0) {
                    //右边
                    if (y >= 0) {
                        //右上 0
                        const arr = this._allClds[0];
                        if (!arr[x]) arr[x] = [];
                        if (!arr[x][y]) arr[x][y] = [];
                        arr[x][y].push(cld);
                        _x = x;
                        _y = y;
                        _z = 0;
                    } else {
                        //右下 3
                        const arr = this._allClds[3];
                        if (!arr[x]) arr[x] = [];
                        if (!arr[x][-y]) arr[x][-y] = [];
                        arr[x][-y].push(cld);
                        _x = x;
                        _y = -y;
                        _z = 3;
                    }
                } else {
                    //左边
                    if (y >= 0) {
                        //左上  1
                        const arr = this._allClds[1];
                        if (!arr[-x]) arr[-x] = [];
                        if (!arr[-x][y]) arr[-x][y] = [];
                        arr[-x][y].push(cld);
                        _x = -x;
                        _y = y;
                        _z = 1;
                    } else {
                        //左下 2
                        const arr = this._allClds[2];
                        if (!arr[-x]) arr[-x] = [];
                        if (!arr[-x][-y]) arr[-x][-y] = [];
                        arr[-x][-y].push(cld);
                        _x = -x;
                        _y = -y;
                        _z = 2;
                    }
                }
                //记录下标
                if (outArr) {
                    if (!outArr[idx]) outArr[idx] = v3();
                    outArr[idx].set(_x, _y, _z);
                    idx++;
                }
            }
        }
    }
    /**移除碰撞体 -少用*/
    public removeCld(cld: GridCollider) {
        const cw = cld.size.width * 0.5;
        const ch = cld.size.height * 0.5;
        //
        const maxX = this.formatNum(cld.pos.x + cw);
        const minX = this.formatNum(cld.pos.x - cw);
        const maxY = this.formatNum(cld.pos.y + ch);
        const minY = this.formatNum(cld.pos.y - ch);

        let cldArr = null;

        for (let x = minX; x <= maxX; x++) {
            for (let y = minY; y <= maxY; y++) {
                cldArr = this.getCldArrByPos(x, y);
                if (cldArr) {
                    const idx = cldArr.indexOf(cld);
                    cldArr[idx] = cldArr[cldArr.length - 1];
                    cldArr.pop();
                }
            }
        }
    }
    /**根据指定的数组ID 删除 ,在已知数组下标情况下,提高效率, idx: v3(x,y,象限id) ，主要方便GridCollider中移除*/
    public removeCldByIdx(idxVec: Vec3, cld: GridCollider) {
        if (this._allClds[idxVec.z] &&
            this._allClds[idxVec.z][idxVec.x] &&
            this._allClds[idxVec.z][idxVec.x][idxVec.y]) {
            const arr = this._allClds[idxVec.z][idxVec.x][idxVec.y];
            const idx = arr.indexOf(cld);
            arr[idx] = arr[arr.length - 1];
            arr.pop();
        }
    }
    //#endregion

    //#endregion ----工具方法--
    //按照指定的尺寸缩放+格式化
    public formatNum(n: number) {
        return Math.round(n / this.gridScale);
    }
    
    /**根据一个(格式化之后的)坐标查找对应的存放数组 */
    public getCldArrByPos(formatX: number, formatY: number): GridCollider[] {
        const x = formatX;
        const y = formatY;
        let cldArr = null;

        if (x >= 0) {
            //右边
            if (y >= 0) {
                //右上 0
                const arr = this._allClds[0];
                cldArr = arr[x] && arr[x][y] || null;
            } else {
                //右下 3
                const arr = this._allClds[3];
                cldArr = arr[x] && arr[x][-y] || null;
            }
        } else {
            //左边
            if (y >= 0) {
                //左上  1
                const arr = this._allClds[1];
                cldArr = arr[-x] && arr[-x][y] || null;
            } else {
                //左下 2
                const arr = this._allClds[2];
                cldArr = arr[-x] && arr[-x][-y] || null;
            }
        }

        return cldArr;
    }
    /**根据指定区域查找对应存放数组 */
    public getCldArrBySize(size: Size, pos: Vec3, groupArr?: number[]): { [groupId: number]: GridCollider[] } {
        const out = {};

        const cw = size.width * 0.5;
        const ch = size.height * 0.5;

        const maxX = this.formatNum(pos.x + cw);
        const minX = this.formatNum(pos.x - cw);
        const maxY = this.formatNum(pos.y + ch);
        const minY = this.formatNum(pos.y - ch);

        let cldArr = null;
        for (let x = minX; x <= maxX; x++) {
            for (let y = minY; y <= maxY; y++) {
                //查找
                cldArr = this.getCldArrByPos(x, y);
                if (cldArr) {
                    for (let i = 0; i < cldArr.length; i++) {
                        const cld: GridCollider = cldArr[i];
                        if (!groupArr || groupArr.indexOf(cld.group) >= 0) {
                            //记录-去重
                            if (!out[cld.group]) out[cld.group] = [];
                            out[cld.group].indexOf(cld) < 0 && out[cld.group].push(cld);

                        }
                    }
                }
            }
        }

        return out;
    }

    //#region 
}

