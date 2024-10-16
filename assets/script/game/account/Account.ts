import { oops } from "../../../../extensions/oops-plugin-framework/assets/core/Oops";
import { ecs } from "../../../../extensions/oops-plugin-framework/assets/libs/ecs/ECS";
import { GameEvent } from "../common/config/GameEvent";
import { UIID } from "../common/config/GameUIConfig";
import { AccountEvent } from "./AccountEvent";
import { AccountNetService } from "./AccountNet";
import { AccountModelComp, IStartBeastData } from "./model/AccountModelComp";
import { IsIncome, STBConfigModeComp, UserInstbConfigData } from "./model/STBConfigModeComp";
import { AccountNetDataComp } from "./system/AccountNetData";
import { AccountEmailComp } from "./system/ChangeEmail";
import { AccountNickNameComp } from "./system/ChangeNickName";
import { NetCmd, NetErrorCode } from "../../net/custom/NetErrorCode";
import { netChannel } from "../../net/custom/NetChannelManager";

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

    // 使用 MaxSlotNum 类型定义最大槽位数量
    maxslotNum: number = 12;

    // 视图层View
    protected init() {
        this.addComponents<ecs.Comp>(AccountModelComp);
        this.addComponents<ecs.Comp>(STBConfigModeComp);
        oops.message.on(GameEvent.APPInitialized, this.onHandler, this);
        oops.message.on(GameEvent.LoginSuccess, this.onHandler, this);
        oops.message.on(GameEvent.GameServerConnected, this.onHandler, this);
    }

    destroy(): void {
        oops.message.off(GameEvent.APPInitialized, this.onHandler, this);
        oops.message.off(GameEvent.LoginSuccess, this.onHandler, this);
        oops.message.off(GameEvent.GameServerConnected, this.onHandler, this);
        super.destroy();
    }

    private onHandler(event: string, args: any) {
        switch (event) {
            case GameEvent.APPInitialized:
                this.add(AccountNetDataComp);
                break;
            case GameEvent.LoginSuccess:
                oops.storage.setUser(this.AccountModel.user.id.toString());
                oops.audio.load();
                this.loadUserLanguage();
                oops.gui.open(UIID.Map);
                oops.gui.open(UIID.Main);

                // WebSocket连接
                netChannel.gameCreate();
                netChannel.gameConnect();
                netChannel.game.on(NetCmd.UserNinstbType, '', (data) => {
                    this.OnRecevieMessage(NetCmd.UserNinstbType, data);
                });
                break;

            case GameEvent.GameServerConnected:
                break;
        }
    }

    /** 加载化语言包（可选） */
    private loadUserLanguage() {
        // 设置默认语言
        let lan = oops.storage.get("language");
        if (lan == null || lan == "") {
            lan = "zh";
            oops.storage.set("language", lan);
        }

        // 加载语言包资源
        oops.language.setLanguage(lan, (a)=>{});
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


    /**
     *  领养星兽
     * @param stbConfigId - 星兽配置ID
     * @param autoAdop - A boolean indicating whether the adoption process should be automatic.
     * @param callback - A callback function that will be called with a boolean parameter indicating the success of the adoption process.
     */
    async adopStartBeastNet(stbConfigId: number, autoAdop: boolean, callback: (success: boolean, msg: string) => void) {
        const res = await AccountNetService.adopStartBeast(stbConfigId);
        if (res.resultCode == NetErrorCode.Success) {
            if (!autoAdop)
                oops.message.dispatchEvent(AccountEvent.CoinDataChange);

            const STBData: IStartBeastData = res.userInstbSynthReData;
            let stbConfig = this.STBConfigMode.GetSTBConfigData(STBData.stbConfigID);
            if (stbConfig) {
                console.log("星兽配置:" + stbConfigId + "  收益类型: " + stbConfig.isIncome)
                if (stbConfig.isIncome == IsIncome.Yes) {
                    this.AccountModel.UserInstb.push(STBData);
                    console.log("领养收益星兽: ", STBData.id + " 名称:" + stbConfig.stbName);
                    oops.message.dispatchEvent(AccountEvent.AddInComeSTB, STBData.id);
                } else {
                    this.AccountModel.UserNinstb.push(STBData);
                    console.log("领养无收益星兽: ", STBData.id + " 名称:" + stbConfig.stbName + " 自动领养:" + autoAdop);
                    oops.message.dispatchEvent(autoAdop ? AccountEvent.AutoAddUnIncomeSTB : AccountEvent.AddUnIncomeSTB, STBData.id);
                }
                callback(true, "");
                return;
            }
        }
        callback(false, res.resultMsg);
    }

    private OnRecevieMessage(cmd: number, data: any) {
        if (cmd == NetCmd.UserNinstbType) {
            const STBData: IStartBeastData = data;
            let stbConfig = this.STBConfigMode.GetSTBConfigData(STBData.stbConfigID);
            if (stbConfig) {
                this.AccountModel.UserNinstb.push(STBData)
                oops.message.dispatchEvent(AccountEvent.AutoAddUnIncomeSTB, STBData.id);
            }
        }
    }

    /**
     * 合并无收益星兽
     * @param stbID_to - The ID of the STB to merge into.
     * @param stbID_del - The ID of the STB to be deleted.
     * @param callback - A callback function that is called with a boolean parameter indicating the success of the merge operation.
     */
    async mergeUnIncomeSTBNet(stbID_to: number, stbID_del: number, callback: (success: boolean) => void) {
        const res = await AccountNetService.mergeGoldNinSTB(stbID_to, stbID_del);
        if (res) {
            const STBData: IStartBeastData = res.userNinstb;
            if (STBData) {
                const stbConfigID = STBData.stbConfigID;
                let stbConfig = this.STBConfigMode.GetSTBConfigData(stbConfigID);
                if (stbConfig) {
                    if (stbConfig.isIncome == IsIncome.Yes) {
                        console.log("升级十级星兽:", STBData.id);
                        this.AccountModel.delUserUnIncomeSTB(stbID_to);
                        this.AccountModel.delUserUnIncomeSTB(stbID_del);
                        this.AccountModel.addInComeSTBData(STBData);
                        oops.message.dispatchEvent(AccountEvent.DelUnIncomeSTB, stbID_to);
                        oops.message.dispatchEvent(AccountEvent.DelUnIncomeSTB, stbID_del);
                        oops.message.dispatchEvent(AccountEvent.AddInComeSTB, STBData.id);
                    }
                    else {
                        console.log("升级星兽:", STBData.id);
                        this.AccountModel.updateUnIncomeSTBData(STBData);
                        this.AccountModel.delUserUnIncomeSTB(stbID_del);
                        oops.message.dispatchEvent(AccountEvent.DelUnIncomeSTB, stbID_del);
                        oops.message.dispatchEvent(AccountEvent.UpdateUnIncomeSTB, STBData.id);
                    }
                    callback(true);
                    return;
                }
            }
        }
        callback(false);
    }


    /**
     * 收益星兽合成
     * @param stbID1 - 星兽ID1
     * @param stbID2 - 星兽ID2
     * @param isUpProb - 是否使用宝石提升概率 1:是 2:否
     * @param callback - 合成结果回调
     * @returns void
     */
    async mergeIncomeSTBNet(stbID1: number, stbID2: number, isUpProb: number, callback: (success: boolean, msg: string) => void) {
        let res = await AccountNetService.mergeGoldSTB(stbID1, stbID2, isUpProb);
        if (res.resultCode == NetErrorCode.Success) {
            // 删除合成的两个星兽
            this.AccountModel.delUserInComeSTB(stbID1);
            this.AccountModel.delUserInComeSTB(stbID2);
            oops.message.dispatchEvent(AccountEvent.DedIncomeSTB, stbID1);
            oops.message.dispatchEvent(AccountEvent.DedIncomeSTB, stbID2);

            // 合成是否成功
            if (res.isSucc) {
                this.AccountModel.addInComeSTBData(res.userInStb);
                oops.message.dispatchEvent(AccountEvent.AddInComeSTB, res.userInStb.id);
                callback(true, "合成成功");
            } else {
                callback(false, "合成失败");
            }

            // 更新宝石数量
            if (isUpProb == 1)
                oops.message.dispatchEvent(AccountEvent.CoinDataChange);
        }
        callback(false, res.resultMsg);
    }


    /** 设置星兽(无收益星兽)位置 */
    async changeSTBSlotIdNet(stbId: number, slotId: number, callback: (success: boolean) => void) {
        const res = await AccountNetService.swapPosition(stbId, slotId);
        if (res) {
            let stbData = this.AccountModel.UserNinstb;
            const index = stbData.findIndex((element) => element.id === stbId);
            if (index !== -1) {
                stbData[index].stbPosition = slotId;
                callback(true);
                return;
            }
        }
        callback(false);
    }

    /**
     * 获取星兽剩余存活时间
     * @param stbId - 星兽ID
     * @returns 存活时间, 0:已经死亡, >0:剩余存活时间(秒) -1:不限制存活时间
     */
    getSTBSurvivalSec(stbId: number): number {
        // let stbData = this.AccountModel.getUserSTBData(stbId);
        // if (stbData) {
        //     const stbConfigID = stbData.stbConfigID;
        //     let stbConfig = this.STBConfigMode.GetSTBConfigData(stbConfigID);
        //     if (stbConfig) {
        //         if (stbConfig.stbSurvival > 0) {
        //             const createdTime = new Date(stbData.createdAt);
        //             const diffTime = new Date().getTime() - createdTime.getTime();
        //             const elapsedSecs = Math.floor(diffTime / 1000);
        //             return Math.max(0, stbConfig.stbSurvival - elapsedSecs);
        //         }
        //     }
        // }
        return -1;
    }

    /**
     * 获取指定类型的星兽数据
     * @param stbId - 星兽ID
     * @param isIncome - 是否为收益星兽
     * @returns 返回星兽数据
     */
    getUserSTBData(stbId: number): IStartBeastData | null {
        let index = this.AccountModel.UserInstb.findIndex((element) => element.id === stbId);
        if (index !== -1) {
            return this.AccountModel.UserInstb[index];
        }

        index = this.AccountModel.UserNinstb.findIndex((element) => element.id === stbId);
        if (index !== -1) {
            return this.AccountModel.UserNinstb[index];
        }
        return null;
    }

    /**
     * 删除用户星兽
     * @param stbId - 星兽ID
     * @returns 是否删除成功
     */
    delUserSTBData(stb: number): boolean {
        this.AccountModel.delUserInComeSTB(stb);
        this.AccountModel.delUserUnIncomeSTB(stb);
        return true;
    }

    /** 获取指定类型的星兽数据 */
    getSTBDataByConfigId(configId: number): IStartBeastData[] {
        let dataList: IStartBeastData[] = [];
        if (this.AccountModel.UserNinstb) {
            this.AccountModel.UserNinstb.forEach((element) => {
                if (element.stbConfigID == configId) {
                    dataList.push(element);
                }
            });
        }

        if (this.AccountModel.UserInstb) {
            this.AccountModel.UserInstb.forEach((element) => {
                if (element.stbConfigID == configId) {
                    dataList.push(element);
                }
            });
        }
        return dataList;
    }

    /** 获取星兽配置 */
    getSTBConfig(configId: number): UserInstbConfigData | null {
        for (const element of this.STBConfigMode.instbConfigData) {
            if (element.id == configId) {
                return element;
            }
        }
        console.error("未找到配置:", configId);
        return null;
    }
}