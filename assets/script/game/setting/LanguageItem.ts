import { _decorator, Component, Toggle, Label } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('LanguageItem')
export class LanguageItem extends Component {
    @property(Label)
    desc: Label = null!;
    @property(Toggle)
    selctTog: Toggle = null!;
    OnSelect: (name: string) => void = null!;
    itemKey: string;

    InitItem(key: string, name: string, isChecked: boolean) {
        this.itemKey = key;
        this.desc.string = name;
        this.selctTog.isChecked = isChecked;
    }

    start() {
        this.selctTog?.node.on(Toggle.EventType.TOGGLE, this.onToggleChanged, this);
    }

    onToggleChanged(toggle: Toggle) {
        if (toggle.isChecked) {
            this.OnSelect(this.itemKey);
        }
    }
}