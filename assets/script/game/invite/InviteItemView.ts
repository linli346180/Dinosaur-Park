import { Label } from 'cc';
import { ImageAsset } from 'cc';
import { SpriteFrame } from 'cc';
import { Texture2D } from 'cc';
import { assetManager } from 'cc';
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

    private loadIcon(url: string) {
        if (!url || url.length === 0) {
            return;
        }
        assetManager.loadRemote<ImageAsset>(url, (err, imageAsset) => {
            if (!err) {
                const texture = new Texture2D();
                texture.image = imageAsset;
                const spriteFrame = new SpriteFrame();
                spriteFrame.texture = texture;
                this.userIcon.spriteFrame = spriteFrame;
            }
        });
    }
}


