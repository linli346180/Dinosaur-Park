import { _decorator, Component, Node } from 'cc';
import { ExchangeRecord, WithdrawRecord } from './WalletDefine';
import { Label } from 'cc';
import { Button } from 'cc';
import { StringUtil } from '../common/utils/StringUtil';
import { oops } from '../../../../extensions/oops-plugin-framework/assets/core/Oops';
const { ccclass, property } = _decorator;

@ccclass('WalletDetailItem')
export class WalletDetailItem extends Component {
    @property(Node)
    private usdtNode: Node = null!;
    @property(Label)
    private usdtNum: Label = null!;
    @property(Node)
    private gemsNode: Node = null!;
    @property(Label)
    private gemsNum: Label = null!;
    @property(Label)
    private time: Label = null!;
    @property(Label)
    private status: Label = null!;
    @property(Button)
    private btn_detail: Button = null!;

    onLoad() {
        this.btn_detail.node.on(Button.EventType.CLICK, this.showDetail, this);
    }

    withdrawItem(config: WithdrawRecord) {
        this.gemsNode.active = false;
        this.usdtNum.string = `-${config.withdrawNum}`;
        this.time.string = StringUtil.formatTimestamp(config.withdrawTime*1000);
        if (config.withdrawStatus == 1) {
            this.status.string = oops.language.getLangByID("tips_withdrawal_status_01");
        } else if (config.withdrawStatus == 2) {
            this.status.string = oops.language.getLangByID("tips_withdrawal_status_02");
        } else {
            this.status.string = oops.language.getLangByID("tips_withdrawal_status_03");
        }
    }

    exchangeItem(config: ExchangeRecord) { 
        this.gemsNode.active = true;
        this.status.string = '';
        this.usdtNum.string = `-${config.usdtNumber}`;
        this.gemsNum.string = `+${config.gemsNumber}`;
        this.time.string = StringUtil.formatTimestamp(config.exchangeTime*1000);
    }

    private showDetail() {
        console.log('showDetail');
    }
}


