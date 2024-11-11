import { _decorator, Component, Vec3, tween } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('ScaleComp')
export class ScaleComp extends Component {
    @property
    zoomScale: number = 1.1;
    @property
    duration: number = 0.1;
    onEnable(): void {
        const origScale = this.node.scale.clone();
        const targetScale = new Vec3(this.zoomScale, this.zoomScale, this.zoomScale);
        tween(this.node)
            .to(this.duration, { scale: targetScale }, { easing: 'fade' }) // 使用传入的 targetScale
            .to(this.duration, { scale: origScale }, { easing: 'fade' }) // 恢复到原始缩放值
            .start();
    }
}