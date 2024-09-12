import { Vec2 } from "cc";

export enum MapID {
    // 初级地图
    Map1 = 1,
    // 中级地图
    Map2 = 2,
}

export interface IMapConfig {
    /** 地图编号 */
    id: MapID;
    /** 地图名称 */
    path: string;
    /** 地图宽度 */
    width: number;
    /** 锚点 */
    center: number;
    /** 出生点 */
    spawnPoint: { x: number, y: number }[];
}


/** 打开界面方式的配置数据 */
export var MapConfigData: { [key: number]: IMapConfig } = {
    [MapID.Map1]: {
        id: MapID.Map1, path: "Map1", width: 1080, center: 540, spawnPoint: [
            { x: -350, y: 600 }, { x: -100, y: 600 }, { x: 150, y: 600 }, { x: 350, y: 600 },
            { x: -350, y: 400 }, { x: -100, y: 400 }, { x: 150, y: 400 }, { x: 350, y: 400 },
            { x: -350, y: 200 }, { x: -100, y: 200 }, { x: 150, y: 200 }, { x: 350, y: 200 },
        ]
    },
    [MapID.Map2]: {
        id: MapID.Map2, path: "Map2", width: 1080, center: -540, spawnPoint: [
            { x: 350, y: 600 }, { x: 100, y: 600 }, { x: -150, y: 600 },
            { x: 350, y: 300 }, { x: 100, y: 300 }, { x: -150, y: 300 },
            { x: 350, y: 0 }, { x: 100, y: 0 }, { x: -150, y: 0 },]
    },
}