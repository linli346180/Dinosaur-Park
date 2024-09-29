import { Button } from 'cc';
import { _decorator, Component, Node } from 'cc';
import { oops } from '../../../../extensions/oops-plugin-framework/assets/core/Oops';
import { UIID } from '../common/config/GameUIConfig';
import { EmailRewardState, MailRecord } from './EmailDefine';
import { Label } from 'cc';
import { UICallbacks } from '../../../../extensions/oops-plugin-framework/assets/core/gui/layer/Defines';
import { EmailDetail } from './EmailDetail';
const { ccclass, property } = _decorator;

@ccclass('EmailItem')
export class EmailItem extends Component {
    @property(Node)
    bg_claimed: Node = null!;
    @property(Node)
    bg_unclaimed: Node = null!;
    @property(Node)
    icon_claimed: Node = null!;
    @property(Node)
    icon_unclaimed: Node = null!;
    @property(Label)
    num: Label = null!;
    @property(Button)
    btn_unclaimed: Button = null!;
    @property(Button)
    btn_claimed: Button = null!;

    @property(Label)
    mailTitle: Label = null!;
    @property(Label)
    mailContent: Label = null!;
    @property(Label)
    mailTime: Label = null!;

    private mailRecord: MailRecord = null!;

    start() {
        this.btn_claimed?.node.on(Button.EventType.CLICK, this.onClaimed, this);
        this.btn_unclaimed?.node.on(Button.EventType.CLICK, this.onClaimed, this);
    }

    onClaimed() {
        console.log("查看邮件")
        var uic: UICallbacks = {
            onAdded: (node: Node, params: any) => {
                const emailDetail = node.getComponent(EmailDetail);
                if (emailDetail) {
                    emailDetail.initUI(this.mailRecord);
                }
            }
        };
        let uiArgs: any;
        oops.gui.open(UIID.EmailDetail, uiArgs, uic);
    }

    initItem(mailRecord: MailRecord) {
        this.mailRecord = mailRecord;
        if (this.mailRecord.awardState == EmailRewardState.received) {
            this.bg_unclaimed.active = false;
            this.btn_unclaimed.node.active = false;
            this.icon_unclaimed.active = false;
        }

        this.num.string = 'X' + this.mailRecord.rewards.length.toString();
        this.mailTitle.string = this.mailRecord.mailTitle;

        this.mailContent.string = this.checkLabelMaxLength(this.mailRecord.mailContent, 19);
        const date = new Date(this.mailRecord.mailTime * 1000);
        this.mailTime.string = date.toLocaleString();
    }

    checkLabelMaxLength(content: string, maxLength: number) {
        if (content.length > maxLength) {
            return content.substring(0, maxLength) + '...';
        }
        return content;
    }
}


