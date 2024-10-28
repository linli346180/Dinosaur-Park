import { _decorator, Component, Node, Prefab, Button, instantiate } from 'cc';
import { oops } from '../../../../extensions/oops-plugin-framework/assets/core/Oops';
import { UIID } from '../common/config/GameUIConfig';
import { EmailItem } from './EmailItem';
import { EmailNetService } from './EmailNet';
import { EmailEvent, EmailListData, MailRecord } from './EmailDefine';
const { ccclass, property } = _decorator;

@ccclass('EmailView')
export class EmailView extends Component {
    @property(Prefab)
    itemPrefab: Prefab = null!;
    @property(Button)
    btn_close: Button = null!;
    @property(Button)
    btn_onekey: Button = null!;
    @property(Node)
    content: Node = null!;
    @property(Node)
    noMail: Node = null!;
    private emailsData: EmailListData = new EmailListData();

    start() {
        this.btn_close?.node.on(Button.EventType.CLICK, this.closeUI, this);
        this.btn_onekey?.node.on(Button.EventType.CLICK, this.onOneKey, this);
        oops.message.on(EmailEvent.EmailUpdate, this.onHandler, this);
    }

    onEnable() {
        this.initUI();
    }

    onDestroy() {
        oops.message.off(EmailEvent.EmailUpdate, this.onHandler, this);
    }

    private onHandler(event: string, args: any) {
        switch (event) {
            case EmailEvent.EmailUpdate:
                this.initUI();
                break;
        }
    }

    private closeUI() {
        oops.gui.remove(UIID.Email, false);
    }

    private initUI() {
        this.content.removeAllChildren();
        EmailNetService.getEmailList().then((res) => {
            if (res && res.mailList != null) {
                this.noMail.active = res.mailList.length == 0;
                this.emailsData.mailList = res.mailList;
                for (let i = 0; i < this.emailsData.mailList.length; i++) {
                    this.createEmailItem(this.emailsData.mailList[i]);
                }
            }
        });
    }

    private createEmailItem(mailRecord: MailRecord) {
        let item = instantiate(this.itemPrefab);
        if (item) {
            item.parent = this.content;
            let emailItem = item.getComponent(EmailItem);
            if (emailItem) {
                emailItem.initItem(mailRecord);
            }
        }
    }

    private onOneKey() {
        this.emailsData.mailList.forEach(async (mailRecord) => {
            await EmailNetService.readEmail(mailRecord.mailRecordId);
            await EmailNetService.clampEmail(mailRecord.mailRecordId, mailRecord.mailConfigId);
        });
        this.initUI();
    }
}