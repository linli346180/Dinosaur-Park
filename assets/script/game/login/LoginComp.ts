import { _decorator, Component, Node,Button ,EditBox } from 'cc';
import { loginManager, LoginManager } from './LoginManager';
import { netChannelManager } from '../common/network/NetChannelManager';
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
        this.loginBtn.node.on(Button.EventType.CLICK, this.onLogin, this);
    }

    async onLogin() {


        netChannelManager.test();

        const url = "https://jsonplaceholder.typicode.com/posts"; // 使用 JSONPlaceholder 的测试 API

        fetch(url)
        .then((response) => {
            if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json(); // 解析响应为 JSON
        })
        .then((data) => {
            console.log("Fetched Data:", data); // 输出获取的数据
        })
        .catch((error) => {
            console.error("Fetch Error:", error); // 捕捉并输出错误
        });


        // const Username = this.username?.string;
        // const Password = this.password?.string;
        // loginManager.onLogin(Username, Password, () => {
        // }, (errorInfo: any) => {
        // });
    }
}