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
    Wait,
    Main,           // 游戏主界面
    User,           // 用户中心
    Map,            // 地图
    Invite,         // 邀请
    Task,           // 任务
    Book,           // 图鉴
    Email,          // 邮件
    EmailDetail,    // 邮件详情
    STBShop,        // 星兽商店
    STBMerge,       // 星兽合并商店

    Revive,         // 复活
    DebrisResult,   // 碎片拼图结果
    Hatch,          // 孵化
    RewardView,     // 奖励界面
    HatchShop,      // 孵化次数商店
    HatchReward,    // 孵化奖励
    RankUI,         // 排行榜
    LanguageUI,     // 多语言设置
    Activity,       // USDT活动
    Guide,          // 新手引导
    GuideReward,    // 新手引导
    Wallet,         // 钱包
    EmailVerify,    // 邮箱验证
    WalletDetail,   // 钱包详情
    STBDetail,      // 星兽详情

    GemShop,        // 宝石商店
    WalletPaySelect, // 钱包支付选择
}

/** 打开界面方式的配置数据 */
export var UIConfigData: { [key: number]: UIConfig } = {
    [UIID.Loading]: { layer: LayerType.Dialog, prefab: "gui/loading/loading" },
    [UIID.Alert]: { layer: LayerType.System, prefab: "common/prefab/alert", mask: true },
    [UIID.Confirm]: { layer: LayerType.Dialog, prefab: "common/prefab/confirm" },
    [UIID.Notify]: { layer: LayerType.Notify, prefab: "common/prefab/notify" },
    [UIID.Wait]: { layer: LayerType.Notify, prefab: "common/prefab/wait" },

    // 游戏主界面
    [UIID.Map]: { layer: LayerType.Game, prefab: "gui/map/prefab/map" },
    [UIID.Main]: { layer: LayerType.UI, prefab: "gui/game/prefab/home" },
    [UIID.Email]: { layer: LayerType.UI, prefab: "gui/email/prefab/emailUI", mask: true },
    [UIID.RankUI]: { layer: LayerType.UI, prefab: "gui/rank/prefab/ranklUI", mask: true },
    [UIID.Revive]: { layer: LayerType.UI, prefab: "gui/debris/prefab/debrisUI", mask: true },
    [UIID.Hatch]: { layer: LayerType.UI, prefab: "gui/hatch/prefab/hatch", mask: true },
    [UIID.Activity]: { layer: LayerType.UI, prefab: "gui/activity/activityUI", mask: true },

    [UIID.Wallet]: { layer: LayerType.UI, prefab: "gui/wallet/walletUI", mask: true },
    [UIID.WalletDetail]: { layer: LayerType.UI, prefab: "gui/wallet/walletDetailUI", mask: true },

    [UIID.Guide]: { layer: LayerType.PopUp, prefab: "gui/guide/guideUI", mask: true },
    [UIID.Book]: { layer: LayerType.PopUp, prefab: "gui/book/prefab/stbReportUI", mask: true, vacancy: true },
    [UIID.STBDetail]: { layer: LayerType.Dialog, prefab: "gui/book/prefab/stbDetail", mask: true, vacancy: true },

    [UIID.Task]: { layer: LayerType.UI, prefab: "gui/task/prefab/task" },
    [UIID.Invite]: { layer: LayerType.UI, prefab: "gui/invite/prefab/invite" },
    [UIID.User]: { layer: LayerType.PopUp, prefab: "gui/setting/usercenter", mask: true },
    [UIID.DebrisResult]: { layer: LayerType.PopUp, prefab: "gui/debris/prefab/debrisResult", mask: true },
    [UIID.STBShop]: { layer: LayerType.PopUp, prefab: "gui/shop/prefab/STBShop", mask: true },
    
    [UIID.GemShop]: { layer: LayerType.PopUp, prefab: "gui/wallet/gemShop", mask: true },
    [UIID.WalletPaySelect]: { layer: LayerType.PopUp, prefab: "gui/wallet/prefab/walletPaySelect", mask: true},

    [UIID.STBMerge]: { layer: LayerType.Dialog, prefab: "gui/shop/prefab/STBMergeUI", mask: true },
    [UIID.RewardView]: { layer: LayerType.Dialog, prefab: "gui/hatch/prefab/rewardPrview", mask: true },
    [UIID.HatchShop]: { layer: LayerType.Dialog, prefab: "gui/hatch/prefab/hatchShop", mask: true, vacancy: true },
    [UIID.HatchReward]: { layer: LayerType.Dialog, prefab: "gui/hatch/prefab/hatchReward", mask: true },
    [UIID.EmailDetail]: { layer: LayerType.Dialog, prefab: "gui/email/prefab/emailDetailUI", mask: true },

    [UIID.EmailVerify]: { layer: LayerType.System, prefab: "gui/setting/emailVerify", mask: true },
    [UIID.GuideReward]: { layer: LayerType.System, prefab: "gui/guide/guideReward", mask: true },
    [UIID.LanguageUI]: { layer: LayerType.System, prefab: "gui/setting/languageView", mask: true, vacancy: true },
}