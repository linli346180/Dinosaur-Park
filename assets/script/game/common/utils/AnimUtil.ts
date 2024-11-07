import { UIOpacity } from "cc";
import { Vec3, v3, tween, Node } from "cc";

export namespace AnimUtil {
    let playingNode: Set<Node> = new Set();

    /**
     * 播放缩放动画
     * @param targetNode - 目标节点
     */
    export function playAnim_Scale(targetNode: Node, targetScale: Vec3 = v3(1.1, 1.1, 1)): void {
        const originalScale = targetNode.scale.clone(); // 保存原始缩放值
        tween(targetNode)
            .to(0.15, { scale: targetScale }, { easing: 'fade' }) // 使用传入的 targetScale
            .to(0.15, { scale: originalScale }, { easing: 'fade' }) // 恢复到原始缩放值
            .start();
    }

    /**
     * 播放移动和透明度动画
     * @param targetNode - 目标节点
     * @param endPos - 结束位置
     */
    export function playAnim_Move_Opacity(targetNode: Node, endPos: Vec3, callback?: () => void): void {
        if (playingNode.has(targetNode)) {
            console.log('动画正在播放中:', targetNode.name);
            if (callback) callback();
            return;
        }

        playingNode.add(targetNode);
        let uiOpacity = targetNode.getComponent(UIOpacity);
        if (!uiOpacity) return;
        const beginPos = targetNode.worldPosition.clone();

        const updateOpacity = (uiOpacity: UIOpacity, ratio: number, start: number, end: number) => {
            if (ratio !== undefined) {
                uiOpacity.opacity = start + (end - start) * ratio;
            }
        };

        tween(targetNode)
            .call(() => { uiOpacity.opacity = 0; })
            .to(0.5, {}, { onUpdate: (target, ratio) => updateOpacity(uiOpacity, ratio, 0, 255) })
            .to(1.5, { worldPosition: endPos }, { easing: 'quadIn' })
            .to(0.5, {}, { onUpdate: (target, ratio) => updateOpacity(uiOpacity, ratio, 255, 0) })
            .call(() => {
                targetNode.setWorldPosition(beginPos);
                uiOpacity.opacity = 0;
                playingNode.delete(targetNode);
                if (callback) callback();
            })
            .start();
    }
}