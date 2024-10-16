import { _decorator, Component, Node, Button, Prefab, Sprite, Texture2D, ImageAsset, SpriteFrame,instantiate } from 'cc';

import { oops } from '../../../../extensions/oops-plugin-framework/assets/core/Oops';
import { UIID } from '../common/config/GameUIConfig';
import { InviteNetService } from './InviteNet';
import { InviteDataList } from './InviteData';
import { InviteItemView } from './InviteItemView';
import { assetManager } from 'cc';

// TODO 导致项目无法正常运行浏览器预览，需要注释掉
// import QRCode from 'qrcode';

const { ccclass, property } = _decorator;

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
        this.initUI();
    }

    async initUI() {
        // TODO 生成二维码
        InviteNetService.getCopyLink().then((res) => {
            this.inviteLink = res.copyInviteLinkReturn.inviteLink;
            console.log("邀请链接", this.inviteLink);
            this.generateQRCode(this.inviteLink);
        });

        let res = await InviteNetService.getInviteList();
        if (res) {
            this.inviteData.userInviteDetail = res.userInviteDetail;
            this.nofriend.active = this.inviteData.userInviteDetail.length == 0;
            this.inviteContent.removeAllChildren();
            for (const item of this.inviteData.userInviteDetail) {
                const itemNode = instantiate(this.inviteItem);
                itemNode.setParent(this.inviteContent);
                itemNode.getComponent(InviteItemView)?.initItem(item.inviteeUserName, item.avatarUrl);
            }
        }
    }

    closeUI() {
        oops.gui.remove(UIID.Invite);
    }

    openInviteLink() {
        // TODO 调用原生分享s
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


    // 生成二维码
    async generateQRCode(text: string) {
        // try {
        //     const url = await QRCode.toDataURL(text);
        //     const image = new Image();
        //     image.src = url;
        //     image.onload = () => {
        //         const texture = new Texture2D();
        //         const imageAsset = new ImageAsset(image);
        //         texture.image = imageAsset;
        //         this.icon.spriteFrame = new SpriteFrame();
        //         this.icon.spriteFrame.texture = texture;
        //     };
        // } catch (error) {
        //     console.error('生成二维码失败:', error);
        // }
    }

  
}