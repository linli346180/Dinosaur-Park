import { UITransform } from 'cc';
import { view } from 'cc';
import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;
@ccclass('FixedRatioSize')
export default class FixedRatioSize extends Component {

    @property
    targetWidth: number = 1920;  // 固定宽度（基准分辨率）

    @property
    targetHeight: number = 1080;  // 固定高度（基准分辨率）

    private transform: UITransform = null!;

    onLoad() {
        this.setFixedRatioSize();
    }

    setFixedRatioSize() {

        this.transform = this.getComponent(UITransform)!;

        // 获取当前屏幕分辨率
        const frameWidht = view.getDesignResolutionSize().width;
        const frameheight = view.getDesignResolutionSize().height
        
        // 计算当前屏幕的宽高比
        const screenRatio = frameWidht / frameheight;
        const targetRatio = this.targetWidth / this.targetHeight;

        // 保持对象按比例缩放
        if (screenRatio > targetRatio) {
            // 屏幕较宽，按高度缩放
            this.transform.height = this.targetHeight;
            this.transform.width = this.targetHeight * screenRatio;
        } else {
            // 屏幕较窄，按宽度缩放
            this.transform.width = this.targetWidth;
            this.transform.height = this.targetWidth / screenRatio;
        }
    }
    
    // 如果窗口尺寸发生变化，自动更新大小
    update() {
        this.setFixedRatioSize();
    }
}
