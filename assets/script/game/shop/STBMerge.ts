import { Button, Toggle, _decorator, Component, Node } from 'cc';
import { oops } from '../../../../extensions/oops-plugin-framework/assets/core/Oops';
import { UIID } from '../common/config/GameUIConfig';
import { smc } from '../common/SingletonModuleComp';
const { ccclass, property } = _decorator;

@ccclass('STBMerge')
export class STBMerge extends Component {
    @property(Button)
    btn_close: Button = null!;
    @property(Node)
    beforePanel: Node = null!;
    @property(Toggle)
    tog_add: Toggle = null!;
    @property(Button)
    btn_evolve: Button = null!;
    @property(Node)
    sucessPanel: Node = null!;
    @property(Button)
    btn_close1: Button = null!;
    @property(Node)
    failPanel: Node = null!;
    @property(Button)
    btn_close2: Button = null!

    private stbID1: number = 0;
    private stbID2: number = 0;

    onLoad(): void {
        this.beforePanel.active = true;
        this.sucessPanel.active = false;
        this.failPanel.active = false;
    }

    start() {
        this.btn_close?.node.on(Button.EventType.CLICK, this.closeUI, this);
        this.btn_close1?.node.on(Button.EventType.CLICK, this.closeUI, this);
        this.btn_close2?.node.on(Button.EventType.CLICK, this.closeUI, this);
        this.btn_evolve?.node.on(Button.EventType.CLICK, this.onEvolve, this);
    }


    public InitUI(firstStbID: number, twoStbID: number,) {
        this.stbID1 = firstStbID;
        this.stbID2 = twoStbID;
        console.log("InitUI", firstStbID, twoStbID);
    }

    closeUI() {
        oops.gui.remove(UIID.STBMerge);
    }

    async onEvolve() {
        let isUpProb = this.tog_add.isChecked ? 1 : 2;
        smc.account.mergeIncomeSTBNet(this.stbID1, this.stbID2, isUpProb, (success) => {
            this.showMergeResult(success);
        });
    }

    showMergeResult(isSucc: boolean) {
        this.beforePanel.active = false
        this.sucessPanel.active = isSucc ? true : false;
        this.failPanel.active = isSucc ? false : true;
    }
}