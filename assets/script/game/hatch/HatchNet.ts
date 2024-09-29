import { HttpManager, ResponseData, ResultCode } from '../common/network/HttpManager';
import { netConfig } from '../common/network/NetConfig';


export namespace HatchNetService {

    /** 获取孵蛋保底次数 */
    export async function getHatchMinNum() {
        const http = new HttpManager();
        http.server = netConfig.Server;
        http.token = netConfig.Token;
        http.timeout = netConfig.Timeout;

        const response = await http.getUrl("tgapp/api/hatch/min/num?token=" + netConfig.Token);
        if (response.isSucc && response.res.resultCode == ResultCode.OK) {
            console.warn("获取孵蛋保底次数:", response.res);
            return response.res;
        } else {
            console.error("获取孵蛋保底次数请求异常", response);
            return null;
        }
    }

    /** 获取用户孵化次数 */
    export async function getUserHatchNum() {
        const http = new HttpManager();
        http.server = netConfig.Server;
        http.token = netConfig.Token;
        http.timeout = netConfig.Timeout;

        const response = await http.getUrl("tgapp/api/user/hatch/num?token=" + netConfig.Token);
        if (response.isSucc && response.res.resultCode == ResultCode.OK) {
            console.warn("获取用户孵化次数:", response.res);
            return response.res;
        } else {
            console.error("获取用户孵化次数请求异常", response);
            return null;
        }
    }

    /** 获取孵蛋奖励预览 */
    export async function getHatchReward() {
        const http = new HttpManager();
        http.server = netConfig.Server;
        http.token = netConfig.Token;
        http.timeout = netConfig.Timeout;

        const response = await http.getUrl("tgapp/api/hatch/reward/sett?token=" + netConfig.Token);
        if (response.isSucc && response.res.resultCode == ResultCode.OK) {
            console.warn("获取孵蛋奖励预览:", response.res.reHatchProbRewardArr);
            return response.res.reHatchProbRewardArr;
        } else {
            console.error("获取孵蛋奖励预览请求异常", response);
            return null;
        }
    }

    /** 获取孵蛋次数价格 */
    export async function getHatchPrice() {
        const http = new HttpManager();
        http.server = netConfig.Server;
        http.token = netConfig.Token;
        http.timeout = netConfig.Timeout;

        const response = await http.getUrl("tgapp/api/hatch/num/price?token=" + netConfig.Token);
        if (response.isSucc && response.res.resultCode == ResultCode.OK) {
            console.warn("获取孵蛋次数价格:", response.res.hatchConfigArr);
            return response.res.hatchConfigArr
        } else {
            console.error("获取孵蛋次数价格请求异常", response);
            return null;
        }
    }

    /** 用户孵化 */
    export async function requestUserHatch(hatchNum: number) {
        const http = new HttpManager();
        http.server = netConfig.Server;
        http.token = netConfig.Token;
        http.timeout = netConfig.Timeout * 3;

        const params = {
            'hatchNum': hatchNum.toString()
        };
        const newParams = new URLSearchParams(params).toString();
        const response = await http.postUrl("tgapp/api/user/hatch?token=" + netConfig.Token, newParams);
        if (response.isSucc && response.res.resultCode == ResultCode.OK) {
            console.warn("用户孵化请求成功:", response.res);
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
            'hatchNumPriceID': hatchNumPriceID.toString()
        };

        const newParams = new URLSearchParams(params).toString();
        const response = await http.postUrl("tgapp/api/user/hatch/num/pur?token=" + netConfig.Token, newParams);
        if (response.isSucc && response.res.resultCode == ResultCode.OK) {
            console.warn("购买用户孵蛋次数:", response.res);
            return response.res;
        } else {
            console.error("购买用户孵蛋次数请求异常", response.res);
            return response.res;
        }
    }
}
