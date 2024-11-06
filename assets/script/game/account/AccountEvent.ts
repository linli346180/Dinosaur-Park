import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

/** 账号模块全局事件 */
export enum AccountEvent {
  /** 切换多语言 */
  ChangeLanguage = "ChangeLanguage",

  /** 获取到配置 */
  STBConfigSuccess = "STBConfigSuccess",

  /** 修改头像 */
  ChangeAvatar = "ChangeAvatar",
  /** 修改昵称 */
  ChangeNickName = "ChangeNickName",
  /** 修改邮箱 */
  ChangeEmail = "ChangeEmail",

  RedDotCmd = "RedDotCmd",  // 红点命令

  AddUnIncomeSTB = "AddUnIncomeSTB",  // 添加无收益星兽
  DelUnIncomeSTB = "DelUnIncomeSTB",  // 移除无收益星兽
  
  LevelUpUnIncomeSTB = "UpdateUnIncomeSTB",  // 无收益星兽升级
  EvolveUnIncomeSTB = "EvolveUnIncomeSTB",  // 无收益星兽进化
  AutoAddUnIncomeSTB = "AutoAddUnIncomeSTB",  // 系统添加无收益星兽

  AddInComeSTB = "AddInComeSTB",  // 添加收益星兽
  DelIncomeSTB = "DelIncomeSTB",  // 删除收益星兽

  UserCollectGold = "UserCollectCoin",  // 用户收集金币
  UserBounsUSTD = "UserBounsSTD",  // stb奖励

  CoinDataChange = "CoinDataChange",  // 货币数据变化

  UserNoOperation = "UserNoOperation",  // 长时间无操作
  UserOperation = "UserOperation",  // 用户操作
  HideUserOperation = "HideUserOperation",  // 用户操作
}
