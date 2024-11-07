import { Button } from 'cc';
import { _decorator, Component, Node } from 'cc';
import { oops } from '../../../../extensions/oops-plugin-framework/assets/core/Oops';
import { UIID } from '../common/config/GameUIConfig';
import { ActivityNetService } from './ActivityNet';
import { Label } from 'cc';
import { ActivityItem } from './ActivityItem';
import { Prefab } from 'cc';
import { ActivityData, BounsRankData } from './ActivityDefine';
import { instantiate } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('ActivityView')
export class ActivityView extends Component {
    @property(Prefab)
    activityItem: Prefab = null!;

    @property(Button)
    btn_close: Button = null!;

    @property(Label)
    putinUsdtTotal: Label = null!;
    @property(Label)
    putinUsdtRemainTotal: Label = null!;
    @property(Label)
    putinRedPacketTotal: Label = null!;
    @property(Label)
    putinRedPacketRemainTotal: Label = null!;
    @property(Label)
    desc: Label = null!;

    @property(Node)
    emptyNode: Node = null!;
    @property(Node)
    itemContent: Node = null!;

    private isInit = false;

    onEnable() {
        this.initUI();
        // this.isInit ? this.updateUI() : this.initUI();
    }

    start() {
        this.isInit = true;
        this.btn_close.node.on(Button.EventType.CLICK, () => { oops.gui.remove(UIID.Activity, false); }, this);
    }

    private initUI() {
        this.itemContent.removeAllChildren();
        this.emptyNode.active = true;
        ActivityNetService.getActivityData().then((data: ActivityData | null) => {
            if (data) {
                this.updateLabels(data);
                this.populateActivityItems(data.bounsRankArr);
            }
        });
    }

    private updateLabels(data: ActivityData) {
        this.putinUsdtTotal.string = data.putinUsdtTotal.toString();
        this.putinUsdtRemainTotal.string = data.putinUsdtRemainTotal.toString();
        this.putinRedPacketTotal.string = data.putinRedPacketTotal.toString();
        this.putinRedPacketRemainTotal.string = data.putinRedPacketRemainTotal.toString();
        this.desc.string = data.desc;
    }

    private updateUI() {
        this.itemContent.removeAllChildren();
        ActivityNetService.getBounsRankList().then((data) => {
            if (data && data.bounsRankArr != null && data.bounsRankArr.length > 0) {
                this.populateActivityItems(data.bounsRankArr);
            }
        });
    }

    private populateActivityItems(bounsRankArr: BounsRankData[]) {
        this.emptyNode.active = bounsRankArr.length == 0;
        bounsRankArr.forEach((item) => {
            this.createActivityItem(item);
        });
    }

    private createActivityItem(config: BounsRankData) {
        let activityItem = instantiate(this.activityItem);
        activityItem.parent = this.itemContent;
        activityItem.getComponent(ActivityItem)?.initItem(config);
    }

}