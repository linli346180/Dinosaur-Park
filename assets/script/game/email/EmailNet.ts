import { HttpManager} from '../../net/HttpManager';
import { netConfig } from '../../net/custom/NetConfig';
import { NetErrorCode } from '../../net/custom/NetErrorCode';

export namespace EmailNetService {
    /** 获取邮件列表 */
    export async function getEmailList() {
        const http = new HttpManager();
        http.server = netConfig.Server;
        http.token = netConfig.Token;
        http.timeout = netConfig.Timeout;

        const response = await http.getUrl("tgapp/api/user/mail/list?token=" + netConfig.Token);
        if (response.isSucc && response.res.resultCode == NetErrorCode.Success) {
            console.warn("获取邮件列表:", response.res);
            return response.res;
        } else {
            console.error("邮件列表请求异常", response);
            return null;
        }
    }

    /** 读取邮件 */
    export async function readEmail(mailRecordId: number) {
        const http = new HttpManager();
        http.server = netConfig.Server;
        http.token = netConfig.Token;
        http.timeout = netConfig.Timeout;

        const params = {
            'mailRecordId': mailRecordId.toString()
        };
        const newParams = new URLSearchParams(params).toString();
        const response = await http.postUrl("tgapp/api/user/mail/read?token=" + netConfig.Token, newParams);
        if (response.isSucc && response.res.resultCode == NetErrorCode.Success) {
            console.warn("读取邮件:", response.res);
            return response.res;
        } else {
            console.error("读取邮件请求异常"+ mailRecordId, response);
            return null;
        }
    }

    /** 领取邮件奖励 */
    export async function clampEmail(mailRecordId: number, mailConfigId: number) {
        const http = new HttpManager();
        http.server = netConfig.Server;
        http.token = netConfig.Token;
        http.timeout = netConfig.Timeout;

        const params = {
            'mailRecordId': mailRecordId.toString(),
            'mailConfigId': mailConfigId.toString()
        };
        const newParams = new URLSearchParams(params).toString();
        const response = await http.postUrl("tgapp/api/user/mail/receive?token=" + netConfig.Token, newParams);
        if (response.isSucc && response.res.resultCode == NetErrorCode.Success) {
            console.warn("领取邮件奖励:", response.res);
            return response.res;
        } else {
            console.error("领取邮件奖励请求异常", response);
            return null;
        }
    }

}
