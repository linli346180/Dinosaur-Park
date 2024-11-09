import { _decorator, Component, Node, Animation, Button, Label } from 'cc';
import { oops } from '../../../../extensions/oops-plugin-framework/assets/core/Oops';
import { UIID } from '../common/config/GameUIConfig';
import { HatchNetService } from './HatchNet';
import { UserHatchData } from './HatchData';
import { UICallbacks } from '../../../../extensions/oops-plugin-framework/assets/core/gui/layer/Defines';
import { HatchReward } from './HatchReward';
import { UserHatchEvent } from './HatchDefine';
import { NetErrorCode } from '../../net/custom/NetErrorCode';
import { VideoPlayer } from 'cc';
import { tween } from 'cc';
import { UIOpacity } from 'cc';
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

    @property(HatchReward)
    hatchReward: HatchReward = null!;

    // 抽奖视频
    @property(VideoPlayer)
    videoPlayer: VideoPlayer = null!;
    @property(Node)
    videoMask: Node = null!;

    private isInit = false;
    private canHatch: boolean = true;
    private _userData: UserHatchData = new UserHatchData();

    onLoad() {
        this.getHatchMinNum();
    }

    onEnable() {
        this.getUserHatchNum();
    }

    start() {
        this.isInit = true;
        this.btn_close?.node.on(Button.EventType.CLICK, () => oops.gui.remove(UIID.Hatch, false), this);
        this.btn_RewardView?.node.on(Button.EventType.CLICK, () => { oops.gui.open(UIID.RewardView) }, this);
        this.btn_HatchOneTime?.node.on(Button.EventType.CLICK, () => { this.userHatch(1) }, this);
        this.btn_HatchTenTimes?.node.on(Button.EventType.CLICK, () => { this.userHatch(10) }, this);
        this.btn_BuyHatchTime?.node.on(Button.EventType.CLICK, () => { oops.gui.open(UIID.HatchShop) }, this);

        this.videoPlayer.node.on(VideoPlayer.EventType.COMPLETED, this.OnAnimFinish, this);
        oops.message.on(UserHatchEvent.HatchRemailChange, this.onHandler, this);
    }

    onDestroy() {
        oops.message.off(UserHatchEvent.HatchRemailChange, this.onHandler, this);
    }

    /* 获取孵蛋保底次数*/
    private async getHatchMinNum() {
        const res = await HatchNetService.getHatchMinNum();
        if (res && res.hatchGuaranteedNum != null) {
            this._userData.guaranteedNum = res.hatchGuaranteedNum.guaranteedNum;
            let desc = oops.language.getLangByID("hatch_tips_reward_eachhatchcount");
            desc = desc.replace("{count}", this._userData.guaranteedNum.toString());
            this.label_guaranteedNum.string = desc;
        }
    }

    /* 获取用户孵化次数 */
    private async getUserHatchNum() {
        this.canHatch = true;
        const res = await HatchNetService.getUserHatchNum();
        if (res && res.userHatch != null) {
            this._userData.remainNum = res.userHatch.remainNum;
            this._userData.hatchNum = res.userHatch.hatchNum;
        }
        this.label_hatchNum.string = `${this._userData.hatchNum} / ${this._userData.guaranteedNum}`
        this.label_remainNum.string = this._userData.remainNum.toString();
    }

    private onHandler(event: string, args: any) {
        switch (event) {
            // 孵蛋次数变化
            case UserHatchEvent.HatchRemailChange:
                this._userData.remainNum = args;
                this.label_remainNum.string = this._userData.remainNum.toString();
                break;
        }   
    }

    private async userHatch(num: number) {
        if (this._userData.remainNum < num) {
            // oops.gui.toast("hatch_tips_needmore", true);
            oops.gui.open(UIID.HatchShop)
            return
        }

        if (!this.canHatch) {
            return;
        }

        // 播放抽奖视频:
        this.videoMask.active = true;
        this.videoPlayer.node.active = true;
        this.videoPlayer.play();
        this.canHatch = false;

        const res = await HatchNetService.requestUserHatch(num);
        if (res && res.userHatch != null) {
            this.hatchReward.InitUI(res.userHatch);
        } else {
            console.error("孵蛋异常");
        }
    }

    private OnAnimFinish() {
        this.canHatch = true;
        this.videoPlayer.stop();
        this.videoPlayer.node.active = false;
        this.getUserHatchNum();

        let uiOpacity = this.videoMask.getComponent(UIOpacity);
        if (!uiOpacity) return

        tween(this.videoMask)
            .call(() => {
                uiOpacity.opacity = 255;
            })
            .to(0.8, {}, { onUpdate: (target, ratio) => { if (ratio) uiOpacity.opacity = 255 - (255 - 155 * ratio); } }) // 透明度减少到 100
            .call(() => {
                this.videoMask.active = false;
                this.hatchReward.node.active = true;
            })
            .start();
    }
}