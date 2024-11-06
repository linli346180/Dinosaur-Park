import { _decorator, Component, Node, Label } from 'cc';
import { RankData, RankGroup } from './RankDefine';
const { ccclass, property } = _decorator;

@ccclass('RankItem')
export class RankItem extends Component {
    @property(Node)
    level1: Node = null!;
    @property(Node)
    level2: Node = null!;
    @property(Node)
    level3: Node = null!;
    @property(Label)
    ranking: Label = null!;
    @property(Label)
    userName: Label = null!;
    @property(Label)
    inviteCount: Label = null!;

    @property(Node)
    inviteIcon: Node = null!;
    @property(Node)
    richIcon: Node = null!;

    initItem(data: RankData, rankGroup: RankGroup) {
        if (data == null)
            return;
        this.userName.string = data.userName;
        this.inviteCount.string = data.inviteCount.toString();
        this.level1.active = data.ranking == 1;
        this.level2.active = data.ranking == 2;
        this.level3.active = data.ranking == 3;
        if (data.ranking == 0) {
            this.ranking.string = '99+';
        }
        if (data.ranking > 3) {
            this.ranking.string = data.ranking.toString();
        }
        this.inviteIcon.active = rankGroup == RankGroup.Invite;
        this.richIcon.active = rankGroup == RankGroup.Rich;
    }
}


