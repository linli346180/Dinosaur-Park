import { oops } from '../../../../extensions/oops-plugin-framework/assets/core/Oops';
import { TGWebAppInitData } from '../../telegram/TGDefine';
import { HttpManager } from '../../net/HttpManager';
import { netConfig } from '../../net/custom/NetConfig';
import { AccountType } from './AccountDefine';
import { AccountEvent } from './AccountEvent';
import { NetErrorCode } from '../../net/custom/NetErrorCode';
import { Logger } from '../../Logger';

export namespace AccountNetService {

    /** 登录TG账号 */
    export async function LoginTGAcount(data: TGWebAppInitData) {
        const http = new HttpManager();
        http.server = netConfig.Server;
        http.timeout = netConfig.Timeout;

        console.log("TG数据:", data);
        const initData = {
            'user': JSON.stringify(data.UserData),
            'chat_instance': data.chat_instance,
            'chat_type': data.chat_type,
            'auth_date': data.Auth_date.toString(),
            'hash': data.Hash,
        };
        const initDataString = new URLSearchParams(initData).toString();
        const params = JSON.stringify({
            loginType: 1,
            initData: initDataString,
            avatarUrl: data.AvatarUrl || '',
            inviteSign: ''
        });
        console.log("登录参数:" + params);
        const response = await http.postUrlNoHead("tgapp/api/login", params);
        if (response.isSucc && response.res.resultCode == NetErrorCode.Success) {
            console.warn("TG登录成功", response.res);
            netConfig.Token = response.res.token;
            return response.res;
        } else {
            console.error("TG登录失败", response);
            return null;
        }
    }

    /** 登录测试账号 */
    export async function LoginTestAccount() {
        const http = new HttpManager();
        http.server = netConfig.Server;
        http.timeout = netConfig.Timeout;
        const params = {
            'loginType': 3,
            'account': netConfig.Account,
            'password': netConfig.Password
        };
        // const paramString = new URLSearchParams(params).toString();
        const response = await http.postUrlNoHead("tgapp/api/login", JSON.stringify(params));
        if (response.isSucc && response.res.resultCode == NetErrorCode.Success) {
            netConfig.Token = response.res.token;
            console.warn("登录成功", http.url + JSON.stringify(response.res));
            return response.res;
        } else {
            console.error("登录异常", http.url + JSON.stringify(response));
            return null;
        }
    }

    /** 获取星兽配置 */
    export async function getStartBeastConfig() {
        const http = new HttpManager();
        http.server = netConfig.Server;
        http.token = netConfig.Token;
        http.timeout = netConfig.Timeout;

        const response = await http.getUrl("tgapp/api/stb/cfg/list?token=" + netConfig.Token);
        if (response.isSucc && response.res.resultCode == NetErrorCode.Success) {
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
        if (response.isSucc && response.res.resultCode == NetErrorCode.Success) {
            console.warn("星兽数据请求成功", response.res);
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
        if (response.isSucc && response.res.resultCode == NetErrorCode.Success && response.res.userCoin != null) {
            console.warn("货币数据请求成功", response.res);
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
        if (response.isSucc && response.res.resultCode == NetErrorCode.Success) {
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
        if (response.isSucc && response.res.resultCode == NetErrorCode.Success) {
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
        if (response.isSucc && response.res.resultCode == NetErrorCode.Success) {
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
        if (response.isSucc && response.res.resultCode == NetErrorCode.Success) {
            console.warn("位置交换成功", response.res);
            return response.res;
        } else {
            console.error("位置交换请求异常", response.res);
            return null;
        }
    }

    /** 领取用户金币收益 */
    export async function UseCollectCoin() {
        const http = new HttpManager();
        http.server = netConfig.Server;
        http.token = netConfig.Token;
        http.timeout = netConfig.Timeout;

        const response = await http.postUrl("tgapp/api/user/goldc/receive?token=" + netConfig.Token);
        if (response.isSucc && response.res.resultCode == NetErrorCode.Success) {
            Logger.logNet("领取金币:" + response.res);
            oops.message.dispatchEvent(AccountEvent.CoinDataChange);
            return response.res;
        } else {
            console.error("领取金币:", response);
            return null;
        }
    }

    /** 领取用户宝石收益 */
    export async function UseCollectGem() {
        const http = new HttpManager();
        http.server = netConfig.Server;
        http.token = netConfig.Token;
        http.timeout = netConfig.Timeout;

        const response = await http.postUrl("tgapp/api/user/gemsc/receive?token=" + netConfig.Token);
        if (response.isSucc && response.res.resultCode == NetErrorCode.Success) {
            Logger.logNet("领取宝石:" + response.res);
            oops.message.dispatchEvent(AccountEvent.CoinDataChange);
            return response.res;
        } else {
            console.error("领取宝石", response);
            return null;
        }
    }

}