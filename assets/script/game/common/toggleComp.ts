import { _decorator, Component, Node } from 'cc';
import { Enum } from 'cc';
import { Toggle } from 'cc';
import { Label } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('toggleComp')
export class toggleComp extends Component {
    @property(Number)
    public index: number = 0;
    public onToggleSelcted: (index: number) => void = () => { };
    public toggle: Toggle = null!;
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
            this.onToggleSelcted(this.index);
            this.UnCheckLabel.node.active = false;
        } else {
            this.UnCheckLabel.node.active = true;
        }
    }
}


