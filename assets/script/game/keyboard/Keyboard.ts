import { instantiate } from 'cc';
import { Prefab } from 'cc';
import { _decorator, Component, Node } from 'cc';
import { Vec3, tween } from 'cc';
import { InputItem } from './InputItem';
import { CursorBlink } from './CursorBlink';
import { EventType, InputMode, KeyBoardCode, KeyBoardConfigs } from './KeyboardDefine';
import { KeyItem } from './KeyItem';
import { EditBox } from 'cc';
import { Button } from 'cc';
import { TextAsset } from 'cc';
import { Label } from 'cc';
import { oops } from '../../../../extensions/oops-plugin-framework/assets/core/Oops';
import { UIID } from '../common/config/GameUIConfig';
import { smc } from '../common/SingletonModuleComp';
const { ccclass, property } = _decorator;

@ccclass('Keyboard')
export default class Keyboard extends Component {
    @property(Prefab)
    private itemPrefab: Prefab = null;
    @property(Prefab)
    private itemSendPrefab: Prefab = null;

    @property(Prefab)
    private inputItemPrefab: Prefab = null;
    @property(Button)
    private btn_clear: Button = null!;

    @property({ readonly: true })
    private vertical: boolean = true;    // 是否垂直排列
    @property(Node)
    private inputNode: Node = null!;      // 输入框节点
    @property(Node)
    private row_1: Node = null!;
    @property(Node)
    private row_2: Node = null!;
    @property(Node)
    private row_3: Node = null!;
    @property(Node)
    private row_4: Node = null!;

    @property(Node)
    private cursorNode: Node = null!;
    @property(Node)
    private inputContainer: Node = null!;
    @property(Node)
    private bgBoxContainer: Node = null!;
    @property(Node)
    private boardContainer: Node = null!;
    private cursorBlink: CursorBlink | null = null;
    private isCaps: boolean = false;
    private isShift: boolean = false;

    public onEditReturnEmail: Function;

    // private editBox: EditBox | null = null;
        

    /** 输入框的初始输入内容，如果为空则会显示占位符的文本。*/
    get string(): string {
        return this.getFinalString();
    }
    set string(value: string) {
        this.inputContainer.removeAllChildren();
        for (let i = 0; i < value.length; i++) {
            const itemNode = instantiate(this.inputItemPrefab);
            const keyItem = itemNode.getComponent(InputItem);
            this.inputContainer.addChild(itemNode);
            keyItem.InputText = value[i];
        }
    }

    /** 输入框最大允许输入的字符个数。 */
    private _maxLength: number = 0;
    get maxLength(): number {
        return this._maxLength;
    }
    set maxLength(value: number) {
        this._maxLength = value;
    }

    /**
    * @zh
    * 指定输入模式: ANY表示多行输入，其它都是单行输入，移动平台上还可以指定键盘样式。
    */
    private _inputMode: InputMode;
    get inputMode() {
        return this._inputMode;
    }
    set inputMode(oldValue: InputMode)
    {
        this._inputMode = oldValue;
    }

    // TODO 文本改变事件  文本完成事件 
    // TODO 输入类型输入数字

    onLoad() {
        this.initLayout()
        this.openMoveContainer();
        this.vertical ? this.initKeyMapV() : this.initKeyMapH()
        this.cursorBlink = this.cursorNode.getComponent(CursorBlink);
        this.btn_clear.node.on(Button.EventType.CLICK, this.onClear, this);
        // 监听文本改变事件
        // this.node.on(EventType.TEXT_CHANGED, this.onTextChanged, this);
        // this.node.on(EventType.EDITING_RETURN, this.onEditReturn, this);
    }

    openMoveContainer()
    {
        this.bgBoxContainer.setPosition(0, -160,0);
        this.boardContainer.setPosition(0, -1500,0);
        tween(this.boardContainer)
        .to(0.5, { position: new Vec3(0, -570, 0) }) // 0.5秒内移动到目标位置
        .start();
    }

    closeMoveContainer()
    {
        tween(this.bgBoxContainer)
        .to(0.5, { position: new Vec3(0, -1200, 0) }) // 0.5秒内移动到目标位置
        .start();
        tween(this.boardContainer)
        .to(0.5, { position: new Vec3(0, -1500, 0) }) // 0.5秒内移动到目标位置
        .start();
    }

    delayCloseMoveContainer(): Promise<void> {
        return new Promise((resolve) => {
            this.closeMoveContainer(); // 关闭的移动方法
            
            setTimeout(() => {
                // 动画或操作完成后
                resolve(); // 结束Promise
            }, 500); // 根据实际情况修改时间
        });
    }

    private onClear() {
        this.inputContainer.removeAllChildren();
        this.node.emit(EventType.TEXT_CHANGED, this.getFinalString());
    }

    private initLayout() {
        const visibleHeight = screen.availHeight;
    }

