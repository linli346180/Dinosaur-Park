import { oops } from '../../../../extensions/oops-plugin-framework/assets/core/Oops';
import { TGWebAppInitData } from '../../telegram/TGDefine';
import { HttpManager } from '../../net/HttpManager';
import { netConfig } from '../../net/custom/NetConfig';
import { AccountType } from './AccountDefine';
import { AccountEvent } from './AccountEvent';
import { NetCmd, NetErrorCode } from '../../net/custom/NetErrorCode';
import { Logger } from '../../Logger';
import { netChannel } from '../../net/custom/NetChannelManager';
import { smc } from '../common/SingletonModuleComp';
import { GameEvent } from '../common/config/GameEvent';

export namespace AccountNetService {
    /** 登录TG账号 */
    export async function LoginTGAcount(data: TGWebAppInitData) {
        const http = new HttpManager();
        http.server = netConfig.Server;
        http.timeout = netConfig.Timeout;
        const initData = {
            'user': JSON.stringify(data.UserData),
            'chat_instance': data.chat_instance,
            'chat_type': data.chat_type,
            'auth_date': data.Auth_date.toString(),
            'hash': data.Hash,
        };
        let initDataString = new URLSearchParams(initData).toString();
        if (data.inviteSigin != '') {
            initDataString += `&start_param=${data.inviteSigin}`;
        }

        const params = JSON.stringify({
            loginType: 1,
            initData: initDataString,
            loginEquipMent: generateGUID(),
            avatarUrl: data.AvatarUrl || '',
            inviteCode: data.InviteCode,
            inviteSigin: data.inviteSigin,
            inviteType: data.inviteType,
        });
        console.log("TG登录参数:" + params);
        const response = await http.postUrlNoHead("tgapp/api/login", params);
        if (response.isSucc && response.res.resultCode == NetErrorCode.Success) {
            console.warn(`TG账号登录成功${http.url}`, response.res);
            netConfig.Token = response.res.token;
            getServerTimeDiff(response.res.sTime);
            return response.res;
        } else {
            console.error(`TG账号登录失败${http.url}`, response);
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
            'password': netConfig.Password,
            'loginEquipMent': generateGUID()
        };
        // const paramString = new URLSearchParams(params).toString();
        const response = await http.postUrlNoHead("tgapp/api/login", JSON.stringify(params));
        if (response.isSucc && response.res.resultCode == NetErrorCode.Success) {
            netConfig.Token = response.res.token;
            console.warn(`测试账号登录成功${http.url}`, response.res);
            getServerTimeDiff(response.res.sTime);
            return response.res;
        } else {
            console.error(`测试账号登录异常${http.url}`, response);
            return null;
        }
    }

    function generateGUID(): string {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    /** 查询用户是否加入官方群组或频道 */
    export async function getUserOfficial() {
        const http = createHttpManager();
        const response = await http.getUrl(`tgapp/api/presell/getUserOfficial?token=${netConfig.Token}`);
        if (response.isSucc && response.res.resultCode === NetErrorCode.Success) {
            console.warn("查询用户是否加入官方群组或频道:", response.res);
            return response.res.userOfficial;
        } else {
            console.error("查询用户是否加入官方群组或频道置异常", response);
            return null;
        }
    }

    /** 创建WebSocket连接 */
    export async function createWebSocket() {
        netChannel.gameCreate();
        netChannel.gameConnect();
        netChannel.game.on(NetCmd.UserNinstbType, '', (data) => {
            smc.account.OnRecevieMessage(NetCmd.UserNinstbType, data);
        });
        netChannel.game.on(NetCmd.DownLineType, '', (data) => {
            smc.account.OnRecevieMessage(NetCmd.DownLineType, data);
        });
        netChannel.game.on(NetCmd.NinstbDeathType, '', (data) => {
            smc.account.OnRecevieMessage(NetCmd.NinstbDeathType, data);
        });
        netChannel.game.on(NetCmd.IncomeStbDeathType, '', (data) => {
            smc.account.OnRecevieMessage(NetCmd.IncomeStbDeathType, data);
        });
        netChannel.game.on(NetCmd.UserHatchType, '', (data) => {
            smc.account.OnRecevieMessage(NetCmd.UserHatchType, data);
        });
        netChannel.game.on(NetCmd.InvitedType, '', (data) => {
            smc.account.OnRecevieMessage(NetCmd.InvitedType, data);
        });
        netChannel.game.on(NetCmd.UserDebrisType, '', (data) => {
            smc.account.OnRecevieMessage(NetCmd.UserDebrisType, data);
        });
        netChannel.game.on(NetCmd.UserEmailType, '', (data) => {
            smc.account.OnRecevieMessage(NetCmd.UserEmailType, data);
        });
        netChannel.game.on(NetCmd.UserTaskType, '', (data) => {
            smc.account.OnRecevieMessage(NetCmd.UserTaskType, data);
        });
        netChannel.game.on(NetCmd.RankingType, '', (data) => {
            smc.account.OnRecevieMessage(NetCmd.RankingType, data);
        });
        netChannel.game.on(NetCmd.WithDrawalType, '', (data) => {
            smc.account.OnRecevieMessage(NetCmd.WithDrawalType, data);
        });
        netChannel.game.on(NetCmd.StbGurideType, '', (data) => {
            smc.account.OnRecevieMessage(NetCmd.StbGurideType, data);
        });
        netChannel.game.on(NetCmd.UserBounsType, '', (data) => {
            smc.account.OnRecevieMessage(NetCmd.UserBounsType, data);
        });
        oops.message.dispatchEvent(GameEvent.WebSocketConnected);
    }

    /** 获取星兽配置 */
    export async function getStartBeastConfig() {
        const http = createHttpManager();

        const response = await http.getUrl("tgapp/api/stb/cfg/list?token=" + netConfig.Token);
        if (response.isSucc && response.res.resultCode == NetErrorCode.Success) {
            console.warn("获取星兽配置请求成功", response.res.userInstbData);
            return response.res;

        } else {
            console.error("获取星兽配置请求异常", response);
            return null;
        }
    }

    /** 获取用户星兽数据 */
    export async function GetUserSTBData() {
        const http = createHttpManager();

        const response = await http.getUrl("tgapp/api/user/stb/data?token=" + netConfig.Token);
        if (response.isSucc && response.res.resultCode == NetErrorCode.Success) {
            console.warn("星兽数据请求成功", response.res.userInstbData);
            return response.res;
        } else {
            console.error("星兽数据请求异常", response);
            return null;
        }
    }

    /** 获取用户货币数据 */
    export async function getUserCoinData() {
        const http = createHttpManager();
        const response = await http.getUrl("tgapp/api/user/coin?token=" + netConfig.Token);
        if (response.isSucc && response.res.resultCode == NetErrorCode.Success && response.res.userCoin != null) {
            console.warn("货币数据请求成功", response.res);
            return response.res;
        } else {
            console.error("货币数据请求异常", response);
            return null;
        }
    }

    /** 领养星兽 */
    export async function adopStartBeast(adopStbID: number) {
        const http = createHttpManager();
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
        const http = createHttpManager();
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
        const http = createHttpManager();
        const params = {
            'userFirstStbID': firstStbID.toString(),
            'userTwoStbID': twoStbID.toString(),
            'isUpProb': isUpProb.toString()
        };
        const paramString = new URLSearchParams(params).toString();
        const response = await http.postUrl("tgapp/api/user/stb/synth?token=" + netConfig.Token, paramString);
        if (response.isSucc && response.res.resultCode == NetErrorCode.Success) {
            console.warn("10级黄金星兽合成:", response.res);
            return response.res;
        } else {
            console.error("10级黄金星兽异常:", response);
            return null;
        }
    }

    /** 无收益星兽位置交换 */
    export async function swapPosition(stbID: number, slotId: number) {
        const http = createHttpManager();
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
            console.error("位置交换请求异常", response);
            return null;
        }
    }

