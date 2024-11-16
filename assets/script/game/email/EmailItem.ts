import { _decorator, Component, Node, Button, Label } from 'cc';
import { oops } from '../../../../extensions/oops-plugin-framework/assets/core/Oops';
import { UIID } from '../common/config/GameUIConfig';
import { EmailRewardState, MailRecord } from './EmailDefine';
import { UICallbacks } from '../../../../extensions/oops-plugin-framework/assets/core/gui/layer/Defines';
import { EmailDetail } from './EmailDetail';
import { StringUtil } from '../common/utils/StringUtil';
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
    @property(Button)
    btn_detail: Button = null!;

    @property(Label)
    mailTitle: Label = null!;
    @property(Label)
    mailContent: Label = null!;
    @property(Label)
    mailTime: Label = null!;

    mailRecord: MailRecord = null!;

    start() {
        this.btn_detail?.node.on(Button.EventType.CLICK, this.shwoDetail, this);
    }

    shwoDetail() {
        var uic: UICallbacks = {
            onAdded: (node: Node, params: any) => {
                node.getComponent(EmailDetail)?.initUI(this.mailRecord);
            }
        };
        let uiArgs: any;
        oops.gui.open(UIID.EmailDetail, uiArgs, uic);
    }

    initItem(mailRecord: MailRecord) {
        this.mailRecord = mailRecord;

        this.bg_claimed.active = mailRecord.awardState == EmailRewardState.received;
        this.icon_claimed.active = mailRecord.awardState == EmailRewardState.received;
        this.btn_claimed.node.active = mailRecord.awardState == EmailRewardState.received;
        this.bg_unclaimed.active = mailRecord.awardState == EmailRewardState.unreceived;
        this.btn_unclaimed.node.active = mailRecord.awardState == EmailRewardState.unreceived;
        this.icon_unclaimed.active = mailRecord.awardState == EmailRewardState.unreceived;

        if (this.mailRecord.rewards != null && this.mailRecord.rewards.length > 0) {
            this.num.string = 'X' + this.mailRecord.rewards.length.toString();
        }

        this.mailTitle.string = this.mailRecord.mailTitle;
        this.mailContent.string = this.checkLabelMaxLength(this.mailRecord.mailContent, 19);
        const date = new Date(this.mailRecord.mailTime * 1000);
        this.mailTime.string = StringUtil.formatTimestamp(this.mailRecord.mailTime);
    }

    checkLabelMaxLength(content: string, maxLength: number) {
        if (content.length > maxLength) {
            return content.substring(0, maxLength) + '...';
        }
        return content;
    }
}