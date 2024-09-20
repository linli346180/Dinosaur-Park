import { _decorator, Component, Node, Button } from 'cc';
import { oops } from '../../../../extensions/oops-plugin-framework/assets/core/Oops';
import { UIID } from '../common/config/GameUIConfig';
import { InviteNetService } from './InviteNet';
import { Prefab } from 'cc';
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
    inviteList: Node = null!;
    @property(Node)
    nofriend: Node = null!;

    private inviteLink: string = "";

    start() {
        this.btn_close?.node.on(Button.EventType.CLICK, this.closeUI, this);
        this.btn_invite?.node.on(Button.EventType.CLICK, this.invite, this);
        this.btn_copy?.node.on(Button.EventType.CLICK, this.copy, this);

        InviteNetService.getCopyLink().then((res) => {
            this.inviteLink = res.copyInviteLinkReturn.inviteLink;
        });
        InviteNetService.getInviteRewardConfig();
        this.initUI();
    }

    async initUI() {
        let respose = await InviteNetService.getInviteList();
    }

    closeUI() {
        oops.gui.remove(UIID.Invite, false);
    }

    invite() {
        console.log("invite");
    }

    copy() {
        console.log("copy");
    }
}