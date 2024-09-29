import { _decorator, Component, Node, Button, Label } from 'cc';
import { smc } from '../common/SingletonModuleComp';
import { oops } from '../../../../extensions/oops-plugin-framework/assets/core/Oops';
import { AccountEvent } from '../account/AccountEvent';
import { UIID } from '../common/config/GameUIConfig';
import { Toggle } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('usercenter')
export class usercenter extends Component {
    @property(Label)
    label_title: Label = null!;
    @property(Label)
    label_name: Label = null!;
    @property(Label)
    label_id: Label = null!;
    @property(Label)
    label_email: Label = null!;
    @property(Label)
    label_purse: Label = null!;
    @property(Label)
    label_language: Label = null!;

    @property(Button)
    btn_nickname: Button = null!;
    @property(Button)
    btn_email: Button = null!;
    @property(Button)
    btn_purse: Button = null!;
    @property(Button)
    btn_language: Button = null!;
    @property(Button)
    btn_clsoe: Button = null!;

    @property(Toggle)
    toggle_music: Toggle = null!;
    @property(Toggle)
    toggle_sound: Toggle = null!;

    start() {
        this.initUI();
    
        this.btn_clsoe.node.on(Button.EventType.CLICK, this.CloseUI, this);
        this.btn_nickname.node.on(Button.EventType.CLICK, this.ChangeNickNameClicked, this);
        this.btn_email.node.on(Button.EventType.CLICK, this.ChangeEmailClicked, this);

        this.toggle_music.node.on(Toggle.EventType.TOGGLE, this.onToggleMusic, this);
        this.toggle_sound.node.on(Toggle.EventType.TOGGLE, this.onToggleSound, this);

        oops.message.on(AccountEvent.ChangeNickName, this.onHandler, this);
        oops.message.on(AccountEvent.ChangeEmail, this.onHandler, this);
    }
    onDestroy() {
        oops.message.off(AccountEvent.ChangeNickName, this.onHandler, this);
        oops.message.off(AccountEvent.ChangeEmail, this.onHandler, this);
    }

    initUI() {
        const userData = smc.account.AccountModel.user;
        this.label_id.string = userData.id.toString();
        this.label_name.string = userData.name;
        this.label_email.string = userData.email;

        this.toggle_music.isChecked = oops.audio.switchMusic;
        this.toggle_sound.isChecked = oops.audio.switchEffect;
    }

    private onHandler(event: string, args: any) {
        switch (event) {
            case AccountEvent.ChangeNickName:
                this.label_name.string = args;
                break;
            case AccountEvent.ChangeEmail:
                this.label_email.string = args;
                break;
            default:
                break;
        }
    }

    ChangeNickNameClicked() {
        smc.account.changeNickname("new nickname");
    }

    ChangeEmailClicked() {
        smc.account.changeEmail("123@email.com");
    }

    onToggleMusic(toggle: Toggle) {
        console.log("onToggleMusic", toggle.isChecked);
        oops.audio.switchMusic = toggle.isChecked;
        oops.audio.save();
        if (toggle.isChecked) {
            oops.audio.playMusicLoop("audios/nocturne");
        } else {
            oops.audio.stopMusic();
        }
    }

    onToggleSound(toggle: Toggle) {
        console.log("onToggleSound", toggle.isChecked);
        oops.audio.switchEffect = toggle.isChecked;
        oops.audio.save();
    }

    CloseUI() {
        oops.gui.remove(UIID.User);
    }
}


