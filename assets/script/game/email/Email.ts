import { _decorator, Component, Node, Prefab, Button, instantiate } from 'cc';
import { oops } from '../../../../extensions/oops-plugin-framework/assets/core/Oops';
import { UIID } from '../common/config/GameUIConfig';
import { EmailItem } from './EmailItem';
import { EmailNetService } from './EmailNet';
import { EmailEvent, EmailListData, EmailReadState, EmailRewardState, MailRecord } from './EmailDefine';
import { console } from 'inspector';
import { smc } from '../common/SingletonModuleComp';
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

    onLoad(): void {
        this.content.removeAllChildren();
        this.btn_close?.node.on(Button.EventType.CLICK, this.closeUI, this);
        this.btn_onekey?.node.on(Button.EventType.CLICK, this.onOneKey, this);
        oops.message.on(EmailEvent.receiveEmailReward, this.onHandler, this);
    }

    onEnable() {
        this.initUI();
    }

    onDestroy() {
        oops.message.off(EmailEvent.receiveEmailReward, this.onHandler, this);
    }

    private onHandler(event: string, args: any) {
        switch (event) {
            case EmailEvent.receiveEmailReward:
                this.content.children.forEach(child => {
                    const emailItem = child.getComponent(EmailItem);
                    if (emailItem && emailItem.mailRecord.mailRecordId == args) {
                        emailItem.initItem({ ...emailItem.mailRecord, awardState: EmailRewardState.received });
                    }
                });
                break;
        }
    }

    private closeUI() {
        oops.gui.remove(UIID.Email, false);
    }

    private async initUI() {
        const res = await EmailNetService.getEmailList();
        if (res && res.mailList != null) {
            this.noMail.active = res.mailList.length == 0;
            this.updateEmailList(res.mailList);
        }
    }

    // 更新邮件列表
    private updateEmailList(newMailList: MailRecord[]) {
        const currentMailMap = new Map<number, Node>();
        this.content.children.forEach(child => {
            const emailItem = child.getComponent(EmailItem);
            if (emailItem) {
                currentMailMap.set(emailItem.mailRecord.mailRecordId, child);
            } else {
                child.removeFromParent();
            }
        });
        this.content.children.forEach(child => {
            const emailItem = child.getComponent(EmailItem);
            if (emailItem) {
                const mailRecordId = emailItem.mailRecord.mailRecordId;
                const newMailRecord = newMailList.find(mail => mail.mailRecordId === mailRecordId);
                if (newMailRecord) {
                    emailItem.initItem(newMailRecord);
                } else {
                    child.removeFromParent();
                }
            }
        });
        newMailList.forEach(mailRecord => {
            if (!currentMailMap.has(mailRecord.mailRecordId)) {
                this.createEmailItem(mailRecord);
            }
        });
        this.emailsData.mailList = newMailList;
    }

    private createEmailItem(mailRecord: MailRecord) {
        let item = instantiate(this.itemPrefab);
        if (item) {
            item.parent = this.content;
            item.getComponent(EmailItem)?.initItem(mailRecord);
        }
    }

    /** 一键领取 */
    private async onOneKey() {
        const readPromises = [];
        const clampPromises = [];
        let rewardType: number[] = [];
        for (const mailRecord of this.emailsData.mailList) {
            if (mailRecord.readState == EmailReadState.unread) {
                readPromises.push(EmailNetService.readEmail(mailRecord.mailRecordId));
            }
            if (mailRecord.awardState == EmailRewardState.unreceived) {
                clampPromises.push(EmailNetService.clampEmail(mailRecord.mailRecordId, mailRecord.mailConfigId));

                if (mailRecord.rewards != null && mailRecord.rewards.length > 0) {
                    for (const reward of mailRecord.rewards) {
                        if (!rewardType.includes(reward.awardType))
                            rewardType.push(reward.awardType);
                    }
                }
            }
        }

        await Promise.all(readPromises);
        await Promise.all(clampPromises);

        setTimeout(() => {
            this.initUI();
            for (const type of rewardType) {
                smc.account.OnClaimAward(type);
            }
         }, 500);
    }
}