import { HttpManager } from "../../net/HttpManager";
import { netConfig } from "../../net/custom/NetConfig";
import { NetErrorCode } from "../../net/custom/NetErrorCode";
import { RankType, UserRankData } from "./RankDefine";

export namespace RankNetService {
    /** 拉新排行榜 */
    export async function getInviteRankData(rankingType: RankType): Promise<UserRankData | null> {
        const http = new HttpManager();
        http.server = netConfig.Server;
        http.token = netConfig.Token;
        http.timeout = netConfig.Timeout;

        const response = await http.getUrl(`tgapp/api/user/invite/searchLeaderboard?rankingType=${rankingType}&token=${netConfig.Token}`);
        if (response.isSucc && response.res.resultCode == NetErrorCode.Success) {
            console.warn("拉新排行榜:", response.res.leaderboard);
            let rankData = new UserRankData();
            rankData.rankList = response.res.leaderboard.rankList;
            rankData.userRank = response.res.leaderboard.userRank;
            return rankData;
        } else {
            console.error("拉新排行榜异常", response);
            return null;
        }
    }

    /** 财富排版版 */
    export async function getCoinRankData(): Promise<UserRankData | null> {
        const http = new HttpManager();
        http.server = netConfig.Server;
        http.token = netConfig.Token;
        http.timeout = netConfig.Timeout;

        const response = await http.getUrl(`tgapp/api/user/coin/leaderboard?token=${netConfig.Token}`);
        if (response.isSucc && response.res.resultCode == NetErrorCode.Success) {
            console.warn("财富排版版:", response.res.coinLeaderboard);
            let rankData = new UserRankData();
            rankData.rankList = response.res.coinLeaderboard.rankList;
            rankData.userRank = response.res.coinLeaderboard.userRank;
            return rankData;
        } else {
            console.error("财富排版版异常", response);
            return null;
        }
    }
}