import { _decorator, Component, Node, Button, Prefab, instantiate } from 'cc';
import { oops } from '../../../../extensions/oops-plugin-framework/assets/core/Oops';
import { UIID } from '../common/config/GameUIConfig';
import { UserRankData, RankData, RankGroup, RankType } from './RankDefine';
import { RankNetService } from './RankNet';
import { RankItem } from './RankItem';
import { smc } from '../common/SingletonModuleComp';
import { RankToggle } from './RankToggle';
import { Label } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('RankView')
export class RankView extends Component {
    @property(Prefab)
    itemPerfab: Prefab = null!;
    @property(Button)
    btn_close: Button = null!;
    @property(Node)
    container: Node = null!;
    @property(RankItem)
    selfRankItem: RankItem = null!;
    @property(Node)
    toggleGroup: Node = null!;

    @property(Button)
    btn_left: Button = null!;
    @property(Button)
    btn_right: Button = null!;

    @property(Label)
    title: Label = null!;

    @property(Node)
    emptyNode: Node = null!;


    private curRankGroup = RankGroup.Invite;
    private curRankType = RankType.day;
    private rankData: UserRankData | null = null;

    protected onLoad(): void {
        this.container.removeAllChildren();
        this.btn_close?.node.on(Button.EventType.CLICK, this.closeUI, this);
        this.btn_left?.node.on(Button.EventType.CLICK, this.onLeftClicked, this);
        this.btn_right?.node.on(Button.EventType.CLICK, this.onRightClicked, this);
        this.toggleGroup.children.forEach((childNode, index) => {
            let comp = childNode.getComponent(RankToggle);
            if (comp) {
                comp.onToggleSelcted = this.onToggleSelcted.bind(this);
            }
        });
    }

    onEnable() {
        this.title.string = this.getRankGroupTitle(this.curRankGroup);
        this.initUI();
    }

    private closeUI() {
        oops.gui.remove(UIID.RankUI, false);
    }

    private onToggleSelcted(index: number) {
        this.curRankType = index;
        this.initUI();
    }

    private async initUI() {
        this.container.removeAllChildren();
        this.emptyNode.active = true

        if (this.curRankGroup == RankGroup.Invite) {
            this.rankData = await RankNetService.getInviteRankData(this.curRankType);
        }
        if (this.curRankGroup == RankGroup.Rich) {
            this.rankData = await RankNetService.getCoinRankData();
        }

        this.toggleGroup.active = this.curRankGroup == RankGroup.Invite;
        if (!this.rankData) return;

        if(this.rankData.userRank.userName == '') {
            this.rankData.userRank.userName = smc.account.AccountModel.userData.name;
        }
        this.selfRankItem.initItem(this.rankData.userRank, this.curRankGroup);

        this.emptyNode.active = this.rankData.rankList.length == 0;
        this.rankData.rankList.sort((a, b) => { return a.ranking - b.ranking; });
        for (const rankItem of this.rankData.rankList) {
            let item = instantiate(this.itemPerfab);
            if (item) {
                item.getComponent(RankItem)?.initItem(rankItem, this.curRankGroup);
                this.container.addChild(item);
            }
        }
    }

    private onLeftClicked() {
        this.setRankGroup(-1);
    }

    private onRightClicked() {
        this.setRankGroup(1);
    }

    private setRankGroup(direction: number) {
        const rankGroups = Object.values(RankGroup).filter(value => typeof value === 'number') as number[];
        const currentIndex = rankGroups.indexOf(this.curRankGroup);
        const nextIndex = (currentIndex + direction + rankGroups.length) % rankGroups.length;
        this.curRankGroup = rankGroups[nextIndex];
        this.title.string = this.getRankGroupTitle(this.curRankGroup);
        this.initUI();
    }

    private getRankGroupTitle(rankGroup: RankGroup): string {
        switch (rankGroup) {
            case RankGroup.Invite:
                return oops.language.getLangByID("invite_tips_pullnew");
            case RankGroup.Rich:
                return oops.language.getLangByID("invite_tips_rick");
            // 添加其他 RankGroup 的标题
            default:
                return "未知榜";
        }
    }
}