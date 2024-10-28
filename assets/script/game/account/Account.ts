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
import { tips } from "../common/tips/TipsManager";
import { netConfig } from "../../net/custom/NetConfig";

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
                try {
                    netChannel.gameCreate();
                    netChannel.gameConnect();
                    netChannel.game.on(NetCmd.UserNinstbType, '', (data) => {
                        this.OnRecevieMessage(NetCmd.UserNinstbType, data);
                    });
                    netChannel.game.on(NetCmd.DownLineType, '', (data) => {
                        this.OnRecevieMessage(NetCmd.DownLineType, data);
                    });
                    netChannel.game.on(NetCmd.NinstbDeathType, '', (data) => {
                        this.OnRecevieMessage(NetCmd.NinstbDeathType, data);
                    });
                    netChannel.game.on(NetCmd.IncomeStbDeathType, '', (data) => {
                        this.OnRecevieMessage(NetCmd.IncomeStbDeathType, data);
                    });

                    netChannel.game.on(NetCmd.UserHatchType, '', (data) => {
                        this.OnRecevieMessage(NetCmd.UserHatchType, data);
                    });
                    netChannel.game.on(NetCmd.InvitedType, '', (data) => {
                        this.OnRecevieMessage(NetCmd.InvitedType, data);
                    });
                    netChannel.game.on(NetCmd.UserDebrisType, '', (data) => {
                        this.OnRecevieMessage(NetCmd.UserDebrisType, data);
                    });
                    netChannel.game.on(NetCmd.UserEmailType, '', (data) => {
                        this.OnRecevieMessage(NetCmd.UserEmailType, data);
                    });
                    netChannel.game.on(NetCmd.UserTaskType, '', (data) => {
                        this.OnRecevieMessage(NetCmd.UserTaskType, data);
                    });
                    netChannel.game.on(NetCmd.RankingType, '', (data) => {
                        this.OnRecevieMessage(NetCmd.RankingType, data);
                    });
                    netChannel.game.on(NetCmd.WithDrawalType, '', (data) => {
                        this.OnRecevieMessage(NetCmd.WithDrawalType, data);
                    });
                    netChannel.game.on(NetCmd.StbGurideType, '', (data) => {
                        this.OnRecevieMessage(NetCmd.StbGurideType, data);
                    });

                } catch (error) {
                    console.error("WebSocket连接失败:", error);
                }
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
        oops.language.setLanguage(lan, (a) => { });
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

    /**
     *  领养星兽
     * @param stbConfigId - 星兽配置ID
     * @param autoAdop - A boolean indicating whether the adoption process should be automatic.
     * @param callback - A callback function that will be called with a boolean parameter indicating the success of the adoption process.
     */
    async adopStartBeastNet(stbConfigId: number, autoAdop: boolean, callback: (success: boolean, msg: string) => void) {
        const res = await AccountNetService.adopStartBeast(stbConfigId);
        if (res.resultCode == NetErrorCode.Success) {
            if (!autoAdop) {
                const coinDataRes = await AccountNetService.getUserCoinData();
                if (coinDataRes && coinDataRes.userCoin != null) {
                    this.AccountModel.CoinData = coinDataRes.userCoin;
                    oops.message.dispatchEvent(AccountEvent.CoinDataChange);
                }
            }

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
        switch (cmd) {
            case NetCmd.UserNinstbType:
                console.log("自动领养1级黄金星兽");
                const STBData: IStartBeastData = data;
                let stbConfig = this.STBConfigMode.GetSTBConfigData(STBData.stbConfigID);
                if (stbConfig) {
                    this.AccountModel.UserNinstb.push(STBData)
                    oops.message.dispatchEvent(AccountEvent.AutoAddUnIncomeSTB, STBData.id);
                }
                break;

            case NetCmd.DownLineType:
                console.error("用户下线通知");
                tips.alert("异地登录退出应用", () => {
                    (window as any).Telegram.WebApp.close();
                }, "确认");
                break;

            case NetCmd.NinstbDeathType:
                console.log("无收益星兽死亡:", data.id);
                this.delUserSTBData(data.id);
                break;

            case NetCmd.IncomeStbDeathType:
                console.log("收益星兽死亡:", data.id);
                this.delUserSTBData(data.id);
                break;

            case NetCmd.UserHatchType:
            case NetCmd.InvitedType:
            case NetCmd.UserDebrisType:
            case NetCmd.UserEmailType:
            case NetCmd.UserTaskType:
            case NetCmd.RankingType:
            case NetCmd.StbGurideType:
                oops.message.dispatchEvent(AccountEvent.RedDotCmd, cmd);
                break;
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
        if (res && res.userNinstb != null) {
            const STBData: IStartBeastData = res.userNinstb;
            const stbConfigID = STBData.stbConfigID;
            let stbConfig = this.STBConfigMode.GetSTBConfigData(stbConfigID);
            if (stbConfig) {
                if (stbConfig.isIncome == IsIncome.Yes) {
                    console.log("升级十级星兽:", STBData.id);
                    this.AccountModel.addInComeSTBData(STBData);
                    this.AccountModel.delUserUnIncomeSTB(stbID_to);
                    this.AccountModel.delUserUnIncomeSTB(stbID_del);
                    oops.message.dispatchEvent(AccountEvent.DelUnIncomeSTB, stbID_del);
                    oops.message.dispatchEvent(AccountEvent.EvolveUnIncomeSTB, stbID_to);
                    setTimeout(() => {
                        oops.message.dispatchEvent(AccountEvent.AddInComeSTB, STBData.id);
                    }, 3000);

                }
                else {
                    console.log("升级星兽:", STBData.id);
                    this.AccountModel.updateUnIncomeSTBData(STBData);
                    this.AccountModel.delUserUnIncomeSTB(stbID_del);
                    oops.message.dispatchEvent(AccountEvent.DelUnIncomeSTB, stbID_del);
                    oops.message.dispatchEvent(AccountEvent.LevelUpUnIncomeSTB, STBData.id);
                }
                callback(true);
                return;
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
    async mergeIncomeSTBNet(stbID1: number, stbID2: number, isUpProb: number, callback: (success: boolean) => void) {
        let res = await AccountNetService.mergeGoldSTB(stbID1, stbID2, isUpProb);
        if (res) {
            // 删除合成的两个星兽
            this.AccountModel.delUserInComeSTB(stbID1);
            this.AccountModel.delUserInComeSTB(stbID2);
            oops.message.dispatchEvent(AccountEvent.DelIncomeSTB, stbID1);
            oops.message.dispatchEvent(AccountEvent.DelIncomeSTB, stbID2);

            // 更新宝石数量
            if (isUpProb == 1) {
                const coinDataRes = await AccountNetService.getUserCoinData();
                if (coinDataRes && coinDataRes.userCoin != null) {
                    this.AccountModel.CoinData = coinDataRes.userCoin;
                    oops.message.dispatchEvent(AccountEvent.CoinDataChange);
                }
            }

            //合成是否成功，false：合成失败，true：合成成功，并且userInStb会返回新星兽数据
            if (res.isSucc) {
                this.AccountModel.addInComeSTBData(res.userInStb);
                oops.message.dispatchEvent(AccountEvent.AddInComeSTB, res.userInStb.id);
            }
            callback(res.isSucc);
            return;
        }
        callback(false);
    }


    /** 设置星兽(无收益星兽)位置 */
    async changeSTBSlotIdNet(stbId: number, slotId: number, callback: (success: boolean) => void) {
        const res = await AccountNetService.swapPosition(stbId, slotId);
        if (res) {
            callback(this.setUserNinstbSlot(stbId, slotId));
            return;
        }
        callback(false);
    }

    /** 设置无收益星兽位置 */
    setUserNinstbSlot(stbId: number, slotId: number): boolean {
        let stbData = this.AccountModel.UserNinstb;
        const index = stbData.findIndex((element) => element.id === stbId);
        if (index !== -1) {
            stbData[index].stbPosition = slotId;
            return true;
        }
        return false;
    }

    /**
     * 获取星兽剩余存活时间
     * @param stbId - 星兽ID
     * @returns 存活时间, 0:已经死亡, >0:剩余存活时间(秒) -1:不限制存活时间
     */
    getSTBSurvivalSec(stbId: number): number {
        let stbData = this.getUserSTBData(stbId);
        if (stbData) {
            const stbConfigID = stbData.stbConfigID;
            let stbConfig = this.STBConfigMode.GetSTBConfigData(stbConfigID);
            if (stbConfig) {
                if (stbConfig.stbSurvival > 0) {
                    const createdTime = new Date(stbData.createdAt);
                    const diffTime = new Date().getTime() - createdTime.getTime() - netConfig.timeDifference;
                    const elapsedSecs = Math.floor(diffTime / 1000);
                    return Math.max(0, stbConfig.stbSurvival - elapsedSecs);
                }
            }
        }
        return -1;
    }

    /**
     * 获取指定类型的星兽数据
     * @param stbId - 星兽ID
     * @param isIncome - 是否为收益星兽
     * @returns 返回星兽数据
     */
    getUserSTBData(stbId: number): IStartBeastData | null {
        // 先在 UserInstb 中查找
        if (this.AccountModel.UserInstb) {
            const foundData = this.AccountModel.UserInstb.find((element) => element.id === stbId);
            if (foundData) { return foundData; }
        }

        // 如果在 UserInstb 中未找到，再在 UserNinstb 中查找
        if (this.AccountModel.UserNinstb) {
            const foundData = this.AccountModel.UserNinstb.find((element) => element.id === stbId);
            if (foundData) { return foundData; }
        }

        // 如果都未找到，返回 null
        return null;
    }

    /**
     * 删除用户星兽
     * @param stbId - 星兽ID
     * @returns 是否删除成功
     */
    delUserSTBData(stbId: number): boolean {
        if (this.AccountModel.delUserInComeSTB(stbId)) {
            oops.message.dispatchEvent(AccountEvent.DelIncomeSTB, stbId);
            return true;
        }
        if (this.AccountModel.delUserUnIncomeSTB(stbId)) {
            oops.message.dispatchEvent(AccountEvent.DelUnIncomeSTB, stbId);
            return true;
        }
        return false;
    }

    /** 获取指定类型的星兽数据 */
    getSTBDataByConfigId(configIds: number[]): IStartBeastData[] {
        let dataList: IStartBeastData[] = [];
        if (this.AccountModel.UserNinstb) {
            this.AccountModel.UserNinstb.forEach((element) => {
                if (configIds.includes(element.stbConfigID)) {
                    dataList.push(element);
                }
            });
        }

        if (this.AccountModel.UserInstb) {
            this.AccountModel.UserInstb.forEach((element) => {
                if (configIds.includes(element.stbConfigID)) {
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