import { HttpManager } from '../common/network/HttpManager';
import { netConfig } from '../common/network/NetConfig';


export namespace HatchNetService {

    /** 获取孵蛋保底次数 */
    export async function getHatchMinNum() {
        const http = new HttpManager();
        http.server = netConfig.Server;
        http.token = netConfig.Token;
        http.timeout = netConfig.Timeout;
        const response = await http.getJson("tgapp/api/hatch/min/num");
        if (response.isSucc && response.res.resultCode == "OK") {
            console.warn("获取孵蛋保底次数:", response.res.hatchGuaranteedNum);
            return response.res.hatchGuaranteedNum;
        } else {
            console.error("请求异常", response);
            return null;
        }
    }

    /** 获取用户孵化次数 */
    export async function getUserHatchNum() {
        const http = new HttpManager();
        http.server = netConfig.Server;
        http.token = netConfig.Token;
        http.timeout = netConfig.Timeout;
        const response = await http.getJson("tgapp/api/user/hatch/num");
        if (response.isSucc && response.res.resultCode == "OK") {
            console.warn("获取用户孵化次数:", response.res.userHatch);
            return response.res.userHatch;
        } else {
            console.error("请求异常", response);
            return null;
        }
    }

    /** 获取孵蛋奖励预览 */
    export async function getHatchReward() {
        const http = new HttpManager();
        http.server = netConfig.Server;
        http.token = netConfig.Token;
        http.timeout = netConfig.Timeout;

        const response = await http.getJson("tgapp/api/hatch/reward/sett");
        if (response.isSucc && response.res.resultCode == "OK") {
            console.warn("获取孵蛋奖励预览:", response.res.reHatchProbRewardArr);
            return response.res.reHatchProbRewardArr;
        } else {
            console.error("请求异常", response);
            return null;
        }
    }

    /** 获取孵蛋次数价格 */
    export async function getHatchPrice() {
        const http = new HttpManager();
        http.server = netConfig.Server;
        http.token = netConfig.Token;
        http.timeout = netConfig.Timeout;

        const response = await http.getJson("tgapp/api/hatch/num/price");
        if (response.isSucc && response.res.resultCode == "OK") {
            console.warn("获取孵蛋次数价格:", response.res.hatchConfigArr);
            return response.res.hatchConfigArr
        } else {
            console.error("请求异常", response);
            return null;
        }
    }

    /** 用户孵化 */
    export async function requestUserHatch(hatchNum: number) {
        const http = new HttpManager();
        http.server = netConfig.Server;
        http.token = netConfig.Token;
        http.timeout = netConfig.Timeout;

        const params = {
            'hatchNum': hatchNum
        };

        const response = await http.postJson("tgapp/api/user/hatch", JSON.stringify(params));
        if (response.isSucc) {
            console.warn("用户孵化:", response.res);
            return response.res;
        } else {
            console.error("用户孵化请求异常", response.res);
            return null;
        }
    }

     /** 购买用户孵蛋次数 */
     export async function requestHatchNum(hatchNumPriceID: number) {
        const http = new HttpManager();
        http.server = netConfig.Server;
        http.token = netConfig.Token;
        http.timeout = netConfig.Timeout;

        const params = {
            'hatchNumPriceID': hatchNumPriceID
        };

        const response = await http.postJson("tgapp/api/user/hatch/num/pur", JSON.stringify(params));
        if (response.isSucc && response.res.resultCode == "OK") {
            console.warn("购买用户孵蛋次数:", response.res.userHatch);
            return response.res.userHatch;
        } else {
            console.error("购买用户孵蛋次数请求异常", response.res);
            return null;
        }
    }

}
