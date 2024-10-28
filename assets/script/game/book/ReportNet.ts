import { Logger } from '../../Logger';
import { HttpManager } from '../../net/HttpManager';
import { netConfig } from '../../net/custom/NetConfig';
import { NetErrorCode } from '../../net/custom/NetErrorCode';

export namespace ReportNetService {
    /** 获取星兽图鉴数据 */
    export async function getStartBeastStatData() {
        const http = new HttpManager();
        http.server = netConfig.Server;
        http.token = netConfig.Token;
        http.timeout = netConfig.Timeout;

        const response = await http.getUrl("tgapp/api/user/stb/codex?token=" + netConfig.Token);
        if (response.isSucc) {
            if (response.res.resultCode == NetErrorCode.Success) {
                Logger.logNet("星兽图鉴请:" + JSON.stringify(response.res));
                return response.res;
            }
        } else {
            console.error("星兽图鉴请请求异常", response);
            return null;
        }
    }
}