import { STBID, StbKind } from "./STBDefine";


export interface ISTBConfigData {
    perfab: string; // 预制体
    mapID: number; // 地图
}

export var STBConfigData: { [key: number]: ISTBConfigData } = {
    [STBID.STB_Gold_Level10]: { perfab: "prefabs/STB_Gold", mapID: 1 },
    [STBID.STB_Super_Level1]: { perfab: "prefabs/STB_Super_Level1", mapID: 2 },
    [STBID.STB_Super_Level2]: { perfab: "prefabs/STB_Super_Level2", mapID: 2 },
    [STBID.STB_Super_Level3]: { perfab: "prefabs/STB_Super_Level3", mapID: 2 },
    [STBID.STB_Gem]: { perfab: "prefabs/STB_Gem", mapID: 2 },
    [STBID.STB_Diamond]: { perfab: "prefabs/STB_Diamond", mapID: 2 },
}
