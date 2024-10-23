import { _decorator, Component, Node, Button, Prefab, Sprite, Texture2D, ImageAsset, SpriteFrame, instantiate, assetManager } from 'cc';
import { oops } from '../../../../extensions/oops-plugin-framework/assets/core/Oops';
import { UIID } from '../common/config/GameUIConfig';
import { InviteNetService } from './InviteNet';
import { InviteDataList } from './InviteData';
import { InviteItemView } from './InviteItemView';
import qr from 'qrcode-generator';

const { ccclass, property } = _decorator;

/** 邀请界面 */
@ccclass('InviteVeiw')
export class InviteVeiw extends Component {
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
    @property(Sprite)
    icon: Sprite = null!;

    private inviteLink: string = "";
    private inviteData: InviteDataList = new InviteDataList();

    start() {
        this.btn_close?.node.on(Button.EventType.CLICK, this.closeUI, this);
        this.btn_invite?.node.on(Button.EventType.CLICK, this.openInviteLink, this);
        this.btn_copy?.node.on(Button.EventType.CLICK, this.copyInviteLink, this);
        this.initQRCode()
    }

    onEnable() {
        this.initInviteList();
    }

    closeUI() {
        oops.gui.remove(UIID.Invite, false);
    }

    private initQRCode() {
        InviteNetService.getCopyLink().then((res) => {
            if (res && res.copyInviteLinkReturn.inviteLink != null) {
                this.inviteLink = res.copyInviteLinkReturn.inviteLink;
                this.generateQRCode(this.inviteLink);
            }
        });
    }

    private initInviteList() {
        this.inviteContent.removeAllChildren();
        InviteNetService.getInviteList().then((res) => {
            if (res && res.userInviteDetail != null) {
                this.inviteData.userInviteDetail = res.userInviteDetail;
                this.nofriend.active = this.inviteData.userInviteDetail.length == 0;
                for (const item of this.inviteData.userInviteDetail) {
                    const itemNode = instantiate(this.inviteItem);
                    itemNode.setParent(this.inviteContent);
                    itemNode.getComponent(InviteItemView)?.initItem(item.inviteeUserName, item.avatarUrl);
                }
            }
        })
    }

    private openInviteLink() {
        let url = 'https://t.me/share/url?url=' + this.inviteLink;
        window.open(url);
    }

    private copyInviteLink() {
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

    private generateQRCode(qrCodeUrl: string) {
        const url = qrCodeUrl;
        const qrCode = qr(0, 'M');
        qrCode.addData(url);
        qrCode.make();

        const dataURL = qrCode.createDataURL(4, 4);
        const img = new Image();
        img.src = dataURL;

        assetManager.loadRemote(dataURL, { ext: '.png' }, (err, imageAsset: ImageAsset) => {
            if (!err) {
                const spriteFrame = new SpriteFrame();
                const texture = new Texture2D();
                texture.image = imageAsset;
                spriteFrame.texture = texture;
                this.icon.spriteFrame = spriteFrame;
            }
        });
    }
}