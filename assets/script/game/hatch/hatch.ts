import { Button } from 'cc';
import { _decorator, Component, Node } from 'cc';
import { oops } from '../../../../extensions/oops-plugin-framework/assets/core/Oops';
import { UIID } from '../common/config/GameUIConfig';
import { HatchNetService } from './HatchNet';
import { UserHatchData } from './HatchData';
import { Label } from 'cc';
import { UICallbacks } from '../../../../extensions/oops-plugin-framework/assets/core/gui/layer/Defines';
import { HatchShop } from './HatchShop';
import { HatchReward } from './HatchReward';
import { HserHatchEvent } from './HatchDefine';
const { ccclass, property } = _decorator;

/** 孵蛋 */
@ccclass('hatch')
export class hatch extends Component {
    @property(Button)
    btn_close: Button = null!;
    @property(Button)
    btn_view: Button = null!;
    @property(Button)
    btn_once: Button = null!;
    @property(Button)
    btn_ten: Button = null!;
    @property(Button)
    btn_times: Button = null!;

    @property(Label)
    label_remainNum: Label = null!;
    @property(Label)
    label_hatchNum: Label = null!;
    @property(Label)
    label_guaranteedNum: Label = null!;

    private _userData: UserHatchData = new UserHatchData();

    start() {
        this.btn_close?.node.on(Button.EventType.CLICK, this.closeUI, this);
        this.btn_view?.node.on(Button.EventType.CLICK, this.onView, this);
        this.btn_once?.node.on(Button.EventType.CLICK, this.onOnce, this);
        this.btn_ten?.node.on(Button.EventType.CLICK, this.onTen, this);
        this.btn_times?.node.on(Button.EventType.CLICK, this.onTimes, this);

        oops.message.on(HserHatchEvent.RemainNumChange, this.onHandler, this);
        this.initUI()
    }

    private onHandler(event: string, args: any) {
        switch (event) {
            case HserHatchEvent.RemainNumChange:
                this._userData.remainNum = args;
                this.label_remainNum.string = this._userData.remainNum.toString(); 
                break;
        }
    }

    async initUI() {
        let hatchData = await HatchNetService.getHatchMinNum();
        this._userData.guaranteedNum = hatchData.guaranteedNum;
        hatchData = await HatchNetService.getUserHatchNum();
        this._userData.remainNum = hatchData.remainNum;
        this._userData.hatchNum = hatchData.hatchNum;
        this.label_hatchNum.string = `${this._userData.hatchNum} / ${this._userData.guaranteedNum}`
        this.label_remainNum.string = this._userData.remainNum.toString();
        this.label_guaranteedNum.string = `Reward rare items for every ${this._userData.guaranteedNum} hatches`;
    }

    closeUI() {
        oops.gui.remove(UIID.Hatch);
    }

    onView() {
        oops.gui.open(UIID.RewardView);
    }

    onOnce() {
        this.userHatch(1)
    }

    onTen() {
        this.userHatch(10)
    }

    onTimes() {
        oops.gui.open(UIID.HatchShop);
    }

    async userHatch(num: number) {
        let hatchResult = await HatchNetService.requestUserHatch(num)
        if (hatchResult.resultCode == "OK") {
            this._userData.remainNum -= num;
            this._userData.hatchNum += num;
            this.label_hatchNum.string = `${this._userData.hatchNum}/${this._userData.guaranteedNum}`
            this.label_remainNum.string = this._userData.remainNum.toString();

            // 弹出奖励界面
            var uic: UICallbacks = {
                onAdded: (node: Node, params: any) => {
                    const hatchReward = node.getComponent(HatchReward);
                    if (hatchReward) {
                        hatchReward.InitUI(hatchResult.userHatch);
                    }
                }
            };
            let uiArgs: any;
            oops.gui.open(UIID.HatchReward, uiArgs, uic);

        } else {
            console.error("孵蛋失败:", hatchResult.resultMsg);
            oops.gui.toast(hatchResult.resultMsg, false);
        }
    }
}