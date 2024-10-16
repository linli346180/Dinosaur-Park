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
            console.log("获取星兽图鉴请求成功", response.res);
            return response.res;
        } else {
            console.error("获取星兽图鉴请求异常", response);
            return null;
        }
    }
}