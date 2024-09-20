import { HttpManager } from '../common/network/HttpManager';
import { netConfig } from '../common/network/NetConfig';

export namespace EmailNetService {

    /** 获取邮件列表 */
    export async function getEmailList() {
        const http = new HttpManager();
        http.server = netConfig.Server;
        http.token = netConfig.Token;
        http.timeout = netConfig.Timeout;
        const response = await http.getJson("tgapp/api/user/mail/list");
        if (response.isSucc && response.res.resultCode == "OK") {
            console.warn("获取邮件列表:", response.res);
            return response.res;
        } else {
            console.error("获取邮件列表请求异常", response);
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
            'mailRecordId': mailRecordId
        };

        const response = await http.postJson("tgapp/api/user/mail/read", JSON.stringify(params));
        if (response.isSucc && response.res.resultCode == "OK") {
            console.warn("读取邮件:", response.res);
            return response.res;
        } else {
            console.error("读取邮件请求异常", response);
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
            'mailRecordId': mailRecordId,
            'mailConfigId': mailConfigId
        };

        const response = await http.postJson("tgapp/api/user/mail/receive", JSON.stringify(params));
        if (response.isSucc && response.res.resultCode == "OK") {
            console.warn("领取邮件奖励:", response.res);
            return response.res;
        } else {
            console.error("领取邮件奖励请求异常", response);
            return null;
        }
    }

}
