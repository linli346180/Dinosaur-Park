import { Label } from 'cc';
import { _decorator, Component, Node } from 'cc';
import { InviteRewardConfig } from './InviteData';
const { ccclass, property } = _decorator;

@ccclass('InviteRewardItem')
export class InviteRewardItem extends Component {
    @property(Label)
    desc: Label = null!;

    public initItem(config: InviteRewardConfig) {
        this.desc.string = config.inviteExplain;
    }
}


