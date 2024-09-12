import { _decorator, Component, Node } from 'cc';
import { HttpManager } from './HttpManager';
import { netConfig } from './NetConfig';
const { ccclass, property } = _decorator;

@ccclass('NetChannelManager')
export class NetChannelManager {

    async test() {
        const http = new HttpManager();
        http.server = "https://jsonplaceholder.typicode.com/posts";
        http.timeout = netConfig.Timeout;

        const response = await http.postJson("");
        if (response.isSucc) {
            console.log("Fetched Data:", response); // 输出获取的数据
            return response.res;
        } else {
            console.error("Fetch Error:", response); // 捕捉并输出错误
            return null;
        }
    }

    /** 登录账号 */
    async LoginAccount() {
        const http = new HttpManager();
        http.server = netConfig.Server;
        http.timeout = netConfig.Timeout;
        const params = {
            'account': netConfig.Account,
            'password': netConfig.Password
        };
        const response = await http.postJson("tgapp/api/login", JSON.stringify(params));
        if (response.isSucc && response.res.resultCode == "OK") {
            netConfig.Token = response.res.token;
            console.log("登录成功", response.res);
            return response.res;
        } else {
            console.error("登录失败", response);
            return null;
        }
    }

    /** 获取用户货币数据 */
    async getUserCoinData() {
        const http = new HttpManager();
        http.server = netConfig.Server;
        http.token = netConfig.Token;
        http.timeout = netConfig.Timeout;
        const response = await http.getJson("tgapp/api/user/coin");
        if (response.isSucc && response.res.resultCode == "OK") {
            console.warn("请求成功", response.res);
            return response.res;
        } else {
            console.error("请求异常", response);
            return null;
        }
    }

    /** 获取用户星兽数据 */
    async GetUserSTBData() {
        const http = new HttpManager();
        http.server = netConfig.Server;
        http.token = netConfig.Token;
        http.timeout = netConfig.Timeout;

        const response = await http.getJson("tgapp/api/user/stb/data");
        if (response.isSucc && response.res.resultCode == "OK") {
            console.log("请求成功", response.res);
            return response.res;
        } else {
            console.error("请求异常", response);
            return null;
        }
    }

    /** 领养星兽 */
    /**
     * Starts the adoption process for a beast.
     * 
     * @param adopStbID - The ID of the beast to be adopted.
     * @returns The result of the adoption process, or null if there was an error.
     */
    async adopStartBeast(adopStbID: number) {
        const http = new HttpManager();
        http.server = netConfig.Server;
        http.token = netConfig.Token;
        http.timeout = netConfig.Timeout;
        const params = {
            'adopStbID': adopStbID
        };
        const response = await http.postJson("tgapp/api/user/stb/adop", JSON.stringify(params));
        if (response.isSucc && response.res.resultCode == "OK") {
            console.warn("领养星兽", response.res);
            return response.res;
        } else {
            console.error("请求异常", response);
            return null;
        }
    }


    /**
     * 收益星兽合成(10级黄金星兽)
     * 
     * @param firstStbID - 星兽ID1
     * @param twoStbID - 星兽ID2
     * @param isUpProb - 是否使用宝石提升概率
     * @returns 如果请求成功，返回服务器响应，否则返回null
     */
    async mergeGoldSTB(firstStbID: number, twoStbID: number, isUpProb: number) {
        const http = new HttpManager();
        http.server = netConfig.Server;
        http.token = netConfig.Token;
        http.timeout = netConfig.Timeout;
        const params = {
            'userFirstStbID': firstStbID,
            'userTwoStbID': twoStbID,
            'isUpProb': isUpProb
        };
        const response = await http.postJson("tgapp/api/user/stb/synth", JSON.stringify(params));
        if (response.isSucc && response.res.resultCode == "OK") {
            console.warn("合并成功", response.res);
            return response.res;
        } else {
            console.error("合并失败", response);
            return null;
        }
    }

    /** 设置星兽配置 */
    async getStartBeastConfig() {
        const http = new HttpManager();
        http.server = netConfig.Server;
        http.token = netConfig.Token;
        http.timeout = netConfig.Timeout;
        const response = await http.getJson("tgapp/api/stb/cfg/list");
        if (response.isSucc && response.res.resultCode == "OK") {
            console.warn("请求成功", response.res);
            return response.res;

        } else {
            console.error("请求异常", response.res);
            return null;
        }
    }

    /** 无收益星兽位置交换 */
    async swapPosition(firstStbID: number, secondStbID: number) {
        const http = new HttpManager();
        http.server = netConfig.Server;
        http.token = netConfig.Token;
        http.timeout = netConfig.Timeout;
        const params = {
            'userFirstStbID': firstStbID,
            'UserTwoStbID': secondStbID
        };
        const response = await http.postJson("tgapp/api/user/ninstb/adop", JSON.stringify(params));
        if (response.isSucc && response.res.resultCode == "OK") {
            console.warn("位置交换成功", response.res);
            return response.res;
        } else {
            console.error("位置交换失败", response);
            return null;
        }
    }

    /** 获取星兽图鉴数据 */
    async getStartBeastStatData() {
        const http = new HttpManager();
        http.server = netConfig.Server;
        http.token = netConfig.Token;
        http.timeout = netConfig.Timeout;
        const response = await http.getJson("tgapp/api/user/stb/codex");
        if (response.isSucc && response.res.resultCode == "OK") {
            // console.log("星兽图鉴数据:", response.res);
            return response.res;
        } else {
            console.error("请求异常", response);
            return null;
        }
    }

}

export const netChannelManager = new NetChannelManager();

