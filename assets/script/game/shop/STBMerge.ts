import { Button, Toggle, _decorator, Component, Node } from 'cc';
import { oops } from '../../../../extensions/oops-plugin-framework/assets/core/Oops';
import { UIID } from '../common/config/GameUIConfig';
import { smc } from '../common/SingletonModuleComp';
import { VideoPlayer } from 'cc';
import { AccountNetService } from '../account/AccountNet';
import { Label } from 'cc';
import { STBSynthConfig } from './MergeDefine';
const { ccclass, property } = _decorator;

@ccclass('STBMergeView')
export class STBMergeView extends Component {
    @property(Button)
    private btn_close: Button = null!;
    @property(Node)
    private beforePanel: Node = null!;
    @property(Toggle)
    private tog_add: Toggle = null!;
    @property(Button)
    private btn_evolve: Button = null!;
    @property(Node)
    private sucessPanel: Node = null!;
    @property(Button)
    private btn_sucessclose: Button = null!;
    @property(Node)
    private failPanel: Node = null!;
    @property(Button)
    private btn_failclose: Button = null!
    @property(VideoPlayer)
    private videoPlayer: VideoPlayer = null!;
    @property(Node)
    private videoMsk: Node = null!;
    @property(Label)
    private baseProbLabel: Label = null!;
    @property(Label)
    private upProbLabel: Label = null!;
    @property(Node)
    private GainNode:Node = null!;

    private stbID1: number = 0;
    private stbID2: number = 0;
    private isSucc: boolean = false;    // 是否合成成功
    private isGainNum: boolean = false; // 是否获得孵蛋次数
    private synthConfig: STBSynthConfig = new STBSynthConfig();

    async onLoad() {
        let res = await AccountNetService.getSynthProb();
        if (res && res.synthProb != null) {
            this.synthConfig.baseProb = res.synthProb.baseProb;
            this.synthConfig.upProb = res.synthProb.upProb;
        }

        res = await AccountNetService.getSynthProbconfig();
        if (res && res.synthCon != null) {
            this.synthConfig.conCoinNum = res.synthProb.conCoinNum;
            this.synthConfig.conCoinType = res.synthProb.conCoinType;
        }

        this.btn_close?.node.on(Button.EventType.CLICK, this.closeUI, this);
        this.btn_sucessclose?.node.on(Button.EventType.CLICK, this.closeUI, this);
        this.btn_failclose?.node.on(Button.EventType.CLICK, this.closeUI, this);
        this.btn_evolve?.node.on(Button.EventType.CLICK, this.onEvolve, this);
    }

    // 刷新多语言
    protected onEnable(): void {
        this.baseProbLabel.string = `${this.synthConfig.baseProb}%`;
        let desc = oops.language.getLangByID("debris_tips_increase_probability");
        desc = desc.replace('{coinNum}', this.synthConfig.conCoinNum.toString());
        desc = desc.replace('{upProb}', this.synthConfig.upProb.toString());
        switch (this.synthConfig.conCoinType) { 
            case 1:
                desc = desc.replace('{coinType}', oops.language.getLangByID("coin_gold"));
                break;
            case 2:
                desc = desc.replace('{coinType}', oops.language.getLangByID("coin_gems"));
                break;
            case 3:
                desc = desc.replace('{coinType}', oops.language.getLangByID("coin_starbeast"));
                break;
            case 4:
                desc = desc.replace('{coinType}', oops.language.getLangByID("coin_usdt"));
                break;
            default:
                break;
        }
        this.upProbLabel.string = desc;
    }

    public InitUI(firstStbID: number, twoStbID: number,) {
        this.beforePanel.active = true;
        this.sucessPanel.active = false;
        this.failPanel.active = false;
        this.btn_close.node.active = true;

        this.videoMsk.active = false;
        this.videoPlayer.node.active = false;
        this.videoPlayer.stop();

        this.stbID1 = firstStbID;
        this.stbID2 = twoStbID;
        console.log("合成星兽:", firstStbID, twoStbID);
    }

    closeUI() {
        oops.gui.remove(UIID.STBMerge, false);
    }

    private async onEvolve() {
        let isUpProb = this.tog_add.isChecked ? 1 : 2;
        if(this.tog_add.isChecked && smc.account.AccountModel.CoinData.gemsCoin < this.synthConfig.conCoinNum) {
            oops.gui.toast("tips_gem_noenough", true);
            oops.gui.open(UIID.GemShop);
            this.closeUI();
            return;
        }

        this.btn_evolve.interactable = false;
        this.btn_close.node.active = false;
        this.videoMsk.active = true;
        this.videoPlayer.node.active = true;
        this.videoPlayer.play();
        this.videoPlayer.node.once(VideoPlayer.EventType.COMPLETED, this.onVideoCompleted, this);

        smc.account.mergeIncomeSTBNet(this.stbID1, this.stbID2, isUpProb, (success, isGainNum) => {
            this.btn_evolve.interactable = true;
            this.isSucc = success;
            this.isGainNum = isGainNum;
        });
    }

    private onVideoCompleted() {
        this.videoMsk.active = false;
        this.videoPlayer.node.active = false;
        this.showMergeResult(this.isSucc);
    }

    private showMergeResult(isSucc: boolean) {
        this.beforePanel.active = false
        this.sucessPanel.active = isSucc;
        this.failPanel.active = !isSucc;
        this.GainNode.active = this.isGainNum;
    }
}