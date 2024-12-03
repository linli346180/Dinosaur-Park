import { EditBox } from 'cc';
import { Button } from 'cc';
import { _decorator, Component, Node } from 'cc';
import { WalletNetService } from './WalletNet';
import { smc } from '../common/SingletonModuleComp';
import { oops } from '../../../../extensions/oops-plugin-framework/assets/core/Oops';
import { Label } from 'cc';
import { AccountEvent } from '../account/AccountEvent';
const { ccclass, property } = _decorator;

@ccclass('ExchangeWidget')
export class ExchangeWidget extends Component {
    @property(Button)
    private btn_exchange:Button = null!;
    @property(EditBox)
    private edit_amount: EditBox = null!;
    @property(Label)
    private label_rate: Label = null
    @property(Label)
    private gemNum: Label = null

    // 设置兑换比例
    private exchangeRate: number = 99;
    set ExchangeRate(rate: number) {
        this.exchangeRate = rate;
        this.label_rate.string = oops.language.getLangByID('tips_exchange_rate').replace('{0}', rate.toString());
    }

    start() {
        this.btn_exchange.node.on(Button.EventType.CLICK, this.exchange, this);
        this.edit_amount.node.on(EditBox.EventType.TEXT_CHANGED, this.onAmountChanged, this);
        oops.message.on(AccountEvent.CoinDataChange, this.updateUI, this);
    }

    protected onDestroy(): void {
        oops.message.off(AccountEvent.CoinDataChange, this.updateUI, this);
    }   

    onEnable() {
        this.ExchangeRate = this.exchangeRate;
        this.updateUI();
    }

    private updateUI() {
        this.gemNum.string = Math.floor(smc.account.AccountModel.CoinData.gemsCoin).toString();
    }

    private async exchange() {
        const amount = Number(this.edit_amount.string);
        if(amount <= 0) {
            oops.gui.toast(oops.language.getLangByID('tips_exchange_amount_empty'));
            return;
        }
        this.btn_exchange.interactable = false;
        const res = await WalletNetService.createGemsExchange(amount);
        if(res) {
            smc.account.updateCoinData();
            oops.gui.toast(oops.language.getLangByID('tips_exchange_success'));
        }
        this.edit_amount.string = '';
        this.btn_exchange.interactable = true;
    }

    // 限制输入框只能输入数字
    private onAmountChanged(editBox: EditBox) {
        editBox.blur();
        const input = editBox.string;    
        const validAmount = /^\d*$/;
        if (!validAmount.test(input)) {
            editBox.string = input.slice(0, -1);
        }
        const sanitizedInput = input.replace(/[^0-9]/g, '');
        if (sanitizedInput !== input) {
            editBox.string = sanitizedInput;
        }
        editBox.focus();
    }
}


