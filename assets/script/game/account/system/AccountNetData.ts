import { _decorator } from 'cc';
import { ecs } from '../../../../../extensions/oops-plugin-framework/assets/libs/ecs/ECS';
import { AccountModelComp, StartBeastData } from '../model/AccountModelComp';
import { Account } from '../Account';
import { oops } from '../../../../../extensions/oops-plugin-framework/assets/core/Oops';
import { AccountNetService } from '../AccountNet';
import { TGNetService } from '../../../telegram/TGNet';
import { GameEvent } from '../../common/config/GameEvent';
import { EDITOR } from 'cc/env';
import { sys } from 'cc';


/** 请求玩家游戏数据 */
@ecs.register('AccountNetData')
export class AccountNetDataComp extends ecs.Comp {
    reset() { }
}

/** 请求玩家游戏数据 */
@ecs.register('Account')
export class AccountNetData extends ecs.ComblockSystem implements ecs.IEntityEnterSystem {
    filter(): ecs.IMatcher {
        return ecs.allOf(AccountNetDataComp, AccountModelComp);
    }

    async entityEnter(entity: Account): Promise<void> {
        // 获取用户货币数据
        const coinDataRes = await AccountNetService.getUserCoinData();
        if (coinDataRes && coinDataRes.userCoin != null) {
            entity.AccountModel.CoinData = coinDataRes.userCoin;
        }

        // 获取星兽配置数据
        const configDataRes = await AccountNetService.getStartBeastConfig();
        if (configDataRes && configDataRes.userInstbData != null) {
            entity.STBConfigMode.instbConfigData = configDataRes.userInstbData;
        }

        // 获取用户星兽数据
        const res = await AccountNetService.GetUserSTBData();
        if (res && res.userInstbData != null) {
            // 收益星兽
            if (res.userInstbData.UserInstb != null) {
                entity.AccountModel.setUserInstb(res.userInstbData.UserInstb);
            } else {
                console.log("收益星兽为空");
            }

            // TODO  无收益星守过滤配置为空的星兽
            if (res.userInstbData.UserNinstb != null) {
                for (const stbItem of res.userInstbData.UserNinstb) {
                    if (stbItem.stbConfigID > 0) {
                        entity.AccountModel.addUserUnInComeSTB(stbItem);
                    } else {
                        console.log("星兽配置ID为空");
                    }
                }
            }
            else {
                console.log("无收益星兽为空");
            }
        }
        oops.message.dispatchEvent(GameEvent.DataInitialized);
        entity.remove(AccountNetDataComp);
    }
}