/*
 * @Date: 2021-08-12 09:33:37
 * @LastEditors: dgflash
 * @LastEditTime: 2023-02-15 09:38:36
 */
import { LayerType, UIConfig } from "../../../../../extensions/oops-plugin-framework/assets/core/gui/layer/LayerManager";


/** 界面唯一标识（方便服务器通过编号数据触发界面打开） */
export enum UIID {
    /** 资源加载界面 */
    Loading = 1,
    /** 提示弹出窗口 */
    Alert,
    /** 确认弹出窗口 */
    Confirm,

    Notify,

    /** DEMO */
    Demo,


    Main,   // 游戏主界面
    User,    // 用户中心
    Map,
    Invite,
    Task,
    Book,   // 图鉴
    Email,  // 邮件
    EmailDetail,    // 邮件详情
    STBShop,    // 星兽商店
    STBMerge,    // 星兽合并商店
    GemShop,    // 宝石商店
    Revive,   // 复活
    DebrisResult,    // 碎片拼图结果

    Hatch,  // 孵化
    RewardView,    // 奖励界面
    HatchShop,    // 孵化次数商店
    HatchReward,    // 孵化奖励

    RankUI,    // 排行榜
}

/** 打开界面方式的配置数据 */
export var UIConfigData: { [key: number]: UIConfig } = {
    [UIID.Loading]: { layer: LayerType.Dialog, prefab: "gui/loading/loading" },
    [UIID.Alert]: { layer: LayerType.Dialog, prefab: "common/prefab/alert" },
    [UIID.Confirm]: { layer: LayerType.Dialog, prefab: "common/prefab/confirm" },
    [UIID.Demo]: { layer: LayerType.UI, prefab: "gui/demo/demo" },

    // 系统弹窗
    [UIID.Notify]: { layer: LayerType.Notify, prefab: "common/prefab/notify" },

    // 游戏主界面
    [UIID.Main]: { layer: LayerType.UI, prefab: "gui/game/prefab/home" },
    [UIID.Map]: { layer: LayerType.Game, prefab: "gui/map/prefab/map" },

    [UIID.Invite]: { layer: LayerType.Dialog, prefab: "gui/invite/prefab/invite" },


    [UIID.User]: { layer: LayerType.Dialog, prefab: "gui/usercenter/prefab/usercenter", mask: true },
    [UIID.Email]: { layer: LayerType.UI, prefab: "gui/email/prefab/emailUI", mask: true },
    [UIID.EmailDetail]: { layer: LayerType.Dialog, prefab: "gui/email/prefab/emailDetailUI", mask: true },
    [UIID.Task]: { layer: LayerType.Dialog, prefab: "gui/task/prefab/task" },
    [UIID.RankUI]: { layer: LayerType.UI, prefab: "gui/rank/prefab/ranklUI", mask: true },
    [UIID.Book]: { layer: LayerType.UI, prefab: "gui/book/prefab/stbReportUI", mask: true },

    [UIID.Revive]: { layer: LayerType.UI, prefab: "gui/debris/prefab/debris", mask: true },
    [UIID.DebrisResult]: { layer: LayerType.Dialog, prefab: "gui/debris/prefab/debrisResult", mask: true },
    [UIID.STBShop]: { layer: LayerType.Dialog, prefab: "gui/shop/prefab/stbShop", mask: true },
    [UIID.GemShop]: { layer: LayerType.Dialog, prefab: "gui/shop/prefab/gemShop", mask: true },
    [UIID.STBMerge]: { layer: LayerType.Dialog, prefab: "gui/shop/prefab/stbMerge", mask: true },

    [UIID.Hatch]: { layer: LayerType.UI, prefab: "gui/hatch/prefab/hatch", mask: true },
    [UIID.RewardView]: { layer: LayerType.Dialog, prefab: "gui/hatch/prefab/rewardPrview", mask: true },
    [UIID.HatchShop]: { layer: LayerType.Dialog, prefab: "gui/hatch/prefab/hatchShop", mask: true },
    [UIID.HatchReward]: { layer: LayerType.Dialog, prefab: "gui/hatch/prefab/hatchReward", mask: true },
}