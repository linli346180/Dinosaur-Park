import { _decorator } from "cc";
import { SpriteFrame } from "cc";

const {ccclass, property} = _decorator;

@ccclass("DropDownOptionData")
export default class DropDownOptionData{
    @property(String)
    public optionString: string = "";
    @property(SpriteFrame)
    public optionSf: SpriteFrame = undefined;
}
