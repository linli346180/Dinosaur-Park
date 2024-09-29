import { oops } from '../../../../extensions/oops-plugin-framework/assets/core/Oops';
import { HttpManager, ResultCode } from '../common/network/HttpManager';
import { netConfig } from '../common/network/NetConfig';
import { AccountEvent } from './AccountEvent';

export namespace AccountNetService {

    /** 获取星兽配置 */
    export async function getStartBeastConfig() {
        const http = new HttpManager();
        http.server = netConfig.Server;
        http.token = netConfig.Token;
        http.timeout = netConfig.Timeout;

        const response = await http.getUrl("tgapp/api/stb/cfg/list?token=" + netConfig.Token);
        if (response.isSucc && response.res.resultCode == ResultCode.OK) {
            console.warn("获取星兽配置请求成功", response.res);
            return response.res;

        } else {
            console.error("获取星兽配置请求异常", response);
            return null;
        }
    }

    /** 获取用户星兽数据 */
    export async function GetUserSTBData() {
        const http = new HttpManager();
        http.server = netConfig.Server;
        http.token = netConfig.Token;
        http.timeout = netConfig.Timeout;

        const response = await http.getUrl("tgapp/api/user/stb/data?token=" + netConfig.Token);
        if (response.isSucc && response.res.resultCode == ResultCode.OK) {
            console.log("星兽数据请求成功", response.res.userInstbData);
            return response.res;
        } else {
            console.error("星兽数据请求异常", response);
            return null;
        }
    }

    /** 获取用户货币数据 */
    export async function getUserCoinData() {
        const http = new HttpManager();
        http.server = netConfig.Server;
        http.token = netConfig.Token;
        http.timeout = netConfig.Timeout;
        const response = await http.getUrl("tgapp/api/user/coin?token=" + netConfig.Token);
        if (response.isSucc && response.res.resultCode == ResultCode.OK) {
            console.warn("货币数据请求成功", response.res.userCoin);
            return response.res.userCoin;
        } else {
            console.error("货币数据请求异常", response);
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
            'adopStbID': adopStbID.toString()
        };
        const paramString = new URLSearchParams(params).toString();
        const response = await http.postUrl("tgapp/api/user/stb/adop?token=" + netConfig.Token, paramString);
        if (response.isSucc && response.res.resultCode == ResultCode.OK) {
            console.warn("领养星兽请求成功", response.res);
            return response.res;
        } else {
            console.error("领养星兽请求异常", response.res);
            return response.res;
        }
    }

    /** 无收益星兽合成(1-9级黄金星兽) */
    export async function mergeGoldNinSTB(userFirstStbID: number, UserTwoStbID: number) {
        const http = new HttpManager();
        http.server = netConfig.Server;
        http.token = netConfig.Token;
        http.timeout = netConfig.Timeout;
        const params = {
            'userFirstStbID': userFirstStbID.toString(),
            'userTwoStbID': UserTwoStbID.toString()
        };
        const paramString = new URLSearchParams(params).toString();
        const response = await http.postUrl("tgapp/api/user/ninstb/synth?token=" + netConfig.Token, paramString);
        if (response.isSucc && response.res.resultCode == ResultCode.OK) {
            console.warn("无收益星兽合成", response.res);
            return response.res;
        } else {
            console.error("无收益星兽合成请求异常", response);
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
            'userFirstStbID': firstStbID.toString(),
            'userTwoStbID': twoStbID.toString(),
            'isUpProb': isUpProb.toString()
        };
        const paramString = new URLSearchParams(params).toString();
        const response = await http.postUrl("tgapp/api/user/stb/synth?token=" + netConfig.Token, paramString);
        if (response.isSucc && response.res.resultCode == ResultCode.OK) {
            console.warn("收益星兽合成", response.res);
            return response.res;
        } else {
            console.error("合并失败", response);
            return response.res;
        }
    }

    /** 无收益星兽位置交换 */
    export async function swapPosition(stbID: number, slotId: number) {
        const http = new HttpManager();
        http.server = netConfig.Server;
        http.token = netConfig.Token;
        http.timeout = netConfig.Timeout;

        const params = {
            "swapUserStbID": stbID.toString(),
            "position": slotId.toString()
        };
        const paramString = new URLSearchParams(params).toString();
        const response = await http.postUrl("tgapp/api/user/ninstb/swap?token=" + netConfig.Token, paramString);
        if (response.isSucc && response.res.resultCode == ResultCode.OK) {
            console.warn("位置交换成功", response.res);
            return response.res;
        } else {
            console.error("位置交换请求异常", response.res);
            return null;
        }
    }

    /** 领取用户收益 */
    export async function UserCoinReceive() {
        const http = new HttpManager();
        http.server = netConfig.Server;
        http.token = netConfig.Token;
        http.timeout = netConfig.Timeout;

        const response = await http.postUrl("tgapp/api/user/coin/receive?token=" + netConfig.Token);
        if (response.isSucc && response.res.resultCode == ResultCode.OK) {
            console.warn("领取用户收益:", response.res);
            oops.message.dispatchEvent(AccountEvent.CoinDataChange);
            return response.res;
        } else {
            console.error("请求异常", response);
            return null;
        }
    }

}