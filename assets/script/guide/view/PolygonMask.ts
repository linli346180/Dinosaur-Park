/*
 * @Author: dgflash
 * @Date: 2022-03-23 10:31:06
 * @LastEditors: dgflash
 * @LastEditTime: 2022-09-06 10:13:58
 */
import * as cc from "cc";
import { Component, Mask, _decorator } from "cc";
const { ccclass, property, executeInEditMode, requireComponent } = _decorator;

/** 多边形遮罩编辑 */
@ccclass("PolygonMask")
@executeInEditMode
@requireComponent([cc.PolygonCollider2D, cc.Mask])
export class PolygonMask extends Component {
	/** 遮罩组件 */
	mask: Mask = null!;
	/** 用于编辑器中自定义位置的拖拽操作，如果不用物理引擎时，可考虑换成一个数据结构 */
	polygon: cc.PolygonCollider2D = null!;

	onLoad() {
		this.mask = this.getComponent(cc.Mask)!;
		this.polygon = this.getComponent(cc.PolygonCollider2D)!;
		if (this.mask.type !== cc.Mask.Type.GRAPHICS_STENCIL) {
			cc.error("PolygonMask: mask type must be graphics_stencil");
			return;
		}

		// 监听 point 修改
		// @ts-ignore
		let old_value = this.polygon["_points"];
		Object.defineProperty(this.polygon, "_points", {
			get: () => old_value,
			set: (new_value) => {
				old_value = new_value;
				// 更新遮罩
				this.draw();
			},
		});
	}

	/** 绘制遮罩 */
	draw(): void {
		if (this.mask.type !== cc.Mask.Type.GRAPHICS_STENCIL) {
			return;
		}

		var g:any = this.mask.subComp;
		g.clear();
		g.moveTo(
			this.polygon.points[0].x,
			this.polygon.points[0].y
		);
		for (let k_n = 1; k_n < this.polygon.points.length; ++k_n) {
			g.lineTo(
				this.polygon.points[k_n].x,
				this.polygon.points[k_n].y
			);
		}
		g.close();
		g.stroke();
		g.fill();
	}
}