    private initKeyMapV() {
        const keyArr1 = [
            KeyBoardCode.NUM_1,
            KeyBoardCode.NUM_2,
            KeyBoardCode.NUM_3,
            KeyBoardCode.NUM_4,
            KeyBoardCode.NUM_5,
            KeyBoardCode.NUM_6,
            KeyBoardCode.NUM_7,
            KeyBoardCode.NUM_8,
            KeyBoardCode.NUM_9,
            KeyBoardCode.NUM_0,
            KeyBoardCode.NUM_DECIMAL
        ];

        const keyArr2 = [
            KeyBoardCode.KEY_Q,
            KeyBoardCode.KEY_W,
            KeyBoardCode.KEY_E,
            KeyBoardCode.KEY_R,
            KeyBoardCode.KEY_T,
            KeyBoardCode.KEY_Y,
            KeyBoardCode.KEY_U,
            KeyBoardCode.KEY_I,
            KeyBoardCode.KEY_O,
            KeyBoardCode.KEY_P
        ];

        const keyArr3 = [
            KeyBoardCode.Caps,
            KeyBoardCode.KEY_A,
            KeyBoardCode.KEY_S,
            KeyBoardCode.KEY_D,
            KeyBoardCode.KEY_F,
            KeyBoardCode.KEY_G,
            KeyBoardCode.KEY_H,
            KeyBoardCode.KEY_J,
            KeyBoardCode.KEY_K,
            KeyBoardCode.KEY_L,
            KeyBoardCode.DELETE
        ];

        const keyArr4 = [
            KeyBoardCode.Shift,
            KeyBoardCode.KEY_Z,
            KeyBoardCode.KEY_X,
            KeyBoardCode.KEY_C,
            KeyBoardCode.KEY_V,
            KeyBoardCode.KEY_B,
            KeyBoardCode.KEY_N,
            KeyBoardCode.KEY_M,
            KeyBoardCode.Enter
        ];

        this.initRow(this.row_1, keyArr1);
        this.initRow(this.row_2, keyArr2);
        this.initRow(this.row_3, keyArr3);
        this.initRow(this.row_4, keyArr4);
    }

    private initRow(row: Node, keyArr: KeyBoardCode[]) {
        row.removeAllChildren();
        for (const keyCode of keyArr) {
            let itemNode: Node = null;
            if (keyCode === KeyBoardCode.Enter) {
                itemNode = instantiate(this.itemSendPrefab);
            } else {
                itemNode = instantiate(this.itemPrefab);
            }
            row.addChild(itemNode);
            itemNode.name = "btn_" + keyCode;
            const keyItem = itemNode.getComponent(KeyItem);
            if (keyItem) {
                keyItem.InitItem(keyCode, KeyBoardConfigs[keyCode]);
                keyItem.clickHandler = this.onKeyPress.bind(this);
            }
        }
    }

    private initKeyMapH() {

    }

    private onKeyPress(key: KeyBoardCode) {
        this.checkText();
        switch (key) {
            case KeyBoardCode.Caps:
                this.isCaps = !this.isCaps;
                this.updateKeyLabels();
                return;

            case KeyBoardCode.DELETE:
                const lastChild = this.inputContainer.children[this.inputContainer.children.length - 1];
                if (lastChild) {
                    this.inputContainer.removeChild(lastChild);
                }
                this.node.emit(EventType.TEXT_CHANGED, this.string); // 触发文本改变事件
                return;

            case KeyBoardCode.Enter:
                console.log("enter pressed");
                this.onEditReturn(this.string);
                this.getFinalString();
                return;

            case KeyBoardCode.Shift:
                console.log("enter pressed");
                this.isShift = !this.isShift;
                if(this.isShift)
                {
                    this.changeKeyMap();
                }
                else
                {
                    this.initKeyMapV();
                }
                this.getFinalString();
                return;

            default:
                //点击非特殊键时根据输入模式将字符输入输入框
                if(InputMode.ANY == this.inputMode||InputMode.EMAIL_ADDR == this.inputMode||InputMode.URL == this.inputMode)
                {
                    if (this.inputContainer.children.length <= 20) {
                        this.cursorBlink?.delayBlinking();
                        const itemNode = instantiate(this.inputItemPrefab);
                        const keyItem = itemNode.getComponent(InputItem);
                        this.inputContainer.addChild(itemNode);
                        keyItem.InputText = this.isCaps ? KeyBoardConfigs[key].caspLabel : KeyBoardConfigs[key].normalLabel;
                        this.onTextChanged();
                    }
                }
                else if(InputMode.NUMERIC == this.inputMode||InputMode.PHONE_NUMBER == this.inputMode)
                {
                    if (this.inputContainer.children.length <= 20&&KeyBoardCode.NUM_0<=key&&key<=KeyBoardCode.NUM_9) {
                        this.cursorBlink?.delayBlinking();
                        const itemNode = instantiate(this.inputItemPrefab);
                        const keyItem = itemNode.getComponent(InputItem);
                        this.inputContainer.addChild(itemNode);
                        keyItem.InputText = this.isCaps ? KeyBoardConfigs[key].caspLabel : KeyBoardConfigs[key].normalLabel;
                        this.onTextChanged();
                    }
                }
                else if(InputMode.DECIMAL == this.inputMode)
                {
                    if (this.inputContainer.children.length <= 20&&KeyBoardCode.NUM_0<=key&&key<=KeyBoardCode.NUM_DECIMAL) {
                        this.cursorBlink?.delayBlinking();
                        const itemNode = instantiate(this.inputItemPrefab);
                        const keyItem = itemNode.getComponent(InputItem);
                        this.inputContainer.addChild(itemNode);
                        keyItem.InputText = this.isCaps ? KeyBoardConfigs[key].caspLabel : KeyBoardConfigs[key].normalLabel;
                        this.onTextChanged();
                    }
                }
                else if(InputMode.SINGLE_LINE == this.inputMode)
                {
                    if (this.inputContainer.children.length <= 20) {
                        this.cursorBlink?.delayBlinking();
                        const itemNode = instantiate(this.inputItemPrefab);
                        const keyItem = itemNode.getComponent(InputItem);
                        this.inputContainer.addChild(itemNode);
                        keyItem.InputText = this.isCaps ? KeyBoardConfigs[key].caspLabel : KeyBoardConfigs[key].normalLabel;
                        this.onTextChanged();
                    }      
                }
                else
                {
                    console.log("未指定输入模式"); 
                }
                break;
        }
    }

