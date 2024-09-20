import { _decorator, Component, Node, Button } from 'cc';
import { oops } from '../../../../extensions/oops-plugin-framework/assets/core/Oops';
import { UIID } from '../common/config/GameUIConfig';
const { ccclass, property } = _decorator;

@ccclass('homeComp')
export class homeComp extends Component {
    @property(Button)
    btn_gemShop: Button = null!;

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
    start() {
        oops.audio.playMusicLoop("audios/nocturne");
        this.btn_gemShop?.node.on(Button.EventType.CLICK, () => { oops.gui.open(UIID.GemShop) }, this);
        this.btn_user?.node.on(Button.EventType.CLICK, () => { oops.gui.open(UIID.User) }, this);
        this.btn_email?.node.on(Button.EventType.CLICK, () => { oops.gui.open(UIID.Email) }, this);
        this.btn_task?.node.on(Button.EventType.CLICK, () => { oops.gui.open(UIID.Task) }, this);
        this.btn_rank?.node.on(Button.EventType.CLICK, () => { oops.gui.open(UIID.RankUI) }, this);
        this.btn_book?.node.on(Button.EventType.CLICK, () => { oops.gui.open(UIID.Book) }, this);
        this.btn_revivei?.node.on(Button.EventType.CLICK, () => { oops.gui.open(UIID.Revive) }, this);
        this.btn_store?.node.on(Button.EventType.CLICK, () => { oops.gui.open(UIID.STBShop) }, this);
        this.btn_hatch?.node.on(Button.EventType.CLICK, () => { oops.gui.open(UIID.Hatch) }, this);
        this.btn_invite?.node.on(Button.EventType.CLICK, () => { oops.gui.open(UIID.Invite) }, this);
    }

}