
// 定义进化数据接口
export interface EvolutionData {
    stbId: number;                      // 星兽id
    evolutionTotal: number;             // 当前区间进化总进度
    currentProgress: number;            // 当前区间进化进度
    userTotal: number;                  // 用户进化总数
    evolutionExtents: EvolutionExtent[]; // 进化配置信息
}

// 定义进化区间接口
export interface EvolutionExtent {
    minNumber: number;                  // 最小区间
    maxNumber: number;                  // 最大区间
    evolutionResources: EvolutionResource[]; // 进化所需消耗的物资配置
}

// 定义进化资源接口
export interface EvolutionResource {
    resourceType: number;       // 物资类型：1-金币 2-星兽 3-碎片
    resourceId: number;         // 物资id
    basicQuantity: number;      // 物资基础数量
    proportion: number;         // 每次进化物资提升比例
    userQuantity: number;       // 用户当前物资剩余数量
}

// 定义资源区间接口
export class ResourceData {
    stbResource: number = 0;        // 星兽资源
    coinResource: number = 0;       // 金币资源
}

export interface EvolutionResponse {
    isCreate: boolean;                 // 是否进化成功
    currentProgress: number;           // 进化成功之后的进度
    userTotal: number;                 // 进化成功之后用户的总进化次数
    evolutionResources: EvolutionResource[]; // 星兽当前进化消耗的资源结构体
}


