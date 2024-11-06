

export class EmailListData {
    mailList: MailRecord[] = [];
}

export interface MailRecord {
    mailRecordId: number;       // 邮件记录ID
    mailConfigId: number;       // 邮件配置ID
    mailTitle: string;          // 邮件标题
    mailContent: string;        // 邮件内容
    expireTime: number;         // 过期时间
    mailTime: number;           // 邮件时间
    readState: EmailReadState;          // 阅读状态
    awardState: EmailRewardState;         // 奖励状态
    rewards: EmailReward[];          // 奖励列表
}

export interface EmailReward {
    rewardType: number;         // 奖励类型
    rewardSourceId: number;     // 奖励来源ID
    awardType: number;          // 奖励物资类型
    awardResourceId: number;    // 奖励物资ID
    awardQuantity: number;      // 奖励数量
}

// 邮件读取状态：0-未知，1-未读 2-已读
export enum EmailReadState {
    unknown = 0,
    unread = 1,
    read = 2
}

//奖励领取状态：0-未知, 1-未领取, 2-已领取
export enum EmailRewardState {
    unknown = 0,
    unreceived = 1,
    received = 2
}


export enum EmailEvent {
    receiveEmailReward = 'receiveEmailReward',  // 领取邮件奖励
}
