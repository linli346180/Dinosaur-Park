import { _decorator, Component, Node } from 'cc';
import { RankType } from './RankDefine';
import { Enum } from 'cc';
import { Toggle } from 'cc';
import { Label } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('RankToggle')
export class RankToggle extends Component {
    @property({ type: Enum(RankType) })
    taskType: RankType = RankType.day;

    public onToggleSelcted: (type: RankType) => void = () => { };

    private toggle: Toggle = null!;
    private UnCheckLabel: Label = null!;

    start() {
        this.toggle = this.node.getComponent(Toggle)!;
        this.UnCheckLabel = this.node.getChildByName("Label_UnCheck")?.getComponent(Label)!;
        this.toggle?.node.on(Toggle.EventType.TOGGLE, this.onToggle, this);

        if (this.toggle.isChecked)
            this.UnCheckLabel.node.active = false;
    }

    private onToggle(toggle: Toggle) {
        if (toggle.isChecked) {
            this.onToggleSelcted(this.taskType);
            this.UnCheckLabel.node.active = false;
        } else {
            this.UnCheckLabel.node.active = true;
        }
    }
}


