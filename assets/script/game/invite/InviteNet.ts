import { log } from 'console';
import { Logger } from '../../Logger';
import { HttpManager } from '../../net/HttpManager';
import { netConfig } from '../../net/custom/NetConfig';
import { NetErrorCode } from '../../net/custom/NetErrorCode';

export namespace InviteNetService {

    /** 复制邀请链接 */
    export async function getCopyLink() {
        const http = new HttpManager();
        http.server = netConfig.Server;
        http.token = netConfig.Token;
        http.timeout = netConfig.Timeout;

        const response = await http.getUrl("tgapp/api/user/invite/copyLink?token=" + netConfig.Token);
        if (response.isSucc && response.res.resultCode == NetErrorCode.Success) {
            console.warn("邀请链接:", response.res);
            return response.res;
        } else {
            console.error("邀请链接请求异常", response);
            return null;
        }
    }

    /** 查询邀请奖励配置 */
    export async function getInviteRewardConfig() {
        const http = new HttpManager();
        http.server = netConfig.Server;
        http.token = netConfig.Token;
        http.timeout = netConfig.Timeout;

        const response = await http.getUrl("tgapp/api/user/invite/getRewardConfig?token=" + netConfig.Token);
        if (response.isSucc && response.res.resultCode == NetErrorCode.Success) {
            console.warn("邀请奖励:", JSON.stringify(response.res));
            return response.res;
        } else {
            console.error("邀请奖励请求异常", response);
            return null;
        }
    }

    /** 查询邀请名单 */
    export async function getInviteList() {
        const http = new HttpManager();
        http.server = netConfig.Server;
        http.token = netConfig.Token;
        http.timeout = netConfig.Timeout;

        const response = await http.getUrl("tgapp/api/presell/getUserInviteDetail?token=" + netConfig.Token);
        if (response.isSucc && response.res.resultCode == NetErrorCode.Success) {
            console.warn("邀请名单:", response.res);
            return response.res;
        } else {
            console.error("邀请名单请求异常", response);
            return null;
        }
    }

    /** 获取邀请奖励配置 */
    export async function getInviteReward() {
        const http = new HttpManager();
        http.server = netConfig.Server;
        http.token = netConfig.Token;
        http.timeout = netConfig.Timeout;

        const response = await http.getUrl(`tgapp/api/user/invite/searchInviteTaskList?token=${netConfig.Token}`);
        if (response.isSucc && response.res.resultCode == NetErrorCode.Success && response.res.inviteInfo) {
            console.warn("获取邀请奖励配置:",  JSON.stringify(response.res));
            return response.res;
        } else {
            console.error("获取邀请奖励配置异常", response);
            return null;
        }
        // return rewardConfigDemo;
    }

    /** 领取邀请任务奖励 */
    export async function clampInviteReward(id: number) {
        const http = new HttpManager();
        http.server = netConfig.Server;
        http.token = netConfig.Token;
        http.timeout = netConfig.Timeout;

        const response = await http.getUrl(`tgapp/api/user/invite/receiveInviteReward?token=${netConfig.Token}&inviteCompleteId=${id}`);
        if (response.isSucc && response.res.resultCode == NetErrorCode.Success) {
            console.warn("领取邀请任务奖励:", response.res);
            return response.res;
        } else {
            console.error("领取邀请任务奖励异常", response);
            return null;
        }
    }
}