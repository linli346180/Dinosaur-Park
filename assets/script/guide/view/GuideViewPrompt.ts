/*
 * @Author: dgflash
 * @Date: 2021-07-03 16:13:17
 * @LastEditors: dgflash
 * @LastEditTime: 2022-09-06 10:17:14
 */
import { Component, Label, Node, Prefab, UITransform, Vec3, _decorator, instantiate } from "cc";
import { GuideModelComp } from "../model/GuideModelComp";
import { oops } from "../../../../extensions/oops-plugin-framework/assets/core/Oops";

const { ccclass, property } = _decorator;

/** 新手引导提示逻辑 */
@ccclass('GuideViewPrompt')
export class GuideViewPrompt extends Component {
    model: GuideModelComp = null!;

    private prompt: Node = null!;
    private content: Label = null!;

    start() {
        var prefab: Prefab = oops.res.get(this.model.res_prompt, Prefab)!;
        this.prompt = instantiate(prefab);
        this.prompt.parent = oops.gui.guide;
        this.content = this.prompt.getChildByName("content").getComponent(Label);
        this.hide();
    }

    /** 显示引导提示动画 */
    show(btn: Node) {
        // 提示位置修正到显示对象中心
        var pos = btn.worldPosition.clone();
        var offset: Vec3 = new Vec3();
        var uit = btn.getComponent(UITransform)!;
        offset.x = uit.contentSize.width * 0.5 - uit.contentSize.width * uit.anchorX;
        offset.y = uit.contentSize.height * 0.5 - uit.contentSize.height * uit.anchorY;
        pos = pos.add(offset);

        this.prompt.active = true;
        this.prompt.worldPosition = pos;
        this.prompt.setSiblingIndex(this.prompt.parent!.children.length);
    }

    /** 显示提示词 */
    showPrompt() {
        var p = this.model.prompts[this.model.step];
        this.content.string = p;
    }

    hide() {
        this.prompt.active = false;
    }
}