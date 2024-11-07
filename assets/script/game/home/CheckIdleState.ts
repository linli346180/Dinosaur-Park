import { _decorator, Component, Input } from 'cc';
import { oops } from '../../../../extensions/oops-plugin-framework/assets/core/Oops';
import { AccountEvent } from '../account/AccountEvent';
const { ccclass, property } = _decorator;

/**
 * @en 检测玩家是否长时间无操作
 */
@ccclass('CheckIdleState')
export class CheckIdleState extends Component {
    readonly NO_OPERATION_TIME = 3 * 60 * 1000;
    private lastActivityTime = Date.now();  // 记录最后一次用户操作的时间
    private noOperationTimer: NodeJS.Timeout | null = null;  // 定时器

    start() {
        this.node.on(Input.EventType.KEY_DOWN, this.resetTimer, this);
        this.node.on(Input.EventType.KEY_UP, this.resetTimer, this);
        this.node.on(Input.EventType.MOUSE_DOWN, this.resetTimer, this);
        this.node.on(Input.EventType.MOUSE_UP, this.resetTimer, this);
        this.node.on(Input.EventType.TOUCH_START, this.resetTimer, this);
        this.node.on(Input.EventType.TOUCH_END, this.resetTimer, this);
        oops.message.on(AccountEvent.HideUserOperation, this.resetTimer, this);
        this.startNoOperationCheck();
    }

    onDestory() {
        oops.message.off(AccountEvent.HideUserOperation, this.resetTimer, this);
    }

    private resetTimer() {
        this.lastActivityTime = Date.now();
        if (this.noOperationTimer !== null) {
            clearTimeout(this.noOperationTimer);
            this.noOperationTimer = null;
            oops.message.dispatchEvent(AccountEvent.UserOperation);
        }
        this.startNoOperationCheck();
    }

    private startNoOperationCheck() {
        this.noOperationTimer = setTimeout(() => {
            const currentTime = Date.now();
            const timeDiff = currentTime - this.lastActivityTime;
            if (timeDiff >= this.NO_OPERATION_TIME) {
                oops.message.dispatchEvent(AccountEvent.UserNoOperation);
            }
        }, this.NO_OPERATION_TIME);
    }
}