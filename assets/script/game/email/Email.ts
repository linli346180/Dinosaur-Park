
import { Button } from 'cc';
import { _decorator, Component, Node } from 'cc';
import { oops } from '../../../../extensions/oops-plugin-framework/assets/core/Oops';
import { UIID } from '../common/config/GameUIConfig';
import { EmailNetService } from './EmailNet';
import { EmailEvent, EmailListData, MailRecord } from './EmailDefine';
import { Prefab } from 'cc';
import { instantiate } from 'cc';
import { EmailItem } from './EmailItem';
const { ccclass, property } = _decorator;

@ccclass('Email')
export class Email extends Component {
    @property(Node)
    content: Node = null!;
    @property(Prefab)
    itemPrefab: Prefab = null!;
    @property(Button)
    btn_onekey: Button = null!;

    private btn_close: Button = null!;
    private emailsData: EmailListData = new EmailListData();

    start() {
        this.btn_close = this.node.getChildByName("btn_close")?.getComponent(Button)!;
        this.btn_close?.node.on(Button.EventType.CLICK, this.closeUI, this);
        this.btn_onekey?.node.on(Button.EventType.CLICK, this.onOneKey, this);
        oops.message.on(EmailEvent.EmailUpdate, this.onHandler, this);
        this.initUI();
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
        EmailNetService.getEmailList().then((emailList) => {
            if (emailList) {
                this.emailsData = emailList;
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