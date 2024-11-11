import { RichText } from 'cc';
import { _decorator, Component, Toggle, Label } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('LanguageItem')
export class LanguageItem extends Component {
    @property(RichText)
    desc: RichText = null!;
    @property(Toggle)
    selctTog: Toggle = null!;
    OnSelect: (name: string) => void = null!;
    itemKey: string;

    onLoad() {
        this.selctTog?.node.on(Toggle.EventType.TOGGLE, this.onToggleChanged, this);
    }

    InitItem(key: string, name: string, isChecked: boolean) {
        this.itemKey = key;
        this.desc.string = name;
        this.selctTog.isChecked = isChecked;
    }

    onToggleChanged(toggle: Toggle) {
        if (toggle.isChecked) {
            if (this.OnSelect)
                this.OnSelect(this.itemKey);
        }
    }
}