import { _decorator, Component, Node, Button, Label } from 'cc';
import { oops } from '../../../../extensions/oops-plugin-framework/assets/core/Oops';
import { UIID } from '../common/config/GameUIConfig';
import { ReportNetService } from './ReportNet';
import { Logger } from '../../Logger';
const { ccclass, property } = _decorator;

interface CodexData {
    [key: string]: number;
}

/** 图鉴 */
@ccclass('STBReportView')
export class STBReportView extends Component {
    @property(Button)
    btn_close: Button = null!;
    @property(Node)
    goldCntainer: Node = null!;
    @property(Node)
    superContainer: Node = null!;
    @property(Node)
    gamContainer: Node = null!;
    @property(Node)
    diamondContainer: Node = null!;
    private codexData: CodexData = {};

    async onEnable() {
        const res = await ReportNetService.getStartBeastStatData();
        if (res) {
            this.codexData = res.codexData;
            this.InitUI();
        }
    }

    start() {
        this.btn_close?.node.on(Button.EventType.CLICK, this.closeUI, this);
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
            const count = this.codexData[stbId];
            if (count) {
                if (num) {
                    num.string = count.toString();
                }
            }
        }
    }
}