import { _decorator } from 'cc';
import { ecs } from '../../../../../extensions/oops-plugin-framework/assets/libs/ecs/ECS';
import { AccountModelComp } from '../model/AccountModelComp';
import { Account } from '../Account';
import { oops } from '../../../../../extensions/oops-plugin-framework/assets/core/Oops';
import { AccountNetService } from '../AccountNet';
import { TGNetService } from '../../../telegram/TGNet';
import { EDITOR } from 'cc/env';
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
        console.log('当前平台:', sys.platform);
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
        if (configDataRes && configDataRes.userInstbData != null) {
            entity.STBConfigMode.instbConfigData = configDataRes.userInstbData;
        }

        // 获取用户星兽数据
        const res = await AccountNetService.GetUserSTBData();
        if (res && res.userInstbData != null) {
            const instbData = res.userInstbData;

            const UserInstb = instbData.UserInstb;
            if (UserInstb != null) {
                entity.AccountModel.UserInstb = UserInstb;
            } else {
                entity.AccountModel.UserInstb = [];
                console.log("收益星兽为空");
            }

            const UserNinstb = instbData.UserNinstb;
            if (UserNinstb != null) {
                entity.AccountModel.UserNinstb = UserNinstb;
            }
            else {
                entity.AccountModel.UserNinstb = [];
                console.log("无收益星兽为空");
            }
        }

        oops.message.dispatchEvent(GameEvent.LoginSuccess);
    }
}