
/** 服务器状态码 */
export enum NetErrorCode {
    Success            = 200,  // 请求成功
    NotLoggedIn        = 1000, // 未登录
    ParameterIllegal   = 1001, // 参数不合法
    UnauthorizedUserID = 1002, // 非法的用户ID
    Unauthorized       = 1003, // 未授权
    ServerError        = 1004, // 系统错误
    NotData            = 1005, // 没有数据
    ModelAddError      = 1006, // 添加错误
    ModelDeleteError   = 1007, // 删除错误
    OperationFailure   = 1009, // 操作失败
    DataError          = 1011, // 数据错误
}

export enum NetCmd {
    UserCoinType   = 100, // 用户货币
    UserNinstbType = 101, // 无收益星兽
    UserIncomeType = 102, // 收益星兽
    UserHatchType  = 103, // 孵蛋
    InvitedType    = 104, // 邀请
    UserDebrisType = 105, // 复活
    UserEmailType  = 106, // 邮箱
    UserTaskType   = 107, // 任务
    RankingType    = 108, // 排行
    WithDrawalType = 109, // 提现
    StbGurideType  = 110, // 星兽图鉴
    HeartBeatType  = 150, // 心跳
}