import { _decorator, Component, Node, Label } from 'cc';
import { RankData, RankGroup } from './RankDefine';
import { StringUtil } from '../common/utils/StringUtil';
const { ccclass, property } = _decorator;

@ccclass('RankItem')
export class RankItem extends Component {
    @property(Node)
    rankIcon: Node = null!;
    @property(Node)
    level1: Node = null!;
    @property(Node)
    level2: Node = null!;
    @property(Node)
    level3: Node = null!;

    @property(Label)
    rankNum: Label = null!;
    @property(Label)
    userName: Label = null!;
    @property(Label)
    inviteCount: Label = null!;

    @property(Node)
    inviteIcon: Node = null!;
    @property(Node)
    richIcon: Node = null!;

    initItem(data: RankData, rankGroup: RankGroup) {
        // console.log('排行榜数据:', data);
        if (!data) return;

        this.userName.string = data.userName;
        this.inviteCount.string =  StringUtil.formatMoney(data.inviteCount,2).toString();
        this.inviteIcon.active = rankGroup === RankGroup.Invite;
        this.richIcon.active = rankGroup === RankGroup.Rich;

        this.updateRankingDisplay(Math.floor(data.ranking));
    }

    private updateRankingDisplay(ranking: number) {
        const isTopThree = ranking > 0 && ranking <= 3;
        this.rankIcon.active = isTopThree;
        this.rankNum.string = isTopThree ? '' : ranking > 3 ? ranking.toString() : '99+';

        this.level1.active = ranking === 1;
        this.level2.active = ranking === 2;
        this.level3.active = ranking === 3;
    }
}