import { _decorator, Component, Node, Button, EditBox } from 'cc';
import { resources } from 'cc';
import { SpriteFrame } from 'cc';
import { Texture2D } from 'cc';
import { Prefab } from 'cc';
import { netChannelManager, NetChannelManager } from '../common/network/NetChannelManager';
import { netConfig } from '../common/network/NetConfig';
import { AccountNetService } from '../account/AccountNet';
const { ccclass, property } = _decorator;

@ccclass('LoginComp')
export class LoginComp extends Component {
    @property(EditBox)
    username: EditBox = null!;
    @property(EditBox)
    password: EditBox = null!;
    @property(Button)
    loginBtn: Button = null!;
    async start() {

        console.log("xxxxxxxxxxxxxxxxx");

        // 加载 Prefab
        // resources.load("test_assets/prefab", Prefab, (err, prefab) => {
        //     if (err) {
        //         console.error("error11111", err);
        //         return;
        //     }
        // });

        // fetch("http://konglong.live/tgapp/api/login", {
        //     headers: {"Content-Type": "application/x-www-form-urlencoded"},
        //     method: "POST",
        //     body: "account=account&password=123456" //JSON.stringify({account: "account", password: "123456"})
        // }).then((response: Response) => {
        //     return response.json();
        // }).then((value) => {
        //     console.log("调试："+JSON.stringify(value));
        // });

        // 这个是正常请求
        // let url = "http://konglong.live/tgapp/api/login";
        // var ri: RequestInit = {
        //     /** 用于设置请求的方法的字符串(GET, POST, PUT, DELETE) */
        //     method: "POST",
        //     /** Headers对象、对象文字或两个项数组的数组来设置请求的标头。 */
        //     headers: {"Content-Type": "application/x-www-form-urlencoded"},
        //     /** BodyInit对象或null以设置请求的正文 */
        //     body: "account=account&password=123456",
        // }
        // fetch(url, ri).then((response: Response): any => {
        //     return response.json();
        // }).then((value: any) => {
        //     console.log("调试1："+JSON.stringify(value));
        // }).catch((reason: any) => {
        //     console.log("调试2："+JSON.stringify(reason));
        // });

        const response = await netChannelManager.LoginAccount();


        AccountNetService.getStartBeastConfig();

        // let url = 'http://konglong.live/tgapp/api/stb/cfg/list';
        // let query = '?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3MjczMzkxNTQsImlhdCI6MTcyNzMyODM1NCwiaWQiOjUsImlzcyI6ImpoeWoiLCJtb2JpbGUiOiIiLCJuYmYiOjE3MjczMjgzNTR9.-RDH-X7a0tlL3Ir61H_HM2-whRSqtw64C7xZo-LSAGM';
        // fetch(url+ "?token="+netConfig.Token)
        // .then(response => response.json()) // 假设服务器返回的是JSON数据
        // .then(data => console.log("调试："+JSON.stringify(data)))
        // .catch(error => console.log('Error:'+error.message));

    }

}