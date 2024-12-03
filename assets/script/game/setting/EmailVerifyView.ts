import { Label } from 'cc';
import { Button } from 'cc';
import { EditBox } from 'cc';
import { _decorator, Component, Node } from 'cc';
import { oops } from '../../../../extensions/oops-plugin-framework/assets/core/Oops';
import { UIID } from '../common/config/GameUIConfig';
import { WalletNetService } from '../wallet/WalletNet';
import { smc } from '../common/SingletonModuleComp';
import { GameEvent } from '../common/config/GameEvent';
import { AccountEvent } from '../account/AccountEvent';
import { Prefab } from 'cc';
import { EventType, InputMode } from '../keyboard/KeyboardDefine';
import { instantiate } from 'cc';
import Keyboard from '../keyboard/Keyboard';
import { UICallbacks } from '../../../../extensions/oops-plugin-framework/assets/core/gui/layer/Defines';
const { ccclass, property } = _decorator;

@ccclass('EmailVerifyView')
export class EmailVerifyView extends Component {
    @property(Button)
    private btn_send: Button = null;
    @property(Label)
    private codeLabel: Label = null;
    @property(Button)
    private btn_commit: Button = null;
    @property(Button)
    private btn_close: Button = null;
    @property(Label)
    private editBoxEmailLabel: Label = null;
    @property(Label)
    private editBoxCodeLabel: Label = null;
    public onClickType:number = 0;


    // 验证码发送间隔
    private sendInterval: number = 60;
    private timeoutId: number | null = null;

    onLoad() {
        this.btn_send.node.on(Button.EventType.CLICK, this.getEmailCode, this);
        this.btn_commit.node.on(Button.EventType.CLICK, this.checkUserEmail, this);
        this.btn_close.node.on(Button.EventType.CLICK, this.closeUI, this);
    }

    onEnable() {

    }

    onDestroy() {
        if (this.timeoutId !== null) {
            clearTimeout(this.timeoutId);
            this.timeoutId = null;
        }  
    }

    closeUI() {
        oops.gui.remove(UIID.EmailVerify, false);
    }

    /** 获取邮箱验证码 */
    async getEmailCode() {
        const userEmail = this.editBoxEmailLabel.string.trim();
        if (userEmail === '') {
            oops.gui.toast(oops.language.getLangByID("tips_email_empty"));
            return;
        }
        if (!this.checkEmailFormat(userEmail)) {
            oops.gui.toast(oops.language.getLangByID("tips_email_inputerror"));
            return;
        }
        this.btn_send.interactable = false;
        WalletNetService.sendEmailCode(userEmail).then(res => {
            if (res) {
                oops.gui.toast(oops.language.getLangByID("tips_emailcode_sentsuccess"));
                this.showInterval();
            } else {
                this.btn_send.interactable = true;
            }
        });
    }

    /** 显示倒计时 */
    showInterval() {
        this.sendInterval = 60;
        this.btn_send.interactable = false;
        this.codeLabel.string = `${this.sendInterval}s`;
        this.startCountdown();
    }

    startCountdown() {
        if (this.sendInterval > 0) {
            this.timeoutId = window.setTimeout(() => {
                this.sendInterval--;
                if (this.sendInterval <= 0) {
                    this.btn_send.interactable = true;
                    this.codeLabel.string = oops.language.getLangByID("tips_emailcode_get");
                } else {
                    this.codeLabel.string = `${this.sendInterval}s`;
                    this.startCountdown();
                }
            }, 1000);
        }
    }

    /** 邮箱认证 */
    async checkUserEmail() {
        const userEmail = this.editBoxEmailLabel.string.trim();
        if (userEmail === '') {
            oops.gui.toast(oops.language.getLangByID("tips_email_empty"));
            return;
        }
        const code = this.editBoxEmailLabel.string.trim();
        if (code === '') {
            oops.gui.toast(oops.language.getLangByID("tips_emailcode_empty"));
            return;
        }
        if (!this.checkEmailFormat(userEmail)) {
            oops.gui.toast(oops.language.getLangByID("tips_email_inputerror"));
            return;
        }
        this.btn_commit.interactable = false;
        const res = await WalletNetService.checkUserEmail(code, userEmail);
        if (res) {
            oops.gui.toast(oops.language.getLangByID("tips_email_verification_success"));
            oops.gui.remove(UIID.EmailVerify);
            smc.account.AccountModel.userData.email = userEmail;
            oops.message.dispatchEvent(AccountEvent.ChangeEmail);
        } else {
            this.btn_commit.interactable = true;
        }
    }

    // 检查邮箱格式
    checkEmailFormat(email: string): boolean {
        const reg = /^(\w-*\.*)+@(\w-?)+(\.\w{2,})+$/;
        return reg.test(email);
    }
}