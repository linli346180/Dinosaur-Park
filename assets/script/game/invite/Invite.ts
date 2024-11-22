import { _decorator, Component, Node, Button, Prefab, Sprite, Texture2D, ImageAsset, SpriteFrame, instantiate, assetManager } from 'cc';
import { oops } from '../../../../extensions/oops-plugin-framework/assets/core/Oops';
import { UIID } from '../common/config/GameUIConfig';
import { InviteNetService } from './InviteNet';
import { InviteItemView } from './InviteItemView';
import qr from 'qrcode-generator';
import { InviteRewardItem } from './InviteRewardItem';
import { InviteRewardConfig } from './InviteData';
import { Label } from 'cc';
import { StringUtil } from '../common/utils/StringUtil';

const { ccclass, property } = _decorator;

/** 邀请界面 */
@ccclass('InviteVeiw')
export class InviteVeiw extends Component {
    @property(Prefab)
    private inviteItem: Prefab = null!;
    @property(Button)
    private btn_close: Button = null!;
    @property(Button)
    private btn_invite: Button = null!;
    @property(Button)
    private btn_copy: Button = null!;
    @property(Node)
    private inviteContent: Node = null!;
    @property(Node)
    private nofriend: Node = null!;
    @property(Sprite)
    private icon: Sprite = null!;

    // 邀请奖励
    @property(Node)
    private rewardContainer: Node = null!;
    @property(Prefab)
    private rewardItem: Prefab = null!;
    @property(Label)
    private inviteNum:Label = null!;

    private inviteLink: string = "";

    onLoad() {
        this.btn_close?.node.on(Button.EventType.CLICK, () => { oops.gui.remove(UIID.Invite, false) }, this);
        this.btn_invite?.node.on(Button.EventType.CLICK, this.openInviteLink, this);
        this.btn_copy?.node.on(Button.EventType.CLICK, this.copyInviteLink, this);

        this.initQRCode();
        this.initRewardList();
    }

    onEnable() {
        this.initInviteList();
    }

    private async initQRCode() {
        try {
            const res = await InviteNetService.getCopyLink();
            if (res && res.copyInviteLinkReturn.inviteLink != null) {
                this.inviteLink = res.copyInviteLinkReturn.inviteLink;
                this.generateQRCode(this.inviteLink);
            }
        } catch (error) {
            console.error("Failed to initialize QR code:", error);
        }
    }

    /** 初始化奖励列表 */
    private async initRewardList() {
        this.rewardContainer.removeAllChildren();
        const res = await InviteNetService.getInviteReward();
        if (res && res.inviteInfo) {
            const inviteInfo = res.inviteInfo;
            let rewardConfig = new InviteRewardConfig();
            rewardConfig.inveteNum = inviteInfo.inviteNum;
            this.inviteNum.string = `${rewardConfig.inveteNum}`;

            for (const item of inviteInfo.getInviteTaskList) {
                rewardConfig.rewards.push({ 
                    id: item.inviteCompleteId,
                    clamed: !item.state,
                    inviteNum: item.requiredNum, 
                    awardNum: item.rewards[0]?.awardQuantity,
                    awardType: StringUtil.combineNumbers(item.rewards[0]?.awardType, item.rewards[0]?.awardResourceId, 2)
                });
            }
            rewardConfig.rewards.sort((a, b) => a.inviteNum - b.inviteNum);
            for (const item of rewardConfig.rewards) {
                const itemNode = instantiate(this.rewardItem);
                if (itemNode) {
                    itemNode.setParent(this.rewardContainer);
                    itemNode.getComponent(InviteRewardItem)?.initItem(rewardConfig.inveteNum, item);
                }
            }
        }
    }

    /** 初始化邀请列表 */
    private async initInviteList() {
        this.inviteContent.removeAllChildren();
        try {
            const res = await InviteNetService.getInviteList();
            if (res && res.userInviteDetail != null) {
                this.nofriend.active = res.userInviteDetail.length == 0;
                for (const item of res.userInviteDetail) {
                    const itemNode = instantiate(this.inviteItem);
                    if (itemNode) {
                        itemNode.setParent(this.inviteContent);
                        itemNode.getComponent(InviteItemView)?.initItem(item.inviteeUserName, item.avatarUrl);
                    }
                }
            }
        } catch (error) {
            console.error("Failed to initialize invite list:", error);
        }
    }

    private openInviteLink() {
        const url = `https://t.me/share/url?url=${this.inviteLink}`;
        console.log('打开邀请链接:', url);
        window.open(url);
        // const WebApp = (window as any).Telegram.WebApp;
        // WebApp.openLink(url);
    }

    private copyInviteLink() {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(this.inviteLink).then(() => {
                oops.gui.toast("invite_tips_copytoclipboard", true);
            }).catch(err => {
                console.error("无法拷贝到剪切板", err);
                // oops.gui.toast("Invite link copied to clipboard fail.");
            });
        } else {
            console.error("当前浏览器不支持 Clipboard API");
            // oops.gui.toast("当前浏览器不支持 Clipboard API");
        }
    }

    private generateQRCode(qrCodeUrl: string) {
        const qrCode = qr(0, 'M');
        qrCode.addData(qrCodeUrl);
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
            } else {
                console.error("Failed to load QR code image:", err);
            }
        });
    }
}