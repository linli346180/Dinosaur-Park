import { Label } from "cc";
import { Sprite } from "cc";
import { Toggle } from "cc";
import { Component } from "cc";
import { _decorator } from "cc";

const { ccclass, property } = _decorator;
@ccclass()
export default class DropDownItem extends Component {
    @property(Label)
    public label: Label = undefined;
    @property(Sprite)
    public sprite: Sprite = undefined;
    @property(Toggle)
    public toggle: Toggle = undefined;
}