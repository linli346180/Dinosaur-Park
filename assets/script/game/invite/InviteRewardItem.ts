import { Label } from 'cc';
import { _decorator, Component, Node } from 'cc';
import { RewardConfig } from './InviteData';
import { Button } from 'cc';
import { InviteNetService } from './InviteNet';
import { smc } from '../common/SingletonModuleComp';
import { oops } from '../../../../extensions/oops-plugin-framework/assets/core/Oops';
const { ccclass, property } = _decorator;

@ccclass('InviteRewardItem')
export class InviteRewardItem extends Component {
    @property(Node)
    private icon_gold: Node = null!;
    @property(Node)
    private icon_gem: Node = null!;
    @property(Node)
    private icon_usdt: Node = null!;
    @property(Node)
    private icon_start: Node = null!;
    @property(Label)
    private awardNum: Label = null!;
    @property(Label)
    private inviteNum: Label = null!;
    @property(Button)
    private btn_item: Button = null!;
    @property(Node)
    private maskNode: Node = null!;
    @property(Node)
    private redNode: Node = null!;
    @property(Node)
    private checkNode :Node = null!;

    private totalNum: number = 0;
    private config: RewardConfig = null!;

    onLoad() {
        this.btn_item?.node.on(Button.EventType.CLICK, this.onItemClick, this);
    }

    /**
     * 初始化配置
     * @param inviteNum : 已邀请人数
     * @param config : 邀请奖励配置
     */
    public initItem(totalNum: number, config: RewardConfig) {
        this.config = config;
        this.totalNum = totalNum;

        this.awardNum.string = `x${config.awardNum}`;
        this.inviteNum.string = `x${config.inviteNum}`;
        this.icon_gold.active = false;
        this.icon_gem.active = false;
        this.icon_usdt.active = false;
        this.icon_start.active = false;
        switch (config.awardType) {
            case 101:
                this.icon_gold.active = true;
                break;
            case 102:
                this.icon_gem.active = true;
                break;
            case 104:
                this.icon_usdt.active = true;
                break;
            case 103:
                this.icon_start.active = true;
                break;
        }

        if(totalNum < config.inviteNum){
            this.redNode.active = false;
            this.maskNode.active = true;
            this.checkNode.active = false;
        } else if(totalNum >= config.inviteNum && !config.clamed){
            this.redNode.active = true;
            this.checkNode.active = false;
            this.maskNode.active = false;
        } else {
            this.redNode.active = false;
            this.maskNode.active = true;
            this.checkNode.active = true;
        }
    }

    private async onItemClick() {
        if(this.maskNode.active)
            return;

        this.btn_item.interactable = false;
        const res = await InviteNetService.clampInviteReward(this.config.id);
        if(res) {
            oops.gui.toast(oops.language.getLangByID('invite_tips_claim_success'));
            smc.account.updateCoinData();
            this.config.clamed = true;
            this.initItem(this.totalNum, this.config);
        }
        this.btn_item.interactable = true;
    }
}


