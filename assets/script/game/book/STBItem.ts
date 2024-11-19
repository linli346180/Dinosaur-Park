import { Button } from 'cc';
import { _decorator, Component, Node, Animation } from 'cc';
import { oops } from '../../../../extensions/oops-plugin-framework/assets/core/Oops';
import { UIID } from '../common/config/GameUIConfig';
import { UICallbacks } from '../../../../extensions/oops-plugin-framework/assets/core/gui/layer/Defines';
import { STBDetail } from './STBDetail';
const { ccclass, property } = _decorator;

@ccclass('STBItem')
export class STBItem extends Component {
    @property(Button)   
    btn_detail:Button = null!;

    start() {
        this.btn_detail.node.on(Button.EventType.CLICK, this.onDetail, this);
    }

    onDetail() {
        var uic: UICallbacks = {
            onAdded: (node: Node, params: any) => {
                node.getComponent(STBDetail)?.InitUI(parseInt(this.node.name));
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