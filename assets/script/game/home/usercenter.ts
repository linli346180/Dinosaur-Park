import { _decorator, Component, Node, Button, Label, Toggle, Sprite, assetManager, ImageAsset, Texture2D, SpriteFrame } from 'cc';
import { smc } from '../common/SingletonModuleComp';
import { oops } from '../../../../extensions/oops-plugin-framework/assets/core/Oops';
import { AccountEvent } from '../account/AccountEvent';
import { UserConfigData } from '../account/AccountDefine';
import { UIID } from '../common/config/GameUIConfig';
import { tween } from 'cc';
import { v3 } from 'cc';
import { Vec3 } from 'cc';
import { AccountNetService } from '../account/AccountNet';
import { AnimUtil } from '../common/utils/AnimUtil';
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

    @property(Sprite)
    avatar: Sprite = null!;

    @property(Button)
    btn_cs01: Button = null!;
    @property(Button)
    btn_cs02: Button = null!;

    private configData: UserConfigData[] = [];

    async onEnable() {
        AnimUtil.playAnim_Scale(this.node);

        // 获取客服链接
        const res = await AccountNetService.getUserConfig('external_link');
        if (res && res.languageConfigArr) { this.configData = res.languageConfigArr; }
    }

    start() {
        this.initUI();

        this.btn_clsoe.node.on(Button.EventType.CLICK, this.CloseUI, this);
        this.btn_nickname.node.on(Button.EventType.CLICK, this.ChangeNickNameClicked, this);
        this.btn_email.node.on(Button.EventType.CLICK, this.ChangeEmailClicked, this);
        this.btn_language.node.on(Button.EventType.CLICK, this.ChangeLanguageClicked, this);
        this.btn_cs01.node.on(Button.EventType.CLICK, () => this.customerService('customer_service1'), this);
        this.btn_cs02.node.on(Button.EventType.CLICK, () => this.customerService('customer_service2'), this);

        this.toggle_music.node.on(Toggle.EventType.TOGGLE, this.onToggleMusic, this);
        this.toggle_sound.node.on(Toggle.EventType.TOGGLE, this.onToggleSound, this);

        console.log("显示UI");
        oops.message.on(AccountEvent.ChangeNickName, this.onHandler, this);
        oops.message.on(AccountEvent.ChangeEmail, this.onHandler, this);
        oops.message.on(AccountEvent.ChangeLanguage, this.onHandler, this);
    }

    onDestroy() {
        console.log("销毁UI");
        oops.message.off(AccountEvent.ChangeNickName, this.onHandler, this);
        oops.message.off(AccountEvent.ChangeEmail, this.onHandler, this);
        oops.message.off(AccountEvent.ChangeLanguage, this.onHandler, this);
    }

    initUI() {
        const userData = smc.account.AccountModel.user;
        this.label_id.string = userData.id.toString();
        this.label_name.string = userData.name;
        this.label_email.string = userData.email;
        this.toggle_music.isChecked = oops.audio.switchMusic;
        this.toggle_sound.isChecked = oops.audio.switchEffect;
        this.label_language.string = oops.language.languageNames[oops.language.current];
        this.loadAvatar(userData.avatarPath);
    }

    private loadAvatar(url: string) {
        if (!url || url.length === 0) {
            return;
        }

        assetManager.loadRemote<ImageAsset>(url, (err, imageAsset) => {
            if (err) {
                console.error('Failed to load avatar:', err);
                return;
            }
            const texture = new Texture2D();
            texture.image = imageAsset;
            const spriteFrame = new SpriteFrame();
            spriteFrame.texture = texture;
            this.avatar.spriteFrame = spriteFrame;
        });
    }

    private onHandler(event: string, args: any) {
        switch (event) {
            case AccountEvent.ChangeNickName:
                this.label_name.string = args;
                break;
            case AccountEvent.ChangeEmail:
                this.label_email.string = args;
                break;
            case AccountEvent.ChangeLanguage:
                this.label_language.string = oops.language.languageNames[oops.language.current];
                break;
            default:
                break;
        }
    }

    ChangeNickNameClicked() {
        // smc.account.changeNickname("new nickname");
    }

    ChangeEmailClicked() {
        // smc.account.changeEmail("123@email.com");
    }

    ChangeLanguageClicked() {
        oops.gui.open(UIID.LanguageUI);
    }

    onToggleMusic(toggle: Toggle) {
        oops.audio.switchMusic = toggle.isChecked;
        oops.audio.save();
        if (toggle.isChecked) {
            oops.audio.playMusicLoop("audios/nocturne");
        } else {
            oops.audio.stopMusic();
        }
    }

    onToggleSound(toggle: Toggle) {
        oops.audio.switchEffect = toggle.isChecked;
        oops.audio.save();
    }

    CloseUI() {
        oops.gui.remove(UIID.User, false);
    }

    private customerService(kye: string) {
        for(const item of this.configData) {
            if(item.languageKey === kye) { 
                const WebApp = (window as any).Telegram.WebApp;
                WebApp.openLink(item.description);
            }
        }
    }

}