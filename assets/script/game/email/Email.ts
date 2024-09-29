import { _decorator, Component, Node, Prefab, Button, instantiate } from 'cc';
import { oops } from '../../../../extensions/oops-plugin-framework/assets/core/Oops';
import { UIID } from '../common/config/GameUIConfig';
import { EmailNetService } from './EmailNet';
import { EmailEvent, EmailListData, MailRecord } from './EmailDefine';
import { EmailItem } from './EmailItem';
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
        this.initUI();
    }

    protected onDestroy(): void {
        oops.message.off(EmailEvent.EmailUpdate, this.onHandler, this);
    }

    private onHandler(event: string, args: any) {
        switch (event) {
            case EmailEvent.EmailUpdate:
                this.initUI();
                break;
        }
    }

    closeUI() {
        oops.gui.remove(UIID.Email);
    }

    initUI() {
        this.content.removeAllChildren();
        EmailNetService.getEmailList().then((res) => {
            if (res) {
                this.noMail.active = res.mailList.length == 0;
                this.emailsData.mailList = res.mailList;
                console.warn("邮件列表:", this.emailsData.mailList.length);
                for (let i = 0; i < this.emailsData.mailList.length; i++) {
                    this.createEmailItem(this.emailsData.mailList[i]);
                }
            }
        });
    }

    createEmailItem(mailRecord: MailRecord) {
        let item = instantiate(this.itemPrefab);
        if (item) {
            item.parent = this.content;
            let emailItem = item.getComponent(EmailItem);
            if (emailItem) {
                emailItem.initItem(mailRecord);
            }
        }
    }

    onOneKey() {
        this.emailsData.mailList.forEach(async (mailRecord) => {
            await EmailNetService.readEmail(mailRecord.mailRecordId);
            await EmailNetService.clampEmail(mailRecord.mailRecordId, mailRecord.mailConfigId);
        });
        this.initUI();
    }
}