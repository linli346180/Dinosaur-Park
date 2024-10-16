import { _decorator } from 'cc';
import { ecs } from '../../../../../extensions/oops-plugin-framework/assets/libs/ecs/ECS';
import { AccountModelComp } from '../model/AccountModelComp';
import { Account } from '../Account';
import { oops } from '../../../../../extensions/oops-plugin-framework/assets/core/Oops';
import { AccountNetService } from '../AccountNet';
import { TGNetService } from '../../../telegram/TGNet';
import { EDITOR } from 'cc/env';
import { netChannel } from '../../../net/custom/NetChannelManager';
import { GameEvent } from '../../common/config/GameEvent';
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
        if (EDITOR) {
            const response = await AccountNetService.LoginTestAccount();
            if (response) {
                this.OnLogonResponse(entity, response);
            }
        } else {
            const TGAppData = await TGNetService.GetTelegramAPPData();
            const response = await AccountNetService.LoginTGAcount(TGAppData);
            if (response) {
                this.OnLogonResponse(entity, response);
            }
        }
        entity.remove(AccountNetDataComp);
    }

    async OnLogonResponse(entity: Account, response: any) {
        entity.AccountModel.user = response.user;

        // 获取星兽配置数据
        const configDataRes = await AccountNetService.getStartBeastConfig();
        if (configDataRes && configDataRes.userInstbData) {
            entity.STBConfigMode.instbConfigData = configDataRes.userInstbData;
        }

        // 获取用户星兽数据
        const stbDataRes = await AccountNetService.GetUserSTBData();
        if (stbDataRes && stbDataRes.userInstbData) {
            // 收益星兽
            if (stbDataRes.userInstbData.UserInstb) {
                entity.AccountModel.UserInstb = stbDataRes.userInstbData.UserInstb;
            }
            // 无收益星守
            if (stbDataRes.userInstbData.UserNinstb) {
                entity.AccountModel.UserNinstb = stbDataRes.userInstbData.UserNinstb;
            }
        }

        oops.message.dispatchEvent(GameEvent.LoginSuccess);
    }
}