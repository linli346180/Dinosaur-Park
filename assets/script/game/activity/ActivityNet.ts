import { _decorator, Component, Node } from 'cc';
import { HttpManager } from '../../net/HttpManager';
import { netConfig } from '../../net/custom/NetConfig';
import { NetErrorCode } from '../../net/custom/NetErrorCode';
import { ActivityData } from './ActivityDefine';
const { ccclass, property } = _decorator;

export namespace ActivityNetService {

    /** 获取福利活动信 */
    export async function getActivityData(): Promise<ActivityData | null> {
        const http = createHttpManager();
        const response = await http.getUrl(`tgapp/api/user/bouns/info?token=${netConfig.Token}`);
        if (response.isSucc && response.res.resultCode === NetErrorCode.Success) {
            console.warn("获取福利活动信息:", response.res);
            let data: ActivityData = response.res.bouns;
            data.bounsRankArr = response.res.bounsRankArr;
            return data;
        } else {
            console.error("获取福利活动信息异常", response);
            return null;
        }
    }

    /** 获取福利排行榜信息 */
    export async function getBounsRankList() {
        const http = createHttpManager();
        const response = await http.getUrl(`tgapp/api/user/bouns/info?token=${netConfig.Token}`);
        if (response.isSucc && response.res.resultCode === NetErrorCode.Success) {
            console.warn("获取福利排行榜:", response.res);
            return response.res
        } else {
            console.error("获取福利排行榜异常", response);
        }
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