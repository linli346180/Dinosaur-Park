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
            configDataRes.userInstbData.sort((a, b) => a.id - b.id);
            entity.STBConfigMode.instbConfigData = configDataRes.userInstbData;
            // 获取用户星兽价格
            const UserPrizeRes = await AccountNetService.getUserPrize();
            if (UserPrizeRes && UserPrizeRes.userStbPrizeArr) {
                let i = 0;
                entity.STBConfigMode.instbConfigData.forEach(item => {
                    let purConCoinNumArray = Number(item.purConCoinNum);
                    let userStbPrizeArrExtraPrize = 0;
                    if(i<UserPrizeRes.userStbPrizeArr.length)
                    {
                        userStbPrizeArrExtraPrize = Number(UserPrizeRes.userStbPrizeArr[i].extraPrize);
                        i++;
                        item.purConCoinNum = userStbPrizeArrExtraPrize;
                    }else{
                        item.purConCoinNum = purConCoinNumArray;
                    }
                });
            }
        }

        // 获取用户星兽数据
        const res = await AccountNetService.GetUserSTBData();
        if (res && res.userInstbData) {
            // 收益星兽
            if (res.userInstbData.UserInstb) {
                entity.AccountModel.setUserInstb(res.userInstbData.UserInstb);
            } 

            if (res.userInstbData.UserNinstb) {
                for (const stbItem of res.userInstbData.UserNinstb) {
                    if (stbItem.position > 12 || stbItem.position < 1) {
                        console.error("星兽位置错误", stbItem);
                        continue
                    }
                    entity.AccountModel.addUserUnInComeSTB(stbItem);
                }
            }
        }
        oops.message.dispatchEvent(GameEvent.DataInitialized);
        entity.remove(AccountNetDataComp);
    }
}

// @ecs.register('Account')
// export class AccountGuideComp extends ecs.ComblockSystem implements ecs.IEntityEnterSystem {
//     filter(): ecs.IMatcher {
//         return ecs.allOf(AccountNetDataComp, AccountModelComp);
//     }

//     async entityEnter(entity: Account): Promise<void> {
//         entity.AccountModel.createGuideData();
//     }
// }