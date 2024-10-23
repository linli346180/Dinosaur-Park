import { _decorator, Component, Node, Button, Prefab, instantiate } from 'cc';
import { oops } from '../../../../extensions/oops-plugin-framework/assets/core/Oops';
import { UIID } from '../common/config/GameUIConfig';
import { Leaderboard, RankData, RankType } from './RankDefine';
import { RankNetService } from './RankNet';
import { RankItem } from './RankItem';
import { smc } from '../common/SingletonModuleComp';
const { ccclass, property } = _decorator;

@ccclass('RankUI')
export class RankUI extends Component {
    @property(Prefab)
    itemPerfab: Prefab = null!;
    @property(Button)
    btn_close: Button = null!;
    @property(Node)
    container: Node = null!;
    @property(RankItem)
    selfRankItem: RankItem = null!;
    private leaderboard: Leaderboard = new Leaderboard();

    start() {
        this.selfRankItem.node.active = false;
        this.btn_close?.node.on(Button.EventType.CLICK, this.closeUI, this);
    }

    onEnable() {
        this.initUI();
    }

    closeUI() {
        oops.gui.remove(UIID.RankUI, false);
    }

    initUI() {
        this.container.removeAllChildren();
        RankNetService.getRankData(RankType.day).then((res) => {
            if (res && res.leaderboard != null) {

                this.leaderboard = res.leaderboard;
                this.selfRankItem.node.active = true;
                let userRank : RankData = {
                    ranking: this.leaderboard.userRank.ranking,
                    userID: this.leaderboard.userRank.userID,
                    userName: smc.account.AccountModel.user.name,
                    inviteCount: this.leaderboard.userRank.inviteCount
                }
                this.selfRankItem.initItem(userRank);

                this.leaderboard.rankList.sort((a, b) => { return a.ranking - b.ranking; });
                for (const rankItem of this.leaderboard.rankList) {
                    let item = instantiate(this.itemPerfab);
                    if (item) {
                        item.getComponent(RankItem)?.initItem(rankItem);
                        this.container.addChild(item);
                    }
                }
            }
        });
    }
}