import { _decorator, Component, Node } from 'cc';
import { HttpManager, ResultCode } from './HttpManager';
import { netConfig } from './NetConfig';
const { ccclass, property } = _decorator;

@ccclass('NetChannelManager')
export class NetChannelManager {

    async test() {
        const http = new HttpManager();
        // http.server = "https://jsonplaceholder.typicode.com/posts";
        http.server = " http://54.151.192.122/api/test/login";
       
        http.timeout = netConfig.Timeout;

        const response = await http.postJson("");
        if (response.isSucc) {
            console.log("Fetched Data:", response); // 输出获取的数据
            return response.res;
        } else {
            console.error("Fetch Error:", response); // 捕捉并输出错误
            return null;
        }
    }

    /** 登录账号 */
    async LoginAccount() {
        const http = new HttpManager();
        http.server = netConfig.Server;
        http.timeout = netConfig.Timeout;
        const params = {
            'account': netConfig.Account,
            'password': netConfig.Password
        };
        const paramString = new URLSearchParams(params).toString();
        const response = await http.postUrl("tgapp/api/login", paramString);
        if (response.isSucc && response.res.resultCode == ResultCode.OK) {
            netConfig.Token = response.res.token;
            console.warn("登录成功", http.url + response.res);
            alert("登录结果:"+response.res.token);
            return response.res;
        } else {
            console.error("登录异常",http.url +  response);
            alert("登录异常:"+ http.url + response);
            return null;
        }
    }
}

export const netChannelManager = new NetChannelManager();

