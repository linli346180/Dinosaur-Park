import { HttpManager } from '../common/network/HttpManager';
import { netConfig } from '../common/network/NetConfig';

export namespace ReportNetService { 
    
    /** 获取星兽图鉴数据 */
    export async function  getStartBeastStatData() {
        const http = new HttpManager();
        http.server = netConfig.Server;
        http.token = netConfig.Token;
        http.timeout = netConfig.Timeout;
        const response = await http.getJson("tgapp/api/user/stb/codex");
        if (response.isSucc && response.res.resultCode == "OK") {
            console.log("获取星兽图鉴数据", response.res);
            return response.res;
        } else {
            console.error("请求异常", response);
            return null;
        }
    }
}