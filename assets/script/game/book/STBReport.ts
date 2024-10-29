import { _decorator, Component, Node, Button, Label } from 'cc';
import { oops } from '../../../../extensions/oops-plugin-framework/assets/core/Oops';
import { UIID } from '../common/config/GameUIConfig';
import { ReportNetService } from './ReportNet';
import { Logger } from '../../Logger';
import { smc } from '../common/SingletonModuleComp';
import { moneyUtil } from '../common/utils/moneyUtil';
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

    onEnable() {
        ReportNetService.getStartBeastStatData().then((res) => {
            if (res && res.codexData != null) {
                this.codexData = res.codexData;
                for (const key in res.codexData) {
                    const element = res.codexData[key];
                    const config = smc.account.getSTBConfigById(element);
                    if (config) {
                        const stbType = moneyUtil.combineNumbers(config.stbKinds, config.stbGrade, 2);
                        this.codexData[stbType] = element;
                    }
                }
                this.InitUI();
            }
        });
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
        const numLabel = child.getChildByPath("Sprite/num")?.getComponent(Label);
        if (numLabel) {
            const count = this.codexData[stbId];
            if (count) { numLabel.string = count.toString(); }
        }
    }
}