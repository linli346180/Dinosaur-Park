import { _decorator, Component, Node, Toggle, Label, Sprite } from 'cc';
import DropDownOptionData from "./DropDownOptionData";
import DropDownItem from "./DropDownItem";
import { instantiate } from 'cc';
import { UITransform } from 'cc';
import { Button } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('DropDown')
export default class DropDown extends Component {
    @property(Node)
    private template: Node = null!;
    @property(Label)
    private labelCaption: Label = null!;
    @property(Sprite)
    private spriteCaption: Sprite = null!;
    @property(Label)
    private labelItem: Label = null!;
    @property(Sprite)
    private spriteItem: Sprite = null!;
    @property(Button)
    private btnArrow: Button = null!;

    // 下拉框选项数据
    @property([DropDownOptionData])
    private optionDatas: DropDownOptionData[] = [];

    private _dropDown: Node;
    private validTemplate: boolean = false;
    private items: DropDownItem[] = [];
    private isShow: boolean = false;

    // 当前选中的索引
    private _selectedIndex: number = -1;
    get selectedIndex(): number {
        return this._selectedIndex;
    }
    public set selectedIndex(value: number) {
        this._selectedIndex = value;
        this.refreshShownValue();
    }

    start() {
        this.template.active = false;
        this.refreshShownValue();
    }

    onEnable() {
        this.btnArrow.node.on(Button.EventType.CLICK, this.onClick, this);
    }

    onDisable() {
        this.btnArrow.node.off(Button.EventType.CLICK, this.onClick, this);
    }

    private onClick() {
        if (!this.isShow) {
            this.show();
        } else {
            this.hide();
        }
    }

    public show() {
        if (!this.validTemplate) {
            this.setUpTemplate();
            if (!this.validTemplate) {
                return;
            }
        }
        this.isShow = true;
        this.node.setSiblingIndex(this.node.parent.children.length - 1);
        
        // 创建临时下拉面板
        this._dropDown = this.createDropDownList(this.template);
        this._dropDown.name = "DropDown List";
        this._dropDown.active = true;
        this._dropDown.setParent(this.template.parent);

        // 获取下拉框的item模板
        let itemTemplate = this._dropDown.getComponentInChildren<DropDownItem>(DropDownItem);
        let content = itemTemplate.node.parent;
        itemTemplate.node.active = true;

        this.items = [];
        for (let i = 0, len = this.optionDatas.length; i < len; i++) {
            let data = this.optionDatas[i];
            let item: DropDownItem = this.addItem(data, i == this.selectedIndex, itemTemplate, this.items);
            if (!item) {
                continue;
            }
            item.toggle.isChecked = i == this.selectedIndex;
            item.toggle.node.on(Toggle.EventType.TOGGLE, () => {
                this.onSelectedItem(item.toggle);
            }, this);
        }
        itemTemplate.node.active = false;

        // 设置高度
        let uiTransform = this._dropDown.getComponent(UITransform);
        if (uiTransform) {
            const itemHeight = itemTemplate.node.getComponent(UITransform)?.contentSize.height;
            uiTransform.height = itemHeight * this.optionDatas.length;
        }
    }

    public hide() {
        this.isShow = false;
        if (this._dropDown != undefined) {
            this.destroyDropdownList(0);
        }
    }

    private async destroyDropdownList(delay: number) {
        // 等待指定的延迟时间
        setTimeout(() => {
            // 销毁所有下拉列表项
            this.items.forEach(item => {
                if (item !== undefined) {
                    this.destroyItem(item);
                }
            });
            this.items = [];

            // 销毁下拉列表
            if (this._dropDown !== undefined) {
                this.destroyDropDownList(this._dropDown);
                this._dropDown = undefined;
            }
        }, delay);
    }

    protected destroyDropDownList(dropDownList: Node) {
        dropDownList.removeFromParent();
    }

    // 添加下拉框选项数据
    public addOptionDatas(optionDatas: DropDownOptionData[]) {
        optionDatas && optionDatas.forEach(data => {
            this.optionDatas.push(data);
        });
        this.refreshShownValue();
    }

    // 清空下拉框选项数据
    public clearOptionDatas() {
        this.optionDatas = [];
        this.refreshShownValue();
    }

    // 添加下拉框选项数据
    private addItem(data: DropDownOptionData, selected: boolean, itemTemplate: DropDownItem, dropDownItems: DropDownItem[]): DropDownItem {
        let item = this.createItem(itemTemplate);
        item.node.setParent(itemTemplate.node.parent);
        item.node.active = true;
        item.node.name = `item_${this.items.length + data.optionString ? data.optionString : ""}`;
        if (item.toggle) {
            item.toggle.isChecked = false;
        }
        if (item.label) {
            item.label.string = data.optionString;
        }
        if (item.sprite) {
            item.sprite.spriteFrame = data.optionSf;
            item.sprite.enabled = data.optionSf != undefined;
        }
        this.items.push(item);
        return item;
    }


    private destroyItem(item) {

    }

    // 设置模板，方便后面item
    private setUpTemplate() {
        this.validTemplate = false;

        if (!this.template) {
            return;
        }
        this.template.active = true;
        let itemToggle: Toggle = this.template.getComponentInChildren<Toggle>(Toggle);
        this.validTemplate = true;

        if (!itemToggle || itemToggle.node == this.template) {
            this.validTemplate = false;
            console.error("The dropdown template is missing");
        } else if (this.labelItem != undefined && !this.labelItem.node.isChildOf(itemToggle.node)) {
            this.validTemplate = false;
            console.error("The dropdown template is missing");
        } else if (this.spriteItem != undefined && !this.spriteItem.node.isChildOf(itemToggle.node)) {
            this.validTemplate = false;
            console.error("The dropdown template is missing");
        }

        if (!this.validTemplate) {
            this.template.active = false;
            return;
        }
        let item = itemToggle.node.addComponent<DropDownItem>(DropDownItem);
        item.label = this.labelItem;
        item.sprite = this.spriteItem;
        item.toggle = itemToggle;
        item.node = itemToggle.node;

        this.template.active = false;
        this.validTemplate = true;
    }

    // 刷新显示的选中信息
    private refreshShownValue() {
        if (this.optionDatas.length <= 0) {
            return;
        }
        this._selectedIndex = this.clamp(this._selectedIndex, 0, this.optionDatas.length - 1)
        let data = this.optionDatas[this.selectedIndex];
        if (this.labelCaption) {
            if (data && data.optionString) {
                this.labelCaption.string = data.optionString;
            } else {
                this.labelCaption.string = "";
            }
        }
        if (this.spriteCaption) {
            if (data && data.optionSf) {
                this.spriteCaption.spriteFrame = data.optionSf;
            } else {
                this.spriteCaption.spriteFrame = undefined;
            }
            this.spriteCaption.enabled = this.spriteCaption.spriteFrame != undefined;
        }
    }

    protected createDropDownList(template: Node): Node {
        return instantiate(template);
    }

    protected createItem(itemTemplate: DropDownItem): DropDownItem {
        let newItem = instantiate(itemTemplate.node);
        return newItem.getComponent<DropDownItem>(DropDownItem);
    }

    /** 当toggle被选中 */
    private onSelectedItem(toggle: Toggle) {
        let parent = toggle.node.parent;
        for (let i = 0; i < parent.children.length; i++) {
            if (parent.children[i] == toggle.node) {
                this.selectedIndex = i - 1;
                break;
            }
        }
        this.hide();
    }

    private clamp(value: number, min: number, max: number): number {
        if (value < min) return min;
        if (value > max) return max;
        return value;
    }
}
