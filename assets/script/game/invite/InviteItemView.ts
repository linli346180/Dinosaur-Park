import { Label } from 'cc';
import { Sprite } from 'cc';
import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('InviteItemView')
export class InviteItemView extends Component {
    @property(Sprite)
    userIcon: Sprite = null!;
    @property(Label)
    userName: Label = null!;

    initItem(userName: string, userIcon: string) {
        this.userName.string = userName;
        this.loadIcon(userIcon);
    }

    private loadIcon(userIcon: string) {
        // TODO 加载头像
    }
}


