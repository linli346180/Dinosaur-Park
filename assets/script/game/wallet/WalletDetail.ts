import { Button } from 'cc';
import { _decorator, Component, Node } from 'cc';
import { oops } from '../../../../extensions/oops-plugin-framework/assets/core/Oops';
import { UIID } from '../common/config/GameUIConfig';
import { WalletNetService } from './WalletNet';
import { WithdrawRecord } from './WalletDefine';
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
    private userBalance:Label = null!;

    onLoad() {
        this.btn_close?.node.on(Button.EventType.CLICK, this.closeUI, this);
        this.initUI();
    }

    closeUI() {
        oops.gui.remove(UIID.WalletDetail)
    }

    async initUI() {
        this.userBalance.string = smc.account.AccountModel.CoinData.usdt.toString();
        this.containNode.removeAllChildren();
        const res = await WalletNetService.searchWithdrawRecords();
        if (res && res.withdrawRecords) {
            const records: WithdrawRecord[] = res.withdrawRecords;
            for (const record of records) {
                this.createItem(record);
            }
        }
    }

    createItem(record: WithdrawRecord) {
        const itemNode = instantiate(this.itemPrefab);
        if (itemNode) {
            this.containNode.addChild(itemNode);
            itemNode.getComponent(WalletDetailItem)?.initItem(record);
        }
    }
}