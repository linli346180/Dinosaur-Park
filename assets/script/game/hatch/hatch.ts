import { Button } from 'cc';
import { _decorator, Component, Node } from 'cc';
import { oops } from '../../../../extensions/oops-plugin-framework/assets/core/Oops';
import { UIID } from '../common/config/GameUIConfig';
import { HatchNetService } from './HatchNet';
import { UserHatchData } from './HatchData';
import { Label } from 'cc';
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

    private _userData: UserHatchData = new UserHatchData();

    start() {
        this.btn_close?.node.on(Button.EventType.CLICK, this.closeUI, this);
        this.btn_view?.node.on(Button.EventType.CLICK, this.onView, this);
        this.btn_once?.node.on(Button.EventType.CLICK, this.onOnce, this);
        this.btn_ten?.node.on(Button.EventType.CLICK, this.onTen, this);
        this.btn_times?.node.on(Button.EventType.CLICK, this.onTimes, this);

        this.initUI()
    }

    async initUI() {
        let hatchData = await HatchNetService.getHatchMinNum();
        this._userData.guaranteedNum = hatchData.guaranteedNum;

        hatchData = await HatchNetService.getUserHatchNum();
        this._userData.remainNum = hatchData.remainNum;
        this._userData.hatchNum = hatchData.hatchNum;

        console.log("孵蛋数据", JSON.stringify(this._userData));

        HatchNetService.getHatchReward();
        HatchNetService.getHatchPrice();

        this.label_hatchNum.string = `${this._userData.hatchNum}/${this._userData.guaranteedNum}`
        this.label_remainNum.string = this._userData.remainNum.toString();
    }

    closeUI() {
        oops.gui.remove(UIID.Hatch);
    }

    onView() {
        oops.gui.open(UIID.RewardView);

        HatchNetService.getHatchReward();
    }

    onOnce() {
        this.userHatch(10)
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
            console.log("孵蛋结果", hatchResult.userHatch);
        } else {
            oops.gui.toast(hatchResult.resultMsg, false);
        }
    }
}