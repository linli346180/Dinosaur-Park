

interface EmailReward {
    rewardType: number;         // 奖励类型
    rewardSourceId: number;     // 奖励来源ID
    awardType: number;          // 奖励物资类型
    awardResourceId: number;    // 奖励物资ID
    awardQuantity: number;      // 奖励数量
}

interface MailRecord {
    mailRecordId: number;       // 邮件记录ID
    mailTitle: string;          // 邮件标题
    mailContent: string;        // 邮件内容
    expireTime: number;         // 过期时间
    mailTime: number;           // 邮件时间
    readState: number;          // 阅读状态
    awardState: number;         // 奖励状态
    rewards: EmailReward[];          // 奖励列表
}

