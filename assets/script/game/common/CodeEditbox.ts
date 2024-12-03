import { _decorator, Component, Node } from 'cc';
import { InputMode } from '../keyboard/KeyboardDefine';
import { Label } from 'cc';
import { Button } from 'cc';
import { smc } from './SingletonModuleComp';
import { UICallbacks } from '../../../../extensions/oops-plugin-framework/assets/core/gui/layer/Defines';
import Keyboard from '../keyboard/Keyboard';
import { oops } from '../../../../extensions/oops-plugin-framework/assets/core/Oops';
import { UIID } from './config/GameUIConfig';
const { ccclass, property } = _decorator;

@ccclass('CodeEditbox')
export class CodeEditbox extends Component {
    @property(Label)
    public textLabel: Label = null; 
    @property(Label)
    private placeholderLabel: Label = null; 
    @property({ type: Number })
    public maxLength: number = 0; 
    @property({ type:InputMode }) // 使用枚举类型
    public inputMode: InputMode = InputMode.ANY; 
    //public placeholderLabel:string ="Enter text here...";

    private btn:Button

    private _string: string = "";
    /** 输入框的初始输入内容，如果为空则会显示占位符的文本。*/
    get string(): string {
        return this._string;
    }
    set string(value: string) {
        this._string = value;
    }


    start() {
        if (this._string === "") {
            this.textLabel.enabled  = false;
            this.placeholderLabel.enabled = true;
        }
        this.node.on(Button.EventType.CLICK, this.onCodeEditboxInput, this);
    }

    onCodeEditboxInput()
    {
        console.log("Code EditBox 被点击了");
        var uic: UICallbacks = {
            onAdded: (node: Node, params: any) => {
                const comp = node.getComponent(Keyboard);
                if (comp) {
                    comp.string = this.textLabel.string;
                    comp.inputMode =this.inputMode;
                    if( !this.textLabel.enabled)
                    {
                        comp.string = "";
                        this.textLabel.string= "";
                    }
                    this.textLabel.enabled  = true;
                    this.placeholderLabel.enabled = false;

                    comp.onEditChanged = () => {
                        this.textLabel.string = comp.string;
                    };
                    comp.onEditEnd = () => {
                        if(comp.string =='')
                        {
                            this.textLabel.enabled  = false;
                            this.placeholderLabel.enabled = true;
                        }
                        else
                        {
                            this.textLabel.string = comp.string;
                            this.textLabel.enabled  = true;
                            this.placeholderLabel.enabled = false;
                        }
                    };
                }
            },
            onRemoved: (node: Node) => {
                const comp = node.getComponent(Keyboard);
                if (comp) {
                    // 确保在关闭界面时根据输入框内容更新文本标签
                    if (comp.string == '') {
                        this.textLabel.enabled  = false;
                        this.placeholderLabel.enabled = true;
                    } else {
                        this.textLabel.string = comp.string;
                        this.textLabel.enabled  = true;
                        this.placeholderLabel.enabled = false;
                    }
                }
            },
        };
        let uiArgs: any;
        oops.gui.open(UIID.Keyboard, uiArgs, uic);
    }

}


