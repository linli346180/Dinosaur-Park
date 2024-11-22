import { _decorator, Component, Node, Button, Label, Toggle, Sprite, assetManager, ImageAsset, Texture2D, SpriteFrame } from 'cc';
import { smc } from '../common/SingletonModuleComp';
import { oops } from '../../../../extensions/oops-plugin-framework/assets/core/Oops';
import { AccountEvent } from '../account/AccountEvent';
import { UIID } from '../common/config/GameUIConfig';
import { AccountNetService } from '../account/AccountNet';
import { tonConnect } from '../wallet/TonConnect';
import { sys } from 'cc';
const { ccclass, property } = _decorator;

interface UserConfigData {
    typeKey: string,
    languageKey: string,
    description: string,
}

@ccclass('usercenter')
export class usercenter extends Component {
    @property(Button)
    private btn_clsoe: Button = null!;

    @property(Sprite)
    private avatar: Sprite = null!;
    @property(Label)
    private label_name: Label = null!;
    @property(Label)
    private label_id: Label = null!;
    @property(Label)
    private label_email: Label = null!;
    @property(Label)
    private label_purse: Label = null!;
    @property(Label)
    private label_language: Label = null!;

    @property(Button)
    private btn_email: Button = null!;
    @property(Button)
    private btn_purse: Button = null!;
    @property(Button)
    private btn_language: Button = null!;
    @property(Button)
    private btn_mailbox: Button = null!;
    @property(Button)
    private btn_introduce: Button = null!;
    @property(Button)
    private btn_guide: Button = null!;
    @property(Button)
    private btn_service: Button = null!;

    @property(Toggle)
    private toggle_music: Toggle = null!;
    @property(Toggle)
    private toggle_sound: Toggle = null!;

    private configData: UserConfigData[] = [];

    onLoad() {
        console.log("onLoad 开始")
        AccountNetService.getUserConfig('external_link').then((res) => {
            console.log("获取配置")
            if (res && res.languageConfigArr) {
                this.configData = res.languageConfigArr;
            }
        });

        this.btn_clsoe.node.on(Button.EventType.CLICK, this.closeUI, this);
        this.btn_email.node.on(Button.EventType.CLICK, this.changeEmail, this);
        this.btn_language.node.on(Button.EventType.CLICK, this.changeLanguage, this);
        this.btn_purse?.node.on(Button.EventType.CLICK, this.connectPurse, this);
        this.btn_mailbox?.node.on(Button.EventType.CLICK, this.openMailBox, this);
        this.btn_introduce?.node.on(Button.EventType.CLICK, this.onIntroduce, this);
        this.btn_guide?.node.on(Button.EventType.CLICK, this.onGuide, this);
        this.btn_service?.node.on(Button.EventType.CLICK, this.onService, this);
        this.toggle_music.node.on(Toggle.EventType.TOGGLE, this.onToggleMusic, this);
        this.toggle_sound.node.on(Toggle.EventType.TOGGLE, this.onToggleSound, this);

        oops.message.on(AccountEvent.ChangeEmail, this.onHandler, this);
        oops.message.on(AccountEvent.ChangeLanguage, this.onHandler, this);

        tonConnect.addListener((isConnected: boolean)=>{
            this.label_purse.string = tonConnect.walletConfig.address;
        });
        console.log("onLoad 结束")
    }

    onEnable() {
        console.log("onEnable")
        this.initUI();
    }

    private initUI() {
        const userData = smc.account.AccountModel.userData;
        this.label_id.string = userData.id.toString();
        this.label_name.string = userData.name;
        this.label_email.string = userData.email;
        this.toggle_music.isChecked = oops.audio.switchMusic;
        this.toggle_sound.isChecked = oops.audio.switchEffect;
        this.label_language.string = oops.language.languageNames[oops.language.current];

        this.label_purse.string = tonConnect.walletConfig.address;
        this.label_email.string = smc.account.AccountModel.userData.email;
        // TODO: 加载图片
        // this.loadAvatar(userData.avatarPath);
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
            case AccountEvent.ChangeEmail:
            case AccountEvent.ChangeLanguage:
                this.initUI();
                break;
        }
    }

    changeEmail() {
        oops.gui.open(UIID.EmailVerify);
    }

    changeLanguage() {
        oops.gui.open(UIID.LanguageUI);
    }

    closeUI() {
        oops.gui.remove(UIID.User, false);
    }

    connectPurse() {
        tonConnect.connectTonWallet();
    }

    openMailBox() {
        oops.gui.open(UIID.Email);
        this.closeUI();
        this.redDotReaded(this.btn_mailbox.node);
    }

    onIntroduce() {
        window.open('https://admin.starbeastpark.com/');
        
    }

    onGuide() { 

    }

    onService() { 
        const serviceKey = `customer_service${Math.floor(Math.random() * 2) + 1}`;
        console.log("serviceKey", serviceKey)
        this.customerService(serviceKey);
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


    private customerService(kye: string) {
        for (const item of this.configData) {
            if (item.languageKey === kye) {
                window.open(item.description);

                if(sys.os == sys.OS.IOS) {

                } 
                // const WebApp = (window as any).Telegram.WebApp;
                // WebApp.openLink(item.description);
            }
        }
    }

    private redDotReaded(targetNode: Node) {
        const redDot = targetNode.getChildByName("reddot");
        if (redDot) {
            redDot.active = false;
        }
    }
}