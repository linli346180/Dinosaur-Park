import { Button } from 'cc';
import { _decorator, Component, Node } from 'cc';
import { oops } from '../../../../extensions/oops-plugin-framework/assets/core/Oops';
import { UIID } from '../common/config/GameUIConfig';
import { Label } from 'cc';
import { smc } from '../common/SingletonModuleComp';
import { WalletNetService } from './WalletNet';
import { WithdrawConfig, WithdrawRequest } from './WalletDefine';
import { toggleComp } from '../common/toggleComp';
import { AccountEvent } from '../account/AccountEvent';
import { ExchangeWidget } from './ExchangeWidget';
import { WithdrawWidget } from './WithdrawWidget';
const { ccclass, property } = _decorator;

@ccclass('WalletView')
export class WalletView extends Component {
    @property(Button)
    private btn_close: Button = null!;
    @property(Label)
    private userBalance: Label = null!;
    @property(Button)
    private btn_detail: Button = null!;

    @property(Node)
    private toggleGroup: Node = null!;
    private defaultIndex = 0;

    @property(ExchangeWidget)
    private exchangeWidget: ExchangeWidget = null!;
    @property(WithdrawWidget)
    private withdrawWidget: WithdrawWidget = null!;

    onLoad() {
        this.btn_close?.node.on(Button.EventType.CLICK, this.closeUI, this);
        this.btn_detail?.node.on(Button.EventType.CLICK, this.onDetail, this);

        this.toggleGroup.children.forEach((child, index) => {
            const comp = child.getComponent(toggleComp);
            if (comp) {
                comp.onToggleSelcted = this.onToggleSelcted.bind(this);
            }
        });
        this.onToggleSelcted(this.defaultIndex);
        oops.message.on(AccountEvent.CoinDataChange, this.initCoinData, this);
        this.getWithdrawInfo();
    }

    protected onDestroy(): void {
        oops.message.off(AccountEvent.CoinDataChange, this.initCoinData, this);
    }

    onEnable() {
        this.initCoinData();
    }

    private closeUI() {
        oops.gui.remove(UIID.Wallet, false)
    }

    private initCoinData() {
        this.userBalance.string = `${smc.account.AccountModel.CoinData.usdt}`
    }

    // 获取提现配置
    private async getWithdrawInfo() {
        const res = await WalletNetService.getWithdrawInfo();
        if (res && res.withdrawInfo) {
            const info: WithdrawConfig = res.withdrawInfo;
            this.userBalance.string = info.userBalance;
            this.exchangeWidget.ExchangeRate = info.gemsExchangeRate;
            this.withdrawWidget.HandlingFee = info.handlingFee;
            this.withdrawWidget.MiniWithdraw = info.miniHandlingFee;
        }
    }

    private onToggleSelcted(index: number) {
        this.withdrawWidget.node.active = index == 0;
        this.exchangeWidget.node.active = index == 1;
    }

    /** 显示提现明细 */
    private async onDetail() {
        oops.gui.open(UIID.WalletDetail);
    }
}