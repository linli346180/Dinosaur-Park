import { _decorator, Component, Node, Animation, Button } from 'cc';
import { oops } from '../../../../extensions/oops-plugin-framework/assets/core/Oops';
import { AccountEvent } from '../account/AccountEvent';
const { ccclass, property } = _decorator;

@ccclass('KnapsackView')
export class KnapsackView extends Component {
    @property(Animation)
    subBtnsAnim: Animation = null!;
    @property(Button)
    btn_expand: Button = null!;
    @property(Button)
    btn_fold: Button = null!;
    @property(Node)
    knapsackPanel: Node = null!;
    @property(Animation)
    goldAnim: Animation = null!;
    @property(Node)
    KnapsackPanel: Node = null!;

    onLoad() {
        this.goldAnim.node.active = false;
    }

    start() {
        this.btn_fold?.node.on(Button.EventType.CLICK, this.hideSubBtns, this);
        this.btn_expand?.node.on(Button.EventType.CLICK, this.showSubBtns, this);
        oops.message.on(AccountEvent.UserCollectCoin, this.onHandler, this);
        this.goldAnim?.on(Animation.EventType.FINISHED, () => { this.goldAnim.node.active = false; }, this);
    }

    private onHandler(event: string, args: any) {
        switch (event) {
            case AccountEvent.UserCollectCoin:
                this.showGoldAnim();
                break
        }
    }

    hideSubBtns() {
        this.subBtnsAnim.play('sub_fold');
        this.subBtnsAnim.once(Animation.EventType.FINISHED, () => {
            this.btn_expand.node.active = true;
            this.btn_fold.node.active = false;
            this.knapsackPanel.active = false;
        });
    }

    showSubBtns() {
        this.subBtnsAnim.play('sub_pop');
        this.knapsackPanel.active = true;
        this.subBtnsAnim.once(Animation.EventType.PLAY, () => {
            this.knapsackPanel.active = true;
        });
        this.subBtnsAnim.once(Animation.EventType.FINISHED, () => {
            this.btn_expand.node.active = false;
            this.btn_fold.node.active = true;
        });
    }

    showGoldAnim() {
        this.goldAnim.node.active = true;
        this.goldAnim.play();
    }
}