

export interface InviteData {
    inviteeUserName: string;
    avatarUrl: string;
    inviteeUserInviteNum: number;
}

// 邀请奖励配置
export class InviteRewardConfig {
    inviteExplain: string = '';     // 邀请说明
    rewards: RewardConfig[] = [];   // 奖励配置
}

export interface RewardConfig {
    awardType: number;
    awardResourceId: number;
    awardResourceName: string
    awardQuantity: number;
}