/*
 * @Author: dgflash
 * @Date: 2021-07-03 16:13:17
 * @LastEditors: dgflash
 * @LastEditTime: 2022-09-06 10:13:17
 */
import { Component, EventTouch, instantiate, Node, Prefab, UITransform, v2, Widget, _decorator } from "cc";
import { GuideModelComp } from "../model/GuideModelComp";
import { PolygonMask } from "./PolygonMask";
import { oops } from "../../../../extensions/oops-plugin-framework/assets/core/Oops";
import { ViewUtil } from "../../../../extensions/oops-plugin-framework/assets/core/utils/ViewUtil";

const { ccclass, property } = _decorator;

/** 新后引导遮罩逻辑 */
@ccclass('GuideViewMask')
export class GuideViewMask extends Component {
    model: GuideModelComp = null!;

    private bg: Node = null!;
    private mask: Node = null!;
    private mask_pm: PolygonMask = null!;
    private mask_widget: Widget = null!;

    start() {
        var prefab: Prefab = oops.res.get(this.model.res_mask, Prefab)!;
        this.mask = instantiate(prefab);
        this.mask.parent = this.node;
        this.bg = this.mask.getChildByName("bg")!;
        this.mask_pm = this.mask.getComponent(PolygonMask)!;
        this.mask_widget = this.bg.getComponent(Widget)!;
        this.node.active = false;
    }

    /** 显示引导 */
    show() {
        this.node.active = true;
        this.mask_widget.target = this.node;
        this.node.on(Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.mask_pm.draw();
    }

    /** 隐藏引导 */
    hide() {
        this.node.off(Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.active = false;
    }

    /** 绘制遮罩 */
    draw(btn: Node) {
        // 定义规制区域的位置
        var left_top = this.mask_pm.polygon.points[0];
        var left_bottom = this.mask_pm.polygon.points[3];
        var right_top = this.mask_pm.polygon.points[2];
        var right_bottom = this.mask_pm.polygon.points[1];

        // 绘制引导可点击区域
        var uit = btn.getComponent(UITransform)!;
        var size = this.node.getComponent(UITransform)!.contentSize;
        var widthHalf = size.width / 2;
        var heightHalf = size.height / 2;

        var left_x = uit.contentSize.width * uit.anchorX;
        var right_x = uit.contentSize.width * (1 - uit.anchorX);
        var left_y = uit.contentSize.height * uit.anchorY;
        var right_y = uit.contentSize.height * (1 - uit.anchorY);

        left_top.x = btn.worldPosition.x - widthHalf - left_x;
        left_top.y = btn.worldPosition.y - heightHalf - left_y;
        left_bottom.x = btn.worldPosition.x - widthHalf - left_x;
        left_bottom.y = btn.worldPosition.y - heightHalf + right_y;
        right_top.x = btn.worldPosition.x - widthHalf + right_x;
        right_top.y = btn.worldPosition.y - heightHalf + right_y;
        right_bottom.x = btn.worldPosition.x - widthHalf + right_x;
        right_bottom.y = btn.worldPosition.y - heightHalf - left_y;

        this.show();
    }

    /** 事件模拟触发目标按钮触摸事件 */
    private onTouchEnd(event: EventTouch) {
        var btn = this.model.current;
        if (btn) {
            var touchPos = ViewUtil.calculateScreenPosToSpacePos(event, this.node);
            touchPos = ViewUtil.calculateASpaceToBSpacePos(this.node, btn.parent!, touchPos);
            var uiPos = v2(touchPos.x, touchPos.y);

            // 判断触摸点是否在按钮上
            var rect = btn.getComponent(UITransform)!.getBoundingBox();
            if (rect.contains(uiPos)) {
                // 模拟触摸点击事件
                btn.dispatchEvent(event);
            }
        }
    }
}