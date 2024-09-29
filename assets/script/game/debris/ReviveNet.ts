import { HttpManager, ResultCode } from '../common/network/HttpManager';
import { netConfig } from '../common/network/NetConfig';

export namespace ReviveNetService {

    /** 获取拼图配置 */
    export async function getDebrisConfig() {
        const http = new HttpManager();
        http.server = netConfig.Server;
        http.token = netConfig.Token;
        http.timeout = netConfig.Timeout;

        const response = await http.getUrl("tgapp/api/debris?token=" + netConfig.Token);
        if (response.isSucc && response.res.resultCode == ResultCode.OK) {
            console.warn("获取拼图配置请求成功:", response.res);
            return response.res.debrisArr;
        } else {
            console.error("获取拼图配置请求异常", response);
            return null;
        }
    }

    /** 获取用户拼图碎片数据 */
    export async function getUserDebrisData() {
        const http = new HttpManager();
        http.server = netConfig.Server;
        http.token = netConfig.Token;
        http.timeout = netConfig.Timeout;

        const response = await http.getUrl("tgapp/api/user/debris?token=" + netConfig.Token);
        if (response.isSucc && response.res.resultCode == ResultCode.OK) {
            console.warn("获取用户拼图碎片数据:", response.res);
            return response.res.userDebrisArr;
        } else {
            console.error("获取用户拼图碎片数据请求异常", response);
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
            'debrisID': debrisID.toString()
        };
        const newParams = new URLSearchParams(params).toString();
        const response = await http.postUrl("tgapp/api/user/debris/synth?token=" + netConfig.Token, newParams);
        if (response.isSucc && response.res.resultCode == ResultCode.OK) {
            console.warn("拼图碎片合成:", response.res);
            return response.res;
        } else {
            console.error("拼图碎片合成", response);
            return response.res;
        }
    }

}
