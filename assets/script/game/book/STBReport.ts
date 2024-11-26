import { _decorator, Component, Node, Button, Label } from 'cc';
import { oops } from '../../../../extensions/oops-plugin-framework/assets/core/Oops';
import { UIID } from '../common/config/GameUIConfig';
import { ReportNetService } from './ReportNet';
import { smc } from '../common/SingletonModuleComp';
import { StringUtil } from '../common/utils/StringUtil';
import { STBItem } from './STBItem';
import { UserConfigData } from '../home/UserConfigDefine';
import { AccountNetService } from '../account/AccountNet';
const { ccclass, property } = _decorator;

interface CodexData {
    [key: string]: number;
}

/** 图鉴 */
@ccclass('STBReportView')
export class STBReportView extends Component {
    @property(Button)
    private btn_close: Button = null!;
    @property(Node)
    private goldCntainer: Node = null!;
    @property(Node)
    private superContainer: Node = null!;
    @property(Node)
    private gamContainer: Node = null!;
    @property(Node)
    private diamondContainer: Node = null!;

    private stbData: CodexData = {};
    private configData: UserConfigData[] = [];

    onLoad() {
        this.btn_close?.node.on(Button.EventType.CLICK, this.closeUI, this);
    }

    async onEnable() {
        this.stbData = {};
        const res = await ReportNetService.getStartBeastStatData();
        if (res && res.codexData) {
            for (const key in res.codexData) {
                const num = res.codexData[key];
                const config = smc.account.getSTBConfigById(Number(key));
                if (config) {
                    this.stbData[StringUtil.combineNumbers(config.stbKinds, config.stbGrade, 2)] = num;
                }
            }
            this.InitUI();
        }
    }

    closeUI() {
        oops.gui.remove(UIID.Book, false);
    }

    InitUI() {
        this.goldCntainer?.children.forEach(child => { this.InitItem(child); });
        this.superContainer?.children.forEach(child => { this.InitItem(child); });
        this.gamContainer?.children.forEach(child => { this.InitItem(child); });
        this.diamondContainer?.children.forEach(child => { this.InitItem(child); });
    }

    private InitItem(child: Node) {
        let num = 0;
        if (this.stbData[child.name]) {
            num = this.stbData[child.name];
        }
        child.getComponent(STBItem)?.initItem(num);
    }
}