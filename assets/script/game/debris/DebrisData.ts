import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;


export interface UserDebris {
    id: number;
    debrisID: number;  //拼图主表ID
    debrisDetailsID: number; //拼图子表ID
    debrisNum: number; //拼图数量
}

// 定义拼图ID
export enum PuzzleID {
    // 初级矿石龙
    Primary = 1,
    // 中级矿石龙
    Intermediate = 2,
}

/** 星兽碎片配置 */
export interface DebrisConfig {
    id: number;                             // 主拼图ID
    name: string;                           // 拼图名称
    stbConfigID: number;                    // 星兽配置ID
    subDebrisNum: number;                   // 子拼图数量
    pictureUrl: string;                     // 拼图图片链接
    debrisDetailsArr: DebrisDetail[];
}

export interface DebrisDetail {
    id: number;                             //子拼图ID
    name: string;                           //子拼图名称
    debrisID: number;                       //主拼图ID
    pictureUrl: string;                     //子拼图图片链接
    position: number;                       //拼图位置
}

