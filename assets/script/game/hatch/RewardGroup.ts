import { Prefab } from 'cc';
import { Label } from 'cc';
import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

/** 奖励组 */
@ccclass('RewardGroup')
export class RewardGroup extends Component {
    @property(Node)
    groupTitle: Node = null!;
    @property(Node)
    container: Node = null!;

    private _title: Label | null = null!;

    start() {
        this._title = this.groupTitle?.getComponent(Label);
    }

    update(deltaTime: number) {

    }

    InitUI() {

    }
}


