import { HttpManager, ResultCode } from '../common/network/HttpManager';
import { netConfig } from '../common/network/NetConfig';

export namespace InviteNetService {

    /** 复制邀请链接 */
    export async function getCopyLink() {
        const http = new HttpManager();
        http.server = netConfig.Server;
        http.token = netConfig.Token;
        http.timeout = netConfig.Timeout;

        const response = await http.getUrl("tgapp/api/user/invite/copyLink?token=" + netConfig.Token);
        if (response.isSucc && response.res.resultCode == ResultCode.OK) {
            console.warn("复制邀请链接:", response.res);
            return response.res;
        } else {
            console.error("复制邀请链接请求异常", response);
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
        if (response.isSucc && response.res.resultCode == ResultCode.OK) {
            console.warn("查询邀请奖励配置:", response.res);
            return response.res;
        } else {
            console.error("查询邀请奖励配置请求异常", response);
            return null;
        }
    }

    /** 查询邀请名单 */
    export async function getInviteList() {
        const http = new HttpManager();
        http.server = netConfig.Server;
        http.token = netConfig.Token;
        http.timeout = netConfig.Timeout;

        const response = await http.getUrl("tgapp/api/user/invite/inviteList?pageSize=100&page=1&token=" + netConfig.Token);
        if (response.isSucc && response.res.resultCode == ResultCode.OK) {
            console.warn("查询邀请名单:", response.res);
            return response.res;
        } else {
            console.error("查询邀请名单请求异常", response);
            return null;
        }
    }
}