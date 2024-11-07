import { _decorator, Component, Node, Button, Label } from 'cc';
import { oops } from '../../../../extensions/oops-plugin-framework/assets/core/Oops';
import { UIID } from '../common/config/GameUIConfig';
import { ReportNetService } from './ReportNet';
import { Logger } from '../../Logger';
import { smc } from '../common/SingletonModuleComp';
import { StringUtil } from '../common/utils/StringUtil';
import { tween } from 'cc';
import { v3 } from 'cc';
import { Vec3 } from 'cc';
import { AnimUtil } from '../common/utils/AnimUtil';
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

    private stbData: CodexData = {};

    onEnable() {
        this.stbData = {};
        ReportNetService.getStartBeastStatData().then((res) => {
            if (res && res.codexData != null) {
                for (const key in res.codexData) {
                    const num = res.codexData[key];
                    const config = smc.account.getSTBConfigById(Number(key));
                    if (config) {
                        const stbType = StringUtil.combineNumbers(config.stbKinds, config.stbGrade, 2);
                        this.stbData[stbType] = num;
                    }
                }
                this.InitUI();
                console.log("图鉴数据", this.stbData);
            }
        });

        AnimUtil.playAnim_Scale(this.node);
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
            const count = this.stbData[stbId];
            if (count) { numLabel.string = count.toString(); }
        }
    }
}