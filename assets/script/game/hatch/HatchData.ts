import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

/** 用户孵蛋信息 */
export class UserHatchData {
    guaranteedNum : number = 0; // 孵蛋保底次数
    remainNum : number = 0; // 剩余孵蛋次数
    hatchNum: number = 0; // 已经孵蛋次数

    constructor() {
        this.guaranteedNum = 100;
        this.remainNum = 0;
        this.hatchNum = 0;
    }
}


