import { Button } from 'cc';
import { _decorator, Component, Node } from 'cc';
import { oops } from '../../../../extensions/oops-plugin-framework/assets/core/Oops';
import { UIID } from '../common/config/GameUIConfig';
import { Label } from 'cc';
import { smc } from '../common/SingletonModuleComp';
import { rootCertificates } from 'tls';
import { WalletNetService } from './WalletNet';
import { WithdrawConfig, WithdrawRequest } from './WalletDefine';
import { EditBox } from 'cc';
import DropDown from '../common/DropDown/DropDown';
const { ccclass, property } = _decorator;

@ccclass('WalletView')
export class WalletView extends Component {
    @property(Button)
    private btn_close: Button = null!;
    @property(Label)
    private userBalance: Label = null!;
    @property(Button)
    private btn_detail: Button = null!;
    @property(Button)
    private btn_checkemail: Button = null!;
    @property(Button)
    private btn_withdrawal: Button = null!;
    @property(Label)
    private codeLabel: Label = null!;
    @property(EditBox)
    private walletaddress: EditBox = null!;
    @property(EditBox)
    private emailCode: EditBox = null!;
    @property(EditBox)
    private edit_amount: EditBox = null!;
    @property({ type: DropDown })
    private DropDown: DropDown = null!;
    @property(Label)
    handlingFee: Label = null!;

    // 验证码发送间隔
    private sendInterval: number = 60;
    private timeoutId: number | null = null;

    onLoad() {
        this.btn_close?.node.on(Button.EventType.CLICK, this.closeUI, this);
        this.btn_detail?.node.on(Button.EventType.CLICK, this.showDetail, this);
        this.btn_checkemail?.node.on(Button.EventType.CLICK, this.checkEmail, this);
        this.btn_withdrawal?.node.on(Button.EventType.CLICK, this.withdrawal, this);

        this.walletaddress.string = oops.storage.get("walletaddress", '');
        this.DropDown.selectedIndex = oops.storage.getNumber("purseType", 1);

        this.edit_amount.node.on(EditBox.EventType.TEXT_CHANGED, this.onAmountChanged, this);
    }

    onEnable() {
        this.initUI();
    }

    private closeUI() {
        oops.gui.remove(UIID.Wallet, false)
    }

    private async initUI() {
        const res = await WalletNetService.getWithdrawInfo();
        if (res && res.withdrawInfo) {
            const info: WithdrawConfig = res.withdrawInfo;
            this.userBalance.string = info.userBalance;
            this.handlingFee.string = info.handlingFee;
            this.edit_amount.placeholder = `${oops.language.getLangByID('tips_withdrawal_amount_min')}${info.uMiniWithdraw}USDT`;
        }
    }

    onAmountChanged(editBox: EditBox) {
        editBox.blur(); // 先失去焦点，否则无法修改输入框的值
        const input = editBox.string;
        console.log(`输入金额: ${input}`);

        // 允许的金额格式：整数或小数，小数点后最多四位
        const validAmount = /^\d*\.?\d{0,5}$/;

        // 如果输入不符合金额格式，则移除最后一个字符
        if (!validAmount.test(input)) {
            console.log('输入不符合金额格式');
            editBox.string = input.slice(0, -1);
        }

        // 进一步验证，确保输入的内容只包含数字和一个小数点
        const sanitizedInput = input.replace(/[^0-9.]/g, '');
        if (sanitizedInput !== input) {
            console.log('输入不符合金额格式2');
            editBox.string = sanitizedInput;
        }

        editBox.focus();    // 重新获取焦点
    }

    /** 显示提现明细 */
    private async showDetail() {
        oops.gui.open(UIID.WalletDetail);
    }

    /** 获取邮箱验证码 */
    private async checkEmail() {
        const userEmail = smc.account.AccountModel.userData.email;
        console.log(`获取邮箱验证码: ${userEmail}`);
        if (userEmail && userEmail.trim() !== '') {
            this.btn_checkemail.interactable = false;
            const res = await WalletNetService.sendEmailCode(userEmail);
            if (res) {
                oops.gui.toast(oops.language.getLangByID('tips_emailcode_sentsuccess'));
                this.showInterval();
            } else {
                this.btn_checkemail.interactable = true;
            }
        } else {
            oops.gui.open(UIID.EmailVerify);
        }
    }

    /** 显示倒计时 */
    showInterval() {
        this.sendInterval = 60;
        this.btn_checkemail.interactable = false;
        this.codeLabel.string = `${this.sendInterval}s`;
        this.startCountdown();
    }

    startCountdown() {
        if (this.sendInterval > 0) {
            this.timeoutId = window.setTimeout(() => {
                this.sendInterval--;
                if (this.sendInterval <= 0) {
                    this.btn_checkemail.interactable = true;
                    this.codeLabel.string = oops.language.getLangByID('tips_emailcode_get');
                } else {
                    this.codeLabel.string = `${this.sendInterval}s`;
                    this.startCountdown();
                }
            }, 1000);
        }
    }

    private async withdrawal() {
        const address = this.walletaddress.string.trim();
        const emailCode = this.emailCode.string.trim();
        const purseType = this.DropDown.selectedIndex;
        const amount = this.edit_amount.string.trim();
        console.log(`提现信息: ${address}, ${emailCode}, ${purseType + 1}, ${amount}`);
        if (address === '') {
            oops.gui.toast(oops.language.getLangByID('tips_Wallet_address_empty'));
            return;
        }
        if (emailCode === '') {
            oops.gui.toast(oops.language.getLangByID('tips_emailcode_empty'));
            return;
        }
        if (amount === '') {
            oops.gui.toast(oops.language.getLangByID('tips_withdrawal_amount_empty'));
            return;
        }
        const parsedAmount = parseFloat(amount);
        if (isNaN(parsedAmount) || parsedAmount <= 0) {
            oops.gui.toast(oops.language.getLangByID('tips_withdrawal_amount_empty'));
            return;
        }
        oops.storage.set("walletaddress", address);
        oops.storage.set("purseType", purseType);

        let request: WithdrawRequest = {
            verificationCode: '',
            purseUrl: '',
            purseType: 0,
            withdrawAmount: 0
        }
        const res = await WalletNetService.createWithdrawRecord(request);
        if (res) {
            oops.gui.toast(oops.language.getLangByID('tips_withdrawal_sucess'));
            smc.account.updateCoinData();
            this.initUI();
        }
    }
}