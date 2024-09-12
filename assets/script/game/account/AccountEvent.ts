import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

/** 账号模块全局事件 */
export enum AccountEvent {

  /** 登陆成功 */
  LoginSuccess = "LoginSuccess",

  /** 获取到配置 */
  STBConfigSuccess = "STBConfigSuccess",

  /** 修改头像 */
  ChangeAvatar = "ChangeAvatar",
  /** 修改昵称 */
  ChangeNickName = "ChangeNickName",
  /** 修改邮箱 */
  ChangeEmail = "ChangeEmail",


  AddUserNinSTB = "AddUserNinSTB",  // 添加无收益星兽
  DelUserNinSTB = "DelUserNinSTB",  // 移除无收益星兽

  AddUserSTB = "AddUserSTB",  // 添加有收益星兽
  DelUserSTB = "DelUserSTB",  // 删除 有收益星兽
}
