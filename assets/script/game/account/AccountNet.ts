import { HttpManager } from '../common/network/HttpManager';
import { netConfig } from '../common/network/NetConfig';

export namespace AccountNetService {

    /** 获取用户货币数据 */
    export async function getUserCoinData() {
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
    export async function GetUserSTBData() {
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
    export async function adopStartBeast(adopStbID: number) {
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

    /** 无收益星兽合成(1-9级黄金星兽) */
    export async function mergeGoldNinSTB(userFirstStbID: number, UserTwoStbID: number) {
        const http = new HttpManager();
        http.server = netConfig.Server;
        http.token = netConfig.Token;
        http.timeout = netConfig.Timeout;
        const params = {
            'userFirstStbID': userFirstStbID,
            'userTwoStbID': UserTwoStbID
        };
        const response = await http.postJson("tgapp/api/user/ninstb/synth", JSON.stringify(params));
        if (response.isSucc && response.res.resultCode == "OK") {
            console.warn("无收益星兽合成", response.res);
            return response.res;
        } else {
            console.error("请求异常", response);
            return null;
        }
    }

    /** 收益星兽合成(10级黄金星兽) */
    export async function mergeGoldSTB(firstStbID: number, twoStbID: number, isUpProb: number) {
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
            console.warn("收益星兽合成", response.res);
            return response.res;
        } else {
            console.error("合并失败", response);
            return null;
        }
    }

    /** 设置星兽配置 */
    export async function getStartBeastConfig() {
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
    /** 无收益星兽位置交换 */
    export async function swapPosition(stbID: number, slotId: number): Promise<boolean> {
        try {
            const http = new HttpManager();
            http.server = netConfig.Server;
            http.token = netConfig.Token;
            http.timeout = netConfig.Timeout;

            const params = {
                "swapUserStbID": stbID,
                "position": slotId
            };
            const response = await http.postJson("tgapp/api/user/ninstb/swap", JSON.stringify(params));
            if (response.isSucc && response.res.resultCode === "OK") {
                console.warn("位置交换成功", response.res);
                return true;
            } else {
                console.error("位置交换失败", response);
                return false;
            }
        } catch (error) {
            console.error("请求异常", error);
            return false;
        }
    }

    /** 获取星兽图鉴数据 */
    export async function getStartBeastStatData() {
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