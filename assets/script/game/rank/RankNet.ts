import { HttpManager } from "../../net/HttpManager";
import { netConfig } from "../../net/custom/NetConfig";
import { NetErrorCode } from "../../net/custom/NetErrorCode";
import { RankType } from "./RankDefine";


export namespace RankNetService {

    /** 查询排行榜 
     * 0 日 1 周 2 月*/ 
    export async function getRankData(rankingType: RankType) {
        const http = new HttpManager();
        http.server = netConfig.Server;
        http.token = netConfig.Token;
        http.timeout = netConfig.Timeout;

        const response = await http.getUrl(`tgapp/api/user/invite/searchLeaderboard?rankingType=${rankingType}&token=${netConfig.Token}`);
        if (response.isSucc && response.res.resultCode == NetErrorCode.Success) {
            console.warn("查询排行榜:", response.res);
            return response.res;
        } else {
            console.error("查询排行榜", response);
            return null;
        }
    }


}

