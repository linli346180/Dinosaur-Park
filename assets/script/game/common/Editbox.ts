import { _decorator, Component, Node } from 'cc';
import { InputMode } from '../keyboard/KeyboardDefine';
import { Label } from 'cc';
import { Button } from 'cc';
import { smc } from './SingletonModuleComp';
import { UICallbacks } from '../../../../extensions/oops-plugin-framework/assets/core/gui/layer/Defines';
import Keyboard from '../keyboard/Keyboard';
import { oops } from '../../../../extensions/oops-plugin-framework/assets/core/Oops';
import { UIID } from './config/GameUIConfig';
import { Enum } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Editbox')
export class Editbox extends Component {
    @property(Label) textLabel: Label = null;
    @property(Label) placeholderLabel: Label = null;
    @property(Number) maxLength: number = 20;
    @property({ type: Enum(InputMode), displayName: "输入模式" })
    inputMode: InputMode = InputMode.ANY;

    private _string: string = "";
    get string(): string {
        return this._string;
    }
    set string(value: string) {
        this._string = value;
        if (this._string === "") {
            this.textLabel.string = '';
            this.textLabel.enabled = false;
            this.placeholderLabel.enabled = true;
        } else {
            this.textLabel.string = this._string;
            this.textLabel.enabled = true;
            this.placeholderLabel.enabled = false;
        }
    }

    onLoad() {
        this.node.on(Button.EventType.CLICK, this.onCodeEditboxInput, this);
    }

    onCodeEditboxInput() {
        var uic: UICallbacks = {
            onAdded: (node: Node, params: any) => {
                const comp = node.getComponent(Keyboard);
                if (comp) {
                    comp.string = this.textLabel.string;
                    comp.inputMode = this.inputMode;
                    comp.maxLength = this.maxLength;
                    comp.onEditChanged = () => {
                        this.string = comp.string;
                    };
                    comp.onEditEnd = () => {
                        this.string = comp.string;
                    };
                }
            },
            onRemoved: (node: Node) => {
                const comp = node.getComponent(Keyboard);
                if (comp) {
                    this.string = comp.string;
                }
            },
        };
        let uiArgs: any;
        oops.gui.open(UIID.Keyboard, uiArgs, uic);
    }

}


