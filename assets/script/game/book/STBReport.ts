
import { Button } from 'cc';
import { _decorator, Component, Node } from 'cc';
import { oops } from '../../../../extensions/oops-plugin-framework/assets/core/Oops';
import { UIID } from '../common/config/GameUIConfig';
import { smc } from '../common/SingletonModuleComp';
import { Label } from 'cc';
import { ReportNetService } from './ReportNet';
const { ccclass, property } = _decorator;

/** 图鉴 */
@ccclass('stbReport')
export class stbReport extends Component {

    private btn_close: Button = null!;
    private goldCntainer: Node = null!;
    private superContainer: Node = null!;
    private gamContainer: Node = null!;
    private diamondContainer: Node = null!;

    start() {
        this.btn_close = this.node.getChildByName("btn_close")?.getComponent(Button)!;
        this.btn_close?.node.on(Button.EventType.CLICK, this.closeUI, this);
        this.goldCntainer = this.node.getChildByPath("panel/gold/contain")!;
        this.superContainer = this.node.getChildByPath("panel/super/contain")!;
        this.gamContainer = this.node.getChildByPath("panel/gem/contain")!;
        this.diamondContainer = this.node.getChildByPath("panel/diamond/contain")!;
        // this.InitUI()
    }

    protected onEnable(): void {
        ReportNetService.getStartBeastStatData().then((res) => {
            console.log("更新图鉴");
            this.InitUI();
        });
    }

    closeUI() {
        oops.gui.remove(UIID.Book, false);
    }

    InitUI() {
        this.goldCntainer?.children.forEach(child => {
            this.InitItem(child);
        });
        this.superContainer?.children.forEach(child => {
            this.InitItem(child);
        });
        this.gamContainer?.children.forEach(child => {
            this.InitItem(child);
        });
        this.diamondContainer?.children.forEach(child => {
            this.InitItem(child);
        });
    }

    InitItem(child: Node) {
        const stbId = parseInt(child.name);
        const num = child.getChildByName("num")?.getComponent(Label);
        if (num) {
            num.string = "0";
            const count = smc.account.AccountModel.codexData[stbId];
            if (count) {
                if (num) {
                    num.string = count.toString();
                }
            }
        }
    }
}