    /** 领取用户金币收益 */
    export async function UseCollectCoin() {
        const http = createHttpManager();
        const response = await http.postUrl("tgapp/api/user/goldc/receive?token=" + netConfig.Token);
        if (response.isSucc && response.res.resultCode == NetErrorCode.Success) {
            Logger.logNet("领取金币:" + JSON.stringify(response.res));
            return response.res;
        } else {
            console.error("领取金币异常:", response);
            return null;
        }
    }

    /** 领取用户宝石收益 */
    export async function UseCollectGem() {
        const http = createHttpManager();

        const response = await http.postUrl("tgapp/api/user/gemsc/receive?token=" + netConfig.Token);
        if (response.isSucc && response.res.resultCode == NetErrorCode.Success) {
            Logger.logNet("领取宝石:" + JSON.stringify(response.res));
            return response.res;
        } else {
            console.error("领取宝石异常", response);
            return null;
        }
    }

    /** 获取收益星兽合成概率 */
    export async function getSynthProb() {
        const http = createHttpManager();
        const response = await http.getUrl("tgapp/api/user/stb/synth/prob?token=" + netConfig.Token);
        if (response.isSucc && response.res.resultCode == NetErrorCode.Success) {
            console.warn("获取收益星兽合成概率:" + response.res);
            return response.res;
        } else {
            console.error("获取收益星兽合成概率异常", response);
            return null;
        }
    }

    /** 获取收益星兽合成提升概率配置 */
    export async function getSynthProbconfig(): Promise<any> {
        const http = createHttpManager();
        const response = await http.getUrl("tgapp/api/user/stb/synth/prob?token=" + netConfig.Token);
        if (response.isSucc && response.res.resultCode == NetErrorCode.Success) {
            console.warn("获取合成提升概率配置:" + response.res);
            return response.res;
        } else {
            console.error("获取合成提升概率配置异常", response);
            return null;
        }
    }

    /** 获取系统配置 */
    export async function getUserConfig(typeKey: string) {
        const http = createHttpManager();
        const response = await http.getUrl(`tgapp/api/language/getConfigList?token=${netConfig.Token}&typeKey=${typeKey}`);
        if (response.isSucc && response.res.resultCode == NetErrorCode.Success) {
            console.warn(`获取系统配置:`, response.res);
            return response.res;
        } else {
            console.error("获取系统配置异常", response);
            return null;
        }
    }

    /** 计算了服务器时间和本地时间差 */
    function getServerTimeDiff(timestamp: number) {
        if (!timestamp) {
            console.error("服务器时间为空");
            return;
        }

        // 将服务器时间字符串转换为 Date 对象
        const serverTime = new Date(timestamp * 1000);
        if (isNaN(serverTime.getTime())) {
            console.error("无效的服务器时间格式:", timestamp);
            return;
        }

        // 计算时间差，单位为毫秒
        const localTime = new Date();
        netConfig.timeDifference = localTime.getTime() - serverTime.getTime();

        console.log("服务器时间:", serverTime, "本地时间:", localTime, "时间差:", netConfig.timeDifference);
    }

    /** 创建 HttpManager 实例并进行配置 */
    function createHttpManager(): HttpManager {
        const http = new HttpManager();
        http.server = netConfig.Server;
        http.token = netConfig.Token;
        http.timeout = netConfig.Timeout;
        return http;
    }


}