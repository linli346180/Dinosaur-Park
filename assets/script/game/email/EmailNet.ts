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
            console.warn("获取邮件列表:", response.res.mailList);
            return response.res;
        } else {
            console.error("请求异常", response);
            return null;
        }
    }

    /** 读取邮件 */
    export async function readEmail() {
        const http = new HttpManager();
        http.server = netConfig.Server;
        http.token = netConfig.Token;
        http.timeout = netConfig.Timeout;
        const response = await http.getJson("tgapp/api/user/mail/read");
        if (response.isSucc && response.res.resultCode == "OK") {
            console.warn("读取邮件:", response.res.mailList);
            return response.res;
        } else {
            console.error("请求异常", response);
            return null;
        }
    }

    /** 领取邮件奖励 */
    export async function clampEmain() {
        const http = new HttpManager();
        http.server = netConfig.Server;
        http.token = netConfig.Token;
        http.timeout = netConfig.Timeout;

        const response = await http.getJson("tgapp/api/user/mail/receive");
        if (response.isSucc && response.res.resultCode == "OK") {
            console.warn("领取邮件奖励:", response.res.mailList);
            return response.res;
        } else {
            console.error("请求异常", response);
            return null;
        }
    }

}
