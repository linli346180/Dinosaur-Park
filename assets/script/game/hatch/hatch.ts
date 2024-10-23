
import { _decorator, Component, Node, Animation, Button, Label } from 'cc';
import { oops } from '../../../../extensions/oops-plugin-framework/assets/core/Oops';
import { UIID } from '../common/config/GameUIConfig';
import { HatchNetService } from './HatchNet';
import { UserHatchData } from './HatchData';
import { UICallbacks } from '../../../../extensions/oops-plugin-framework/assets/core/gui/layer/Defines';
import { HatchReward } from './HatchReward';
import { UserHatchEvent } from './HatchDefine';
import { NetErrorCode } from '../../net/custom/NetErrorCode';
const { ccclass, property } = _decorator;

/** 孵蛋视图(抽奖) */
@ccclass('HatchView')
export class HatchView extends Component {
    @property(Button)
    btn_close: Button = null!;
    @property(Button)
    btn_RewardView: Button = null!;
    @property(Button)
    btn_HatchOneTime: Button = null!;
    @property(Button)
    btn_HatchTenTimes: Button = null!;
    @property(Button)
    btn_BuyHatchTime: Button = null!;
    @property(Label)
    label_remainNum: Label = null!;
    @property(Label)
    label_hatchNum: Label = null!;
    @property(Label)
    label_guaranteedNum: Label = null!;
    @property(Animation)
    hatchAnim: Animation = null!;

    private canHatch: boolean = true;
    private hatchResult: any;
    private _userData: UserHatchData = new UserHatchData();

    async onLoad() {
        this.btn_close?.node.on(Button.EventType.CLICK, this.closeUI, this);
        this.btn_RewardView?.node.on(Button.EventType.CLICK, () => { oops.gui.open(UIID.RewardView) }, this);
        this.btn_HatchOneTime?.node.on(Button.EventType.CLICK, () => { this.userHatch(1) }, this);
        this.btn_HatchTenTimes?.node.on(Button.EventType.CLICK, () => { this.userHatch(10) }, this);
        this.btn_BuyHatchTime?.node.on(Button.EventType.CLICK, () => { oops.gui.open(UIID.HatchShop) }, this);
        this.hatchAnim.on(Animation.EventType.FINISHED, this.OnAnimFinish, this);
        oops.message.on(UserHatchEvent.HatchNumChange, this.onHandler, this);

        // 获取孵蛋保底次数
        const res = await HatchNetService.getHatchMinNum();
        if (res) {
            this._userData.guaranteedNum = res.hatchGuaranteedNum.guaranteedNum;
            this.label_guaranteedNum.string = `Reward rare items for every ${this._userData.guaranteedNum} hatches`;
        }
    }

    protected onEnable(): void {
        this.initUI();
    }

    onDestroy() {
        oops.message.off(UserHatchEvent.HatchNumChange, this.onHandler, this);
    }

    private closeUI() {
        oops.gui.remove(UIID.Hatch, false);
    }

    private async initUI() {
        const hatchNumData = await HatchNetService.getUserHatchNum();
        if (hatchNumData) {
            this._userData.remainNum = hatchNumData.userHatch.remainNum;
            this._userData.hatchNum = hatchNumData.userHatch.hatchNum;
        }
        this.label_hatchNum.string = `${this._userData.hatchNum} / ${this._userData.guaranteedNum}`
        this.label_remainNum.string = this._userData.remainNum.toString();
    }

    private onHandler(event: string, args: any) {
        switch (event) {
            case UserHatchEvent.HatchNumChange:
                this.initUI();
                break;
        }
    }

    private async userHatch(num: number) {
        if (!this.canHatch) {
            return;
        }
        // 播放抽奖动画
        this.canHatch = false;
        this.hatchAnim.node.active = true;
        this.hatchAnim.play();
        this.hatchResult = await HatchNetService.requestUserHatch(num);
    }

    private OnAnimFinish() {
        this.canHatch = true;
        this.hatchAnim.node.active = false;
        this.hatchAnim.stop();
        this.initUI();

        if (this.hatchResult && this.hatchResult.resultCode == NetErrorCode.Success) {
            var uic: UICallbacks = {
                onAdded: (node: Node, params: any) => {
                    const hatchReward = node.getComponent(HatchReward);
                    if (hatchReward) {
                        hatchReward.InitUI(this.hatchResult.userHatch);
                    }
                }
            };
            let uiArgs: any;
            oops.gui.open(UIID.HatchReward, uiArgs, uic);
        } else {
            console.error("孵蛋失败:", this.hatchResult.resultMsg);
            oops.gui.toast(this.hatchResult.resultMsg, false);
        }
    }
}