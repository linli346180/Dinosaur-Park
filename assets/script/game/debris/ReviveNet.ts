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
            return response.res.debrisArr;
        } else {
            console.error("请求异常", response);
            return null;
        }
    }

    /** 获取用户拼图碎片数据 */
    export async function getUserDebrisData() {
        const http = new HttpManager();
        http.server = netConfig.Server;
        http.token = netConfig.Token;
        http.timeout = netConfig.Timeout;
        const response = await http.getJson("tgapp/api/user/debris");
        if (response.isSucc && response.res.resultCode == "OK") {
            console.warn("获取用户拼图碎片数据:", response.res.userDebrisArr);
            return response.res.userDebrisArr;
        } else {
            console.error("请求异常", response);
            return null;
        }
    }

    /** 用户拼图碎片合成*/
    export async function clampDebris(debrisID: number) {
        const http = new HttpManager();
        http.server = netConfig.Server;
        http.token = netConfig.Token;
        http.timeout = netConfig.Timeout;

        const params = {
            'debrisID': debrisID
        };
        const response = await http.postJson("tgapp/api/user/debris/synth", JSON.stringify(params));
        if (response.isSucc) {
            console.warn("用户拼图碎片合成:", response.res);
            return response.res;
        } else {
            console.error("请求异常", response);
            return null;
        }
    }

}
