import { Button } from 'cc';
import { _decorator, Component, Node } from 'cc';
import { oops } from '../../../../extensions/oops-plugin-framework/assets/core/Oops';
import { UIID } from '../common/config/GameUIConfig';
import { GuideNetService } from './GuideNet';
import { UserOfficial, PresellInfo } from './GuideDefine';
import { GameEvent } from '../common/config/GameEvent';
import { UICallbacks } from '../../../../extensions/oops-plugin-framework/assets/core/gui/layer/Defines';
import { GuideReward } from './GuideReward';
import { smc } from '../common/SingletonModuleComp';
const { ccclass, property } = _decorator;

@ccclass('GuideView')
export class GuideView extends Component {
    @property(Button)
    btn_close: Button = null!;
    @property(Button)
    btn_continue: Button = null!;
    @property(Button)
    btn_joinChannel: Button = null!;
    @property(Button)
    btn_joinGroup: Button = null!;
    @property(Button)
    btn_joinX: Button = null!;

    private presellInfo = new PresellInfo();
    private userOfficial = new UserOfficial();

    start() {
        console.error("start")
        this.btn_close.node.on(Button.EventType.CLICK, this.closeUI, this);
        this.btn_continue.node.on(Button.EventType.CLICK, this.onContinue, this);
        this.btn_joinChannel.node.on(Button.EventType.CLICK, () => { this.joinChannel(this.presellInfo.officialChannelUrl); }, this);
        this.btn_joinGroup.node.on(Button.EventType.CLICK, () => { this.joinChannel(this.presellInfo.officialGroupUrl); }, this);
        this.btn_joinX.node.on(Button.EventType.CLICK, this.onPresellLeave, this);

        this.initUI();
        this.updateUI();
    }

    private initUI() {
        GuideNetService.getPresellData().then((data) => {
            if (data) { this.presellInfo = data; }
        });
    }

    private closeUI() {
        // oops.gui.remove(UIID.Guide, false);
    }

    private updateUI(close: boolean = false) {
        GuideNetService.getUserOfficial().then((data) => {
            if (data) {
                this.userOfficial = data;
                this.btn_joinChannel.node.active = !this.userOfficial.joinOfficialChannel;
                this.btn_joinGroup.node.active = !this.userOfficial.joinOfficialGroup;
                this.btn_joinX.node.active = !this.userOfficial.joinX;

                if (this.userOfficial.joinOfficialChannel &&
                    this.userOfficial.joinOfficialGroup &&
                    this.userOfficial.joinX) {
                    if (close) {
                        var uic: UICallbacks = {
                            onAdded: (node: Node, params: any) => {
                                node.getComponent(GuideReward)?.initUI(this.presellInfo.rewards);
                            },
                            onRemoved: (node: Node | null, params: any) => {
                                oops.message.dispatchEvent(GameEvent.GuideFinish);
                                oops.gui.remove(UIID.Guide);
                            }
                        };
                        let uiArgs: any;
                        oops.gui.open(UIID.GuideReward, uiArgs, uic);
                    }
                }
            }
        });
    }

    private joinChannel(url: string) {
        console.log('跳转链接:', url);
        const WebApp = (window as any).Telegram.WebApp;
        WebApp.openLink(url);
    }

    private onPresellLeave() {
        this.joinChannel(this.presellInfo.xUrl);
        GuideNetService.getPresellLeave(1);
    }

    private onContinue() {
        this.updateUI(true);
    }
}