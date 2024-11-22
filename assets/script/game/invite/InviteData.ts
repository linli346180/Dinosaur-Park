

export interface InviteData {
    inviteeUserName: string;
    avatarUrl: string;
    inviteeUserInviteNum: number;
}

// 邀请奖励配置
export class InviteRewardConfig {
    inveteNum: number = 0;          // 已邀请数量
    rewards: RewardConfig[] = [];   // 奖励配置
}

export interface RewardConfig {
    id: number;         // 奖励ID
    awardType: number;  // 奖励类型
    awardNum: number;   // 奖励数量
    inviteNum: number;  // 邀请数量
    clamed: boolean;    // 是否已领取
}

// 新手引导模拟数据
export let rewardConfigGuide: InviteRewardConfig = {
    inveteNum: 6,
    rewards: [
        { id: 1, awardType: 101, awardNum: 1000, inviteNum: 1, clamed: true },
        { id: 2, awardType: 101, awardNum: 2000, inviteNum: 2, clamed: false },
        { id: 3, awardType: 101, awardNum: 3000, inviteNum: 3, clamed: false },
        { id: 4, awardType: 101, awardNum: 4000, inviteNum: 4, clamed: false },
        { id: 5, awardType: 102, awardNum: 5000, inviteNum: 5, clamed: false },
        { id: 6, awardType: 103, awardNum: 6000, inviteNum: 6, clamed: false },
        { id: 7, awardType: 104, awardNum: 7000, inviteNum: 7, clamed: false }
    ]
};