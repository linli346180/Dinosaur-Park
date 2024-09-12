import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

// 定义拼图ID
export enum PuzzleID {
    // 初级矿石龙
    Primary = 1,
    // 中级矿石龙
    Intermediate = 2,
}

// 定义拼图碎片接口
export interface IPuzzlePiece {
    level: string; // 等级
    name: string; // 名称
    quantity: number; // 拼图数量
    imagePath: string; // 图片目录
}

// 定义拼图碎片数据
export var PuzzlePieceData: { [key: number]: IPuzzlePiece } = {
    [PuzzleID.Primary]: {
        level: "Primary",
        name: "初级矿石龙",
        quantity: 10,
        imagePath: "gui/revive/texture/level_1"
    },
    [PuzzleID.Intermediate]: {
        level: "Intermediate",
        name: "中级矿石龙",
        quantity: 15,
        imagePath: "gui/revive/texture/level_2"
    },
}

interface DebrisDetail {
    id: number;
    createdAt: string;
    updatedAt: string;
    name: string;
    debrisID: number;
    pictureUrl: string;
    position: number;
}

//星兽碎片配置
interface Debris {
    id: number;
    createdAt: string;
    updatedAt: string;
    name: string;
    stbConfigID: number;
    subDebrisNum: number;
    pictureUrl: string;
    debrisDetailsArr: DebrisDetail[];
}
