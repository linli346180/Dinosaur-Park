import { UITransform } from 'cc';
import { view } from 'cc';
import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;
@ccclass('FixedRatioSize')
export default class FixedRatioSize extends Component {
    @property
    targetWidth: number = 1080;  // 固定宽度（基准分辨率）
    @property
    targetHeight: number = 2537;  // 固定高度（基准分辨率）

    private transform: UITransform = null!;

    onLoad() {
        this.setFixedRatioSize();
    }

    setFixedRatioSize() {
        this.transform = this.getComponent(UITransform)!;
        const width = this.transform.width
        this.transform.height =  width * this.targetHeight / this.targetWidth;
    }

    // 如果窗口尺寸发生变化，自动更新大小
    update() {
        this.setFixedRatioSize();
    }
}
