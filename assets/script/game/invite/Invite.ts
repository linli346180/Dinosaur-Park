import { _decorator, Component, Node, Button, Prefab } from 'cc';
import { oops } from '../../../../extensions/oops-plugin-framework/assets/core/Oops';
import { UIID } from '../common/config/GameUIConfig';
import { InviteNetService } from './InviteNet';
import { InviteDataList } from './InviteData';
import { instantiate } from 'cc';
import { InviteItemView } from './InviteItemView';
const { ccclass, property } = _decorator;

@ccclass('Invite')
export class Invite extends Component {
    @property(Prefab)
    inviteItem: Prefab = null!;
    @property(Button)
    btn_close: Button = null!;
    @property(Button)
    btn_invite: Button = null!;
    @property(Button)
    btn_copy: Button = null!;
    @property(Node)
    inviteContent: Node = null!;
    @property(Node)
    nofriend: Node = null!;

    private inviteLink: string = "";
    private inviteData: InviteDataList = new InviteDataList();

    start() {
        this.btn_close?.node.on(Button.EventType.CLICK, this.closeUI, this);
        this.btn_invite?.node.on(Button.EventType.CLICK, this.openInviteLink, this);
        this.btn_copy?.node.on(Button.EventType.CLICK, this.copyInviteLink, this);
        this.initUI();
    }

    async initUI() {
        // TODO 生成二维码
        InviteNetService.getCopyLink().then((res) => {
            this.inviteLink = res.copyInviteLinkReturn.inviteLink;
            console.log("邀请链接", this.inviteLink);
        });

        // 生成
        InviteNetService.getInviteRewardConfig();

        let res = await InviteNetService.getInviteList();
        if (res) {
            this.inviteData.inviteList = res.inviteList;
            this.nofriend.active = this.inviteData.inviteList.length == 0;
            this.inviteContent.removeAllChildren();
            for (const item of this.inviteData.inviteList) {
                const itemNode = instantiate(this.inviteItem);
                itemNode.setParent(this.inviteContent);
                itemNode.getComponent(InviteItemView)?.initItem(item.inviteeUserName, "item.userIcon");
            }
        }
    }

    closeUI() {
        oops.gui.remove(UIID.Invite);
    }

    openInviteLink() {
        // TODO 调用原生分享
    }

    copyInviteLink() {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(this.inviteLink).then(() => {
                oops.gui.toast("邀请链接已拷贝到剪切板");
            }).catch(err => {
                oops.gui.toast("无法拷贝到剪切板");
            });
        } else {
            oops.gui.toast("当前浏览器不支持 Clipboard API");
        }
    }
}