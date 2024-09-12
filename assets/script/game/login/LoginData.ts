import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('LoginData')
export class LoginData {

    /** 登录token */
    private token: string = '';
    set Token(token: string) {
        this.token = token;
    }
    get Token() {
        return this.token;
    }

    /** 用户ID */
    private userId: number = 0;
    set UserId(userId: number) {
        this.userId = userId;
    }
    get UserId() {
        return this.userId;
    }

    /** 用户名称 */
    private userName: string = '';
    set UserName(userName: string) {
        this.userName = userName;
    }
    get UserName() {
        return this.userName;
    }

    /** 用户头像 */
    private userAvatar: string = '';
    set UserAvatar(userAvatar: string) {
        this.userAvatar = userAvatar;
    }
    get UserAvatar() {
        return this.userAvatar;
    }

    /** 用户邮箱 */
    private userEmail: string = '';
    set UserEmail(userEmail: string) {
        this.userEmail = userEmail;
    }
    get UserEmail() {
        return this.userEmail;
    }

}


