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

  STBLevelUp = "STBLevelUp",  // 星兽升级

  AddUnIncomeSTB = "AddUnIncomeSTB",  // 添加无收益星兽
  DelUnIncomeSTB = "DelUnIncomeSTB",  // 移除无收益星兽
  UpdateUnIncomeSTB = "UpdateUnIncomeSTB",  // 升级无收益星兽
  AutoAddUnIncomeSTB = "AutoAddUnIncomeSTB",  // 系统添加无收益星兽

  AddInComeSTB = "AddInComeSTB",  // 添加收益星兽
  DedIncomeSTB = "DedIncomeSTB",  // 删除收益星兽

  UserCollectCoin = "UserCollectCoin",  // 用户收集金币
  CoinDataChange = "CoinDataChange",  // 货币数据变化

  UserNoOperation = "UserNoOperation",  // 长时间无操作
  UserOperation = "UserOperation",  // 长时间无操作
}
