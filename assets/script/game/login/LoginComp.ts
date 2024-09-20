import { _decorator, Component, Node, Button, EditBox } from 'cc';
import { resources } from 'cc';
import { SpriteFrame } from 'cc';
import { Texture2D } from 'cc';
import { Prefab } from 'cc';
import { netChannelManager, NetChannelManager } from '../common/network/NetChannelManager';
const { ccclass, property } = _decorator;

@ccclass('LoginComp')
export class LoginComp extends Component {
    @property(EditBox)
    username: EditBox = null!;
    @property(EditBox)
    password: EditBox = null!;
    @property(Button)
    loginBtn: Button = null!;
    start() {

        console.log("xxxxxxxxxxxxxxxxx");

        // 加载 Prefab
        // resources.load("test_assets/prefab", Prefab, (err, prefab) => {
        //     if (err) {
        //         console.error("error11111", err);
        //         return;
        //     }
        // });

        netChannelManager.test();

    }

}