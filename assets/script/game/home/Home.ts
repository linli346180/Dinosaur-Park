import { _decorator, Component, Node, Button, Animation } from 'cc';
import { oops } from '../../../../extensions/oops-plugin-framework/assets/core/Oops';
import { UIID } from '../common/config/GameUIConfig';
import { AccountEvent } from '../account/AccountEvent';
import { tween } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('HomeView')
export class HomeView extends Component {
    @property(Button)
    btn_user: Button = null!;
    @property(Button)
    btn_email: Button = null!;
    @property(Button)
    btn_task: Button = null!;
    @property(Button)
    btn_rank: Button = null!;
    @property(Button)
    btn_book: Button = null!;

    @property(Button)
    btn_revivei: Button = null!;
    @property(Button)
    btn_store: Button = null!;
    @property(Button)
    btn_hatch: Button = null!;
    @property(Button)
    btn_invite: Button = null!;

    @property(Node)
    goldAnimNode: Node = null!;
    @property(Node)
    goldAnimEndNode: Node = null!;
    @property(Node)
    goldAnimBeginNode: Node = null!;

    start() {
        oops.audio.playMusicLoop("audios/nocturne");
        this.btn_user?.node.on(Button.EventType.CLICK, () => { oops.gui.open(UIID.User) }, this);
        this.btn_email?.node.on(Button.EventType.CLICK, () => { oops.gui.open(UIID.Email) }, this);
        this.btn_task?.node.on(Button.EventType.CLICK, () => { oops.gui.open(UIID.Task) }, this);
        this.btn_rank?.node.on(Button.EventType.CLICK, () => { oops.gui.open(UIID.RankUI) }, this);
        this.btn_book?.node.on(Button.EventType.CLICK, () => { oops.gui.open(UIID.Book) }, this);
        this.btn_revivei?.node.on(Button.EventType.CLICK, () => { oops.gui.open(UIID.Revive) }, this);
        this.btn_store?.node.on(Button.EventType.CLICK, () => { oops.gui.open(UIID.STBShop) }, this);
        this.btn_hatch?.node.on(Button.EventType.CLICK, () => { oops.gui.open(UIID.Hatch) }, this);
        this.btn_invite?.node.on(Button.EventType.CLICK, () => { oops.gui.open(UIID.Invite) }, this);

        oops.message.on(AccountEvent.UserCollectGold, this.onHandler, this);
    }

    private onHandler(event: string, args: any) {
        switch (event) {
            case AccountEvent.UserCollectGold:
                this.showGoldAnim();
                break
        }
    }

    private showGoldAnim() {
        this.goldAnimNode.active = true;
        this.goldAnimNode.getComponent(Animation)?.play();
        tween(this.goldAnimNode)
            .delay(0.5)  // 延迟0.5秒
            .to(0.5, { worldPosition: this.goldAnimEndNode.worldPosition })
            .call(() => { 
                this.goldAnimNode.active = false;
                this.goldAnimNode.setWorldPosition(this.goldAnimBeginNode.worldPosition); })
            .start();
    }
}