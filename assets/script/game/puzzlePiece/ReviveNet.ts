import { HttpManager } from '../common/network/HttpManager';
import { netConfig } from '../common/network/NetConfig';

export namespace ReviveNetService {

     /** 获取拼图配置 */
     export async function getDebrisConfig() {
        const http = new HttpManager();
        http.server = netConfig.Server;
        http.token = netConfig.Token;
        http.timeout = netConfig.Timeout;
        const response = await http.getJson("tgapp/api/debris");
        if (response.isSucc && response.res.resultCode == "OK") {
            console.warn("获取拼图配置:", response.res.debrisArr);
            return response.res;
        } else {
            console.error("请求异常", response);
            return null;
        }
    }

    /** 获取用户拼图碎片数据 */
    export async function readUserDebrisData() {
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

    /** 拼图碎片合成*/
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
