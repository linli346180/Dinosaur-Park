

export enum RankType {
    day = 0,
    week = 1,
    month = 2,
}

export class Leaderboard { 
    rankList: RankData[] = [];  //排行榜
    userRank: RankData;
}

export interface RankData {
    ranking: number;            //排名
    userID:number;              //用户id
    userName:string;            //用户名称
    inviteCount:number;         //邀请人数
}