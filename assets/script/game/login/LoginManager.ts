// import { LoginData } from './LoginData';
// import { HttpManager } from '../common/network/HttpManager';
// import { oops } from '../../../../extensions/oops-plugin-framework/assets/core/Oops';

// export type loginEvent = (response: any) => void;

// export class LoginManager {

//     loginData: LoginData = new LoginData();

//     onLoginSucess: Function | null = null;
//     onLoginFail: Function | null = null;

//     async onLogin(username: string, password: string, onSucess?: loginEvent, onFail?: Function) {
//         try {
//             this.onLoginSucess = onSucess ?? null;
//             this.onLoginFail = onFail ?? null;

//             const http = new HttpManager();
//             // http.server = oops.config.game.httpServer;
//             http.server = 'http://54.169.243.11:10000/';
//             http.timeout = 10000;
//             const params = {
//                 'account': username,
//                 'password': password
//             };
//             const response = await http.postJson("tgapp/api/login", JSON.stringify(params));
//             if (response.isSucc) {
//                 console.log("请求成功", response);
//                 this.ParamLoginData(response.res);
//             } else {
//                 console.error("请求失败", response);
//                 this.onLoginFail && this.onLoginFail("请求失败");
//             }
//         } catch (error) {
//             console.error("请求异常", error);
//             this.onLoginFail && this.onLoginFail();
//         }
//     }

//     ParamLoginData(params: any) {
//         if (params.resultCode == "OK") {
//             this.loginData.Token = params.token;
//             this.loginData.UserId = params.user.ID;
//             this.loginData.UserName = params.user.Name;
//             this.loginData.UserAvatar = params.user.AvatarPath;

//             console.log("登录成功", this.loginData);
//             this.onLoginSucess && this.onLoginSucess(this.loginData);
//         }
//         else {
//             console.error("登录失败", params.resultCode);
//             this.onLoginFail && this.onLoginFail(params.resultCode);
//         }
//     }
// }


// export const loginManager = new LoginManager();

