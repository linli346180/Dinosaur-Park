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
        if (response.isSucc && response.res.resultCode == NetErrorCode.Success) {
            console.warn("星兽图鉴:", response.res);
            return response.res;
        } else {
            console.error("星兽图鉴请请求异常", response);
            return null;
        }
    }

    /** 获取星兽说明 */
    export async function getStartBeastDesc(stbId: number) {
        const http = new HttpManager();
        http.server = netConfig.Server;
        http.token = netConfig.Token;
        http.timeout = netConfig.Timeout;

        const response = await http.getUrl(`tgapp/api/stb/desc?token=${netConfig.Token}&stbId=${stbId}`);
        if (response.isSucc && response.res.resultCode == NetErrorCode.Success) {
            console.warn(`获取星兽说明:`, response.res);
            return response.res;
        } else {
            console.error(`获取星兽说明异常${http.url}`, response.res);
            return null;
        }
    }
}