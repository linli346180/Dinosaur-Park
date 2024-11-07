import { Vec3 } from 'cc';
import { tween } from 'cc';
import { _decorator, Component, Node } from 'cc';
import { RedDotCmd } from './ReddotDefine';
import { Enum } from 'cc';
import { oops } from '../../../../extensions/oops-plugin-framework/assets/core/Oops';
import { AccountEvent } from '../account/AccountEvent';
const { ccclass, property } = _decorator;

const RedDotCmdEnum = Enum({
    默认: RedDotCmd.default, // 默认
    用户中心: RedDotCmd.userCenter, // 用户中心
    商店: RedDotCmd.userShop, // 商店
    孵蛋: RedDotCmd.UserHatchType, // 孵蛋
    邀请: RedDotCmd.InvitedType, // 邀请
    复活: RedDotCmd.UserDebrisType, // 复活
    邮箱: RedDotCmd.UserEmailType, // 邮箱
    任务: RedDotCmd.UserTaskType, // 任务
    排行: RedDotCmd.RankingType, // 排行
    提现: RedDotCmd.WithDrawalType, // 提现
    星兽图鉴: RedDotCmd.StbBookType, // 星兽图鉴
    星兽活动: RedDotCmd.USDTActivity, // 星兽活动
});

@ccclass('ReddotComp')
export class ReddotComp extends Component {
    @property({ type: RedDotCmdEnum })
    cmd: RedDotCmd = RedDotCmd.default;

    onLoad() {
        const isRead = oops.storage.getBoolean(this.cmd.toString());
        this.node.active = !isRead;
        oops.message.on(AccountEvent.RedDotCmd, this.onHandler, this);
    }

    onEnable() {
        this.playScaleAnimation(this.node);
    }

    onDisable() {
        // 设置红点为已读
        oops.storage.set(this.cmd.toString(), true);
    }

    onDestroy() {
        oops.message.off(AccountEvent.RedDotCmd, this.onHandler, this);
    }

    private onHandler(event: string, args: any) {
        if (args == this.cmd) {
            this.node.active = true;
        }
    }

    // 缩放动画
    playScaleAnimation(targetNode: Node) {
        const initialScale = Vec3.ONE;
        const targetScale = new Vec3(1.2, 1.2, 1.2);
        tween(targetNode)
            .to(0.5, { scale: targetScale })
            .to(0.5, { scale: initialScale })
            .delay(2)
            .union()
            .repeatForever()
            .start();
    }
}