import { Button } from 'cc';
import { _decorator, Component, Node } from 'cc';
import { oops } from '../../../../extensions/oops-plugin-framework/assets/core/Oops';
import { UIID } from '../common/config/GameUIConfig';
import { WalletNetService } from './WalletNet';
import { ExchangeRecord, USDTRecordType, WithdrawRecord } from './WalletDefine';
import { Prefab } from 'cc';
import { instantiate } from 'cc';
import { WalletDetailItem } from './WalletDetailItem';
import { Label } from 'cc';
import { smc } from '../common/SingletonModuleComp';
const { ccclass, property } = _decorator;

@ccclass('WalletDetail')
export class WalletDetail extends Component {
    @property(Button)
    private btn_close: Button = null!;
    @property(Node)
    private containNode: Node = null!;
    @property(Prefab)
    private itemPrefab: Prefab = null!;
    @property(Label)
    private userBalance: Label = null!;
    @property(Button)
    private btn_withdraw: Button = null!;
    @property(Button)
    private btn_exchange: Button = null!;

    onLoad() {
        this.btn_close?.node.on(Button.EventType.CLICK, this.closeUI, this);
        this.btn_withdraw?.node.on(Button.EventType.CLICK, () => this.loadRecords(USDTRecordType.Withdraw), this);
        this.btn_exchange?.node.on(Button.EventType.CLICK, () => this.loadRecords(USDTRecordType.Exchange), this);
        this.loadRecords(USDTRecordType.Withdraw);
        this.userBalance.string = smc.account.AccountModel.CoinData.usdt.toString();
    }

    private closeUI() {
        oops.gui.remove(UIID.WalletDetail);
    }

    private async loadRecords(type: USDTRecordType) {
        this.containNode.removeAllChildren();
        let records: WithdrawRecord[] | ExchangeRecord[] = [];
        if (type === USDTRecordType.Withdraw) {
            const res = await WalletNetService.searchWithdrawRecords();
            if (res && res.withdrawRecords) {
                records = res.withdrawRecords;
                records.sort((a, b) => b.withdrawTime - a.withdrawTime);
            }
        } else{
            const res = await WalletNetService.getGemsExchangeRecord();
            if (res && res.exchangeList) {
                records = res.exchangeList;
                records.sort((a, b) => b.exchangeTime - a.exchangeTime);
            }
        }

        for (const record of records) {
            const itemNode = instantiate(this.itemPrefab);
            if (itemNode) {
                this.containNode.addChild(itemNode);
                const itemComponent = itemNode.getComponent(WalletDetailItem);
                if (type === USDTRecordType.Withdraw) {
                    itemComponent?.withdrawItem(record as WithdrawRecord);
                } else {
                    itemComponent?.exchangeItem(record as ExchangeRecord);
                }
            }
        }
    }
}