/*
 * @Author: dgflash
 * @Date: 2021-11-11 17:45:23
 * @LastEditors: dgflash
 * @LastEditTime: 2022-08-01 13:49:37
 */
import { oops } from "../../../../extensions/oops-plugin-framework/assets/core/Oops";
import { ecs } from "../../../../extensions/oops-plugin-framework/assets/libs/ecs/ECS";
import { GameEvent } from "../common/config/GameEvent";
import { UIID } from "../common/config/GameUIConfig";
import { netChannelManager } from "../common/network/NetChannelManager";
import { AccountEvent } from "./AccountEvent";
import { AccountNetService } from "./AccountNet";
import { AccountModelComp, IStartBeastData, UserData, IUserInstbData } from "./model/AccountModelComp";
import { IsPur, PurConCoin, STBConfigModeComp, UserInstbConfigData } from "./model/STBConfigModeComp";
import { AccountNetDataComp } from "./system/AccountNetData";
import { AccountEmailComp } from "./system/ChangeEmail";
import { AccountNickNameComp } from "./system/ChangeNickName";
import { STBConfigNetDataComp } from "./system/STBConfigNetData";


/** 账号模块 */
@ecs.register('Account')
export class Account extends ecs.Entity {
    // 数据层Model
    AccountModel !: AccountModelComp;
    STBConfigMode!: STBConfigModeComp;

    // 业务层System
    AccountNickName !: AccountNickNameComp;
    AccountEmail !: AccountEmailComp;
    AccountNetData !: AccountNetDataComp;
    STBConfigNetData !: STBConfigNetDataComp;

    // 使用 MaxSlotNum 类型定义最大槽位数量
    maxslotNum: number = 12;

    // 视图层View
    protected init() {
        this.addComponents<ecs.Comp>(AccountModelComp);
        this.addComponents<ecs.Comp>(STBConfigModeComp);
        oops.message.on(GameEvent.LoginSuccess, this.onHandler, this);

        // 发送请求用户数据
        this.add(AccountNetDataComp);
    }

    destroy(): void {
        oops.message.off(GameEvent.LoginSuccess, this.onHandler, this);
        super.destroy();
    }

    private onHandler(event: string, args: any) {
        switch (event) {
            case GameEvent.LoginSuccess:
                oops.storage.setUser(this.AccountModel.user.ID.toString());
                oops.audio.load();

                oops.gui.open(UIID.Map);
                oops.gui.open(UIID.Main);

                this.add(STBConfigNetDataComp);
                break;
        }
    }

    changeAvatar(avatar: string) {

    }

    /** 修改昵称 */
    changeNickname(nickname: string) {
        let comp = this.add(AccountNickNameComp);
        comp.nickname = nickname;
    }

    /** 修改邮箱 */
    changeEmail(email: string) {
        let comp = this.add(AccountEmailComp);
        comp.email = email;
    }

    stockConfig() {
        // oops.storage.set("UserConfigData", JSON.stringify(this.AccountModel.userData))
        // console.log("存储结果:" + oops.storage.get("UserConfigData"))
    }

    /** 领养星兽 */
    adopStartBeastNet(adopStbID: number) {
        netChannelManager.adopStartBeast(adopStbID).then((res) => {
            if (res) {
                let userInstbData = this.AccountModel.userInstbData.UserNinstb;
                let STBData = res.userInstbSynthReData;
                userInstbData.push({
                    id: STBData.id,
                    createdAt: STBData.createdAt,
                    updatedAt: STBData.updatedAt,
                    userID: STBData.userID,
                    stbConfigID: STBData.stbConfigID,
                    stbPosition: STBData.stbPosition,
                    LastIncomeTime: STBData.LastIncomeTime
                });
                oops.message.dispatchEvent(AccountEvent.AddUserNinSTB, STBData.id);
            }
        });
    }

    /** 合成星兽 */
    mergeStartBeatNet(stbID_first: number, stbID_last: number) {
        AccountNetService.mergeGoldNinSTB(stbID_first, stbID_last).then((res) => {
            if (res) {
                this.AccountModel.delUserNinSTB(stbID_first);
                this.AccountModel.delUserNinSTB(stbID_last);
                oops.message.dispatchEvent(AccountEvent.DelUserNinSTB, stbID_first);
                oops.message.dispatchEvent(AccountEvent.DelUserNinSTB, stbID_last);

                if (res.userNinstb) {
                    const stbConfigID = res.userNinstb.stbConfigID;
                    if (stbConfigID <= 9) {
                        console.log("合成无收益星兽:", res.userNinstb.id);
                        this.AccountModel.addUserNinSTB(res.userNinstb);
                        oops.message.dispatchEvent(AccountEvent.AddUserNinSTB, res.userNinstb.id);
                    }
                    else {
                        console.log("合成有收益星兽:", res.userNinstb.id);
                        this.AccountModel.addUserSTB(res.userNinstb);
                        oops.message.dispatchEvent(AccountEvent.AddUserSTB, res.userNinstb.id);
                    }
                }
            }
        });
    }

    /** 设置位置 */
    setStrartBeatSlot(stbId: number, slotId: number): boolean {
        if (stbId < 1 || slotId < 1 || slotId > this.maxslotNum) {
            console.error("setStrartBeatSlot: 参数错误");
            return false;
        }

        AccountNetService.swapPosition(stbId, slotId).then((res) => {
            if (res == true) {
                let accUserNinstbData = this.AccountModel.userInstbData.UserNinstb;
                const index = accUserNinstbData.findIndex((element) => element.id === stbId);
                if (index !== -1) {
                    accUserNinstbData[index].stbPosition = slotId;
                }
                else {
                    console.error("数据更新失败:", stbId);
                }
            }
        });

        return true;
    }


    /** 领养星兽 */
    adopStartBeast(stbId: number, slotId: number): boolean {
        let accUserNinstbData = this.AccountModel.userInstbData.UserNinstb;
        const index = accUserNinstbData.findIndex((element) => element.id === stbId);
        if (index !== -1) {
            console.error("星兽已存在:", stbId);
            return false;
        }
        // accUserNinstbData.push({ id: stbId, stbConfigID: 1, stbPosition: slotId });
        return true;
    }



    /** 合成星兽 */
    mergeStartBeat(stbId_up: number, stbId_del: number): boolean {
        return this.AccountModel.delUserNinSTB(stbId_del) && this.AccountModel.upgradeUserNinSTB(stbId_up);
    }

    /** 获取星兽数据 */
    getUserNinstbData(stbId: number): IStartBeastData | null {
        let accUserNinstbData = this.AccountModel.userInstbData.UserNinstb;
        const index = accUserNinstbData.findIndex((element) => element.id === stbId);
        if (index !== -1) {
            return accUserNinstbData[index];
        }
        else {
            console.error("未找到星兽:", stbId);
        }
        return null;
    }
}