    private updateKeyLabels() {
        this.updateRowLabels(this.row_1);
        this.updateRowLabels(this.row_2);
        this.updateRowLabels(this.row_3);
        this.updateRowLabels(this.row_4);
    }

    private changeKeyMap() {
        const keyArr1 = [
            KeyBoardCode.NUM_1,
            KeyBoardCode.NUM_2,
            KeyBoardCode.NUM_3,
            KeyBoardCode.NUM_4,
            KeyBoardCode.NUM_5,
            KeyBoardCode.NUM_6,
            KeyBoardCode.NUM_7,
            KeyBoardCode.NUM_8,
            KeyBoardCode.NUM_9,
            KeyBoardCode.NUM_0,
            KeyBoardCode.NUM_DECIMAL
        ];

        const keyArr2 = [
            KeyBoardCode.KEY_GRAVE,//|
            KeyBoardCode.KEY_TILDE,
            KeyBoardCode.KEY_EXCLAMATION,
            KeyBoardCode.KEY_AT,
            KeyBoardCode.KEY_HASH,
            KeyBoardCode.KEY_DOLLAR,
            KeyBoardCode.KEY_PERCENT,
            KeyBoardCode.KEY_CARET,
            KeyBoardCode.KEY_AMPERSAND,
            KeyBoardCode.KEY_ASTERISK
        ];

        const keyArr3 = [
            KeyBoardCode.Caps,
            KeyBoardCode.KEY_LEFT_PARENTHESIS,
            KeyBoardCode.KEY_RIGHT_PARENTHESIS,
            KeyBoardCode.KEY_MINUS,
            KeyBoardCode.KEY_PLUS,
            KeyBoardCode.KEY_LEFT_BRACE,
            KeyBoardCode.KEY_RIGHT_BRACE,
            KeyBoardCode.KEY_LEFT_BRACKET,
            KeyBoardCode.KEY_RIGHT_BRACKET,
            KeyBoardCode.KEY_PIPE,
            KeyBoardCode.DELETE
        ];

        const keyArr4 = [
            KeyBoardCode.Shift,
            KeyBoardCode.KEY_COLON,
            KeyBoardCode.KEY_SEMICOLON,
            KeyBoardCode.KEY_QUOTE,
            KeyBoardCode.KEY_LESS,
            KeyBoardCode.KEY_GREATER,
            KeyBoardCode.KEY_SLASH,
            KeyBoardCode.KEY_QUESTION,
            KeyBoardCode.Enter
        ];

        this.initRow(this.row_1, keyArr1);
        this.initRow(this.row_2, keyArr2);
        this.initRow(this.row_3, keyArr3);
        this.initRow(this.row_4, keyArr4);
    }

    private updateRowLabels(row: Node) {
        row.children.forEach(child => {
            const keyItem = child.getComponent(KeyItem);
            if (keyItem) {
                keyItem.updateLabel(this.isCaps);
            }
        });
    }

    private getFinalString(): string {
        let finalOutput = '';
        this.inputContainer.children.forEach(child => {
            const keyItem = child.getComponent(InputItem);
            if (keyItem) {
                finalOutput += keyItem.InputText;
            }
        });
        return finalOutput;
    }

    private checkText() {
        // 长度检测

        // 类型检测
    }

    private onTextChanged() {
        // 在这里处理文本改变的逻辑

        this.node.emit(EventType.TEXT_CHANGED, this.getFinalString()); // 触发文本改变事件
    }

    private onEditReturn(newText: string) {
        console.log("Edit return");
        // 在这里处理文本输入完成的逻辑
        if(this.onEditReturnEmail) {
            this.onEditReturnEmail();
        }
        this.onClear();//清空文本框
        // 调用 closeMoveContainer，并在完成后执行 remove
        this.delayCloseMoveContainer().then(() => {
            oops.gui.remove(UIID.Keyboard, true); // closeMoveContainer 完成后再执行
        });
    }
}


