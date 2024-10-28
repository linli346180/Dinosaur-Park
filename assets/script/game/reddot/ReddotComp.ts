import { Vec3 } from 'cc';
import { tween } from 'cc';
import { _decorator, Component, Node } from 'cc';
import { RedDotCmd } from './ReddotDefine';
import { Enum } from 'cc';
import { oops } from '../../../../extensions/oops-plugin-framework/assets/core/Oops';
import { AccountEvent } from '../account/AccountEvent';
const { ccclass, property } = _decorator;

@ccclass('ReddotComp')
export class ReddotComp extends Component {
    @property({ type: Enum(RedDotCmd) })
    cmd: RedDotCmd;

    onLoad() {
        const isRead = oops.storage.getBoolean(this.cmd.toString());
        // console.log("是否已读", this.cmd.toString(), isRead);
        this.node.active = !isRead;
    }

    onDisable() {
        // console.log("设置已读", this.cmd.toString());
        oops.storage.set(this.cmd.toString(), true);
    }

    start() {
        this.playScaleAnimation(this.node);
        oops.message.on(AccountEvent.RedDotCmd, this.onHandler, this);
    }

    onDestroy() {
        oops.message.off(AccountEvent.RedDotCmd, this.onHandler, this);
    }

    private onHandler(event: string, args: any) {
        if (args == this.cmd) {
            this.node.active = true;
        }
    }

    playScaleAnimation(targetNode: Node) {
        const initialScale = Vec3.ONE;
        const targetScale = new Vec3(1.2, 1.2, 1.2);
        tween(targetNode)
            .to(0.5, { scale: targetScale }) // 放大到目标比例
            .to(0.5, { scale: initialScale }) // 缩小回初始比例
            .delay(2) // 延迟0.5秒
            .union() // 将两个动画组合成一个序列
            .repeatForever() // 不断循环
            .start();
    }
}