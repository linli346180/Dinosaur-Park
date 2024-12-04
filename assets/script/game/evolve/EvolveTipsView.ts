import { Button } from 'cc';
import { _decorator, Component, Node } from 'cc';
import { oops } from '../../../../extensions/oops-plugin-framework/assets/core/Oops';
import { UIID } from '../common/config/GameUIConfig';
import { RichText } from 'cc';
import { EvolueNetService } from './EvolveNet';
const { ccclass, property } = _decorator;

@ccclass('EvolveTipsView')
export class EvolveTipsView extends Component {
    @property(Button) btn_close: Button = null!;
    @property(RichText) richText: RichText = null!;

    onLoad() {
        this.btn_close.node.on(Button.EventType.CLICK, this.closeUI, this);
        this.richText.string = '';
        // EvolueNetService.getEvolveTips().then((res) => {    
        //     if (res && res.desc) {
        //         this.richText.string = res.desc;
        //     }
        // });
    }

    private closeUI() {
        oops.gui.remove(UIID.EvolveTips, false);
    }
}