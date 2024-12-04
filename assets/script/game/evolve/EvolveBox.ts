import { Button } from 'cc';
import { _decorator, Component, Node } from 'cc';
import { oops } from '../../../../extensions/oops-plugin-framework/assets/core/Oops';
import { UIID } from '../common/config/GameUIConfig';
import { smc } from '../common/SingletonModuleComp';
const { ccclass, property } = _decorator;

@ccclass('EvolveBox')
export class EvolveBox extends Component {
    @property(Button) btn_item: Button = null!;
    @property(Node) icon_301: Node = null!;
    @property(Node) icon_302: Node = null!;
    @property(Node) icon_303: Node = null!;

    onLoad() {
        this.btn_item.node.on(Button.EventType.CLICK, this.onItemClick, this);
        let stbConfig = smc.account.getSTBConfigByType(303);
        if(stbConfig) {
            smc.account.getUserInstbCount(stbConfig.id);
            this.icon_303.active = true;
            return;
        } 
        stbConfig = smc.account.getSTBConfigByType(302);
        if(stbConfig) {
            smc.account.getUserInstbCount(stbConfig.id);
            this.icon_302.active = true;
            return;
        } 
        stbConfig = smc.account.getSTBConfigByType(301);
        if(stbConfig) {
            smc.account.getUserInstbCount(stbConfig.id);
            this.icon_301.active = true;
            return;
        } 
    }

    private onItemClick() { 
        oops.gui.open(UIID.Evolve)
    }
}


