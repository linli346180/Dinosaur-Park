import { Button } from 'cc';
import { _decorator, Component, Node } from 'cc';
import { oops } from '../../../../extensions/oops-plugin-framework/assets/core/Oops';
import { UIID } from '../common/config/GameUIConfig';
import { EmailEvent, EmailReadState, EmailRewardState, MailRecord } from './EmailDefine';
import { EmailNetService } from './EmailNet';
import { Prefab } from 'cc';
import { Label } from 'cc';
import { instantiate } from 'cc';
import { EmailRewardItem } from './EmailRewardItem';
const { ccclass, property } = _decorator;

@ccclass('EmailDetail')
export class EmailDetail extends Component {
    private btn_close: Button = null!;
    private mailRecord: MailRecord = null!;

    @property(Prefab)
    rewardItem: Prefab = null!;

    @property(Button)
    btn_unclaimed: Button = null!;
    @property(Button)
    btn_claimed: Button = null!;
    @property(Node)
    rewardContainer: Node = null!;

    @property(Label)
    mailTitle: Label = null!;
    @property(Label)
    mailContent: Label = null!;
    @property(Label)
    expireTime: Label = null!;

    start() {
        this.btn_close = this.node.getChildByName("btn_close")?.getComponent(Button)!;
        this.btn_close?.node.on(Button.EventType.CLICK, this.closeUI, this);
        this.btn_unclaimed?.node.on(Button.EventType.CLICK, this.onClaimed, this);
    }

    closeUI() {
        oops.gui.remove(UIID.EmailDetail);
    }

    initUI(mailRecord: MailRecord) {
        console.log("查看邮件", mailRecord);
        this.mailRecord = mailRecord;
        if (this.mailRecord.readState == EmailReadState.unread) {
            EmailNetService.readEmail(this.mailRecord.mailRecordId);
        }

        if (this.mailRecord.awardState == EmailRewardState.received) {
            this.btn_unclaimed.node.active = false;
        }

        this.mailTitle.string = this.mailRecord.mailTitle;
        this.mailContent.string = this.mailRecord.mailContent;
        this.expireTime.string = 'validity: ' + this.formatExpireTime(this.mailRecord.expireTime);

        this.rewardContainer.removeAllChildren();
        this.mailRecord.rewards.forEach((reward) => {
            let rewardItem = instantiate(this.rewardItem);
            if (rewardItem) {
                rewardItem.parent = this.rewardContainer;
                rewardItem.getComponent(EmailRewardItem)?.initItem(reward);
            }
        });
    }

    onClaimed() {
        EmailNetService.clampEmail(this.mailRecord.mailRecordId, this.mailRecord.mailConfigId).then((response) => {
            if (response) {
                this.mailRecord.awardState = EmailRewardState.received;
                this.initUI(this.mailRecord);
                oops.message.dispatchEvent(EmailEvent.EmailUpdate, this.mailRecord.mailRecordId);
            }
        });
    }

    formatExpireTime(expireTime: number): string {
        const days = Math.floor(expireTime / (24 * 60 * 60));
        const hours = Math.floor((expireTime % (24 * 60 * 60)) / (60 * 60));
        return `${days} day${days !== 1 ? 's' : ''} ${hours} hour${hours !== 1 ? 's' : ''}`;
    }
}