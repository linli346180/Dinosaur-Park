import { _decorator, Component, Node, Animation, Button } from 'cc';
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
    @property(Node)
    KnapsackPanel: Node = null!;

    start() {
        this.btn_fold?.node.on(Button.EventType.CLICK, this.hideSubBtns, this);
        this.btn_expand?.node.on(Button.EventType.CLICK, this.showSubBtns, this);
    }

    private hideSubBtns() {
        this.subBtnsAnim.play('sub_fold');
        this.subBtnsAnim.once(Animation.EventType.FINISHED, () => {
            this.btn_expand.node.active = true;
            this.btn_fold.node.active = false;
            this.knapsackPanel.active = false;
        });
    }

    private showSubBtns() {
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
}