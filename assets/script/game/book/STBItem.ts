import { Button } from 'cc';
import { _decorator, Component, Node, Animation } from 'cc';
import { oops } from '../../../../extensions/oops-plugin-framework/assets/core/Oops';
import { UIID } from '../common/config/GameUIConfig';
import { UICallbacks } from '../../../../extensions/oops-plugin-framework/assets/core/gui/layer/Defines';
import { STBDetail } from './STBDetail';
import { Sprite } from 'cc';
import { Label } from 'cc';
import { ReddotComp } from '../reddot/ReddotComp';
import { smc } from '../common/SingletonModuleComp';
import { ReportNetService } from './ReportNet';
const { ccclass, property } = _decorator;

@ccclass('STBItem')
export class STBItem extends Component {
    @property(Button)
    private btn_detail: Button = null!;
    @property(Sprite)
    private icon: Sprite = null!;
    @property(Label)
    private num: Label = null!;

    private desc: string = '';

    public initItem(num: number) {
        this.num.string = num.toString();
    }

    onLoad() {
        this.btn_detail.node.on(Button.EventType.CLICK, this.onDetailClick, this);
    }

    private async onDetailClick() {
        const redDot = this.btn_detail.node.getChildByName("reddot");
        if (redDot) {
            redDot.getComponent(ReddotComp)?.setRead();
            redDot.active = false;
        }
        const stbType = parseInt(this.node.name);
        // this.configName.string = oops.language.getLangByID(this.STBConfig.name);
        let stbConfig = smc.account.getSTBConfigByType(stbType);
        if (stbConfig) {
            const res = await ReportNetService.getStartBeastDesc(stbConfig.id);
            if(res) {
                var uic: UICallbacks = {
                    onAdded: (node: Node, params: any) => {
                        node.getComponent(STBDetail)?.InitUI(stbType, res.stbDesc.stbName, res.stbDesc.stbDesc);
                    },
                    onBeforeRemove(node, next) {
                        const anim = node.getComponent(Animation);
                        if (anim && !anim.getState('close').isPlaying) {
                            anim.play('close');
                            anim.once(Animation.EventType.FINISHED, () => {
                                next();
                            }, this);
                        } else {
                            next();
                        }
                    },
                };
                let uiArgs: any;
                oops.gui.open(UIID.STBDetail, uiArgs, uic);
            }
        }
    }
}