import { _decorator, Component, Node } from 'cc';
import { WithdrawRecord } from './WalletDefine';
import { Label } from 'cc';
import { Button } from 'cc';
import { StringUtil } from '../common/utils/StringUtil';
import { oops } from '../../../../extensions/oops-plugin-framework/assets/core/Oops';
const { ccclass, property } = _decorator;

@ccclass('WalletDetailItem')
export class WalletDetailItem extends Component {
    @property(Label)
    private num:Label = null!;
    @property(Label)
    private time:Label = null!;
    @property(Label)
    private status:Label = null!;
    @property(Button)
    private btn_detail:Button = null!;

    initItem(config: WithdrawRecord) {
        this.num.string = config.withdrawNum.toString();
        this.time.string =  StringUtil.formatTimestamp(config.withdrawTime);
        this.btn_detail.node.on(Button.EventType.CLICK, this.showDetail, this); 
        if(config.withdrawStatus == 1) {
            this.status.string = oops.language.getLangByID("tips_withdrawal_status_01");
        } else if(config.withdrawStatus == 2) {
            this.status.string = oops.language.getLangByID("tips_withdrawal_status_02");
        } else {
            this.status.string = oops.language.getLangByID("tips_withdrawal_status_03");
        }
    }

    showDetail() {
        console.log('showDetail');
    }
}


