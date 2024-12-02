import { tween } from 'cc';
import { Tween } from 'cc';
import { UIOpacity } from 'cc';
import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('CursorBlink')
export class CursorBlink extends Component {
    @property(Node)
    private cursor: Node = null!; // 光标节点
    private uiOpacity: UIOpacity | null = null;
    private blinkTimeout: number | null = null;
    private blinkTween: Tween<UIOpacity> | null = null;

    onLoad() {
        if (this.cursor) {
            this.uiOpacity = this.cursor.getComponent(UIOpacity);
            if (!this.uiOpacity) {
                this.uiOpacity = this.cursor.addComponent(UIOpacity);
            }
        }
    }

    protected onDestroy(): void {
        this.stopBlinking();
    }

    start() {
        if (this.cursor && this.uiOpacity) {
            this.startBlinking();
        }
    }

    startBlinking() {
        this.blinkTween = tween(this.uiOpacity)
            .repeatForever(
                tween(this.uiOpacity)
                    .to(0.5, { opacity: 0 })
                    .to(0.5, { opacity: 255 })
            )
            .start();
    }

    stopBlinking() {
        if (this.blinkTween) {
            this.blinkTween.stop();
            this.blinkTween = null;
        }
        if (this.uiOpacity) {
            this.uiOpacity.opacity = 255;
        }
    }

    delayBlinking() {
        this.stopBlinking();
        if (this.blinkTimeout !== null) {
            clearTimeout(this.blinkTimeout);
        }
        this.blinkTimeout = window.setTimeout(() => {
            this.startBlinking();
            this.blinkTimeout = null;
        }, 3000);
    }
}