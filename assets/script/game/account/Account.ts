import { oops } from "../../../../extensions/oops-plugin-framework/assets/core/Oops";
import { ecs } from "../../../../extensions/oops-plugin-framework/assets/libs/ecs/ECS";
import { GameEvent } from "../common/config/GameEvent";
import { UIID } from "../common/config/GameUIConfig";
import { AccountEvent } from "./AccountEvent";
import { AccountNetService } from "./AccountNet";
import { AccountModelComp, StartBeastData, UserSTBType } from "./model/AccountModelComp";
import { IsIncome, STBConfigModeComp, UserInstbConfigData } from "./model/STBConfigModeComp";
import { AccountNetDataComp } from "./system/AccountNetData";
import { AccountEmailComp } from "./system/ChangeEmail";
import { AccountNickNameComp } from "./system/ChangeNickName";
import { NetCmd, NetErrorCode } from "../../net/custom/NetErrorCode";
import { tips } from "../common/tips/TipsManager";
import { netConfig } from "../../net/custom/NetConfig";
import { StringUtil } from "../common/utils/StringUtil";
import { AccountCoinType, AwardType } from "./AccountDefine";
import { AccountLoginComp } from "./system/AccountLogin";
import { netChannel } from "../../net/custom/NetChannelManager";
import { tonConnect } from "../wallet/TonConnect";

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
    AccountLogin !: AccountLoginComp;

    // 使用 MaxSlotNum 类型定义最大槽位数量
    maxslotNum: number = 12;

    // 视图层View
    protected init() {
        this.addComponents<ecs.Comp>(AccountModelComp);
        this.addComponents<ecs.Comp>(STBConfigModeComp);
        oops.message.on(GameEvent.APPInitialized, this.onHandler, this);
        oops.message.on(GameEvent.LoginSuccess, this.onHandler, this);
        oops.message.on(GameEvent.DataInitialized, this.onHandler, this);
        oops.message.on(GameEvent.GuideFinish, this.onHandler, this);
        oops.message.on(GameEvent.WebSocketConnected, this.onHandler, this);
        oops.message.on(GameEvent.NetConnectFail, this.onHandler, this);
        oops.message.on(GameEvent.WebRequestFail, this.onHandler, this);
    }

    destroy(): void {
        oops.message.off(GameEvent.APPInitialized, this.onHandler, this);
        oops.message.off(GameEvent.LoginSuccess, this.onHandler, this);
        oops.message.off(GameEvent.DataInitialized, this.onHandler, this);
        oops.message.off(GameEvent.GuideFinish, this.onHandler, this);
        oops.message.off(GameEvent.WebSocketConnected, this.onHandler, this);
        oops.message.off(GameEvent.NetConnectFail, this.onHandler, this);
        oops.message.off(GameEvent.WebRequestFail, this.onHandler, this);
        super.destroy();
    }

    private async onHandler(event: string, args: any) {
        switch (event) {
            // 1. 应用初始化成功
            case GameEvent.APPInitialized:
                console.log("1.应用初始化成功");
                this.add(AccountLoginComp);
                break;

            // 2. 登陆成功
            case GameEvent.LoginSuccess:
                console.log("2.登陆成功");
                oops.storage.setUser(this.AccountModel.userData.id.toString());
                oops.audio.load();

                // 检查是否已完成新手引导
                if (!await this.isGuideFinish()) {
                    oops.message.dispatchEvent(GameEvent.CloseLoadingUI);
                    oops.gui.open(UIID.Guide);
                    return;
                }

                console.log("3.新手教程完成");
                this.add(AccountNetDataComp);
                break;

            // 2.1 登陆失败
            case GameEvent.LoginSuccess:
                tips.alert(oops.language.getLangByID('net_tips_fetch_fail'), () => {
                    // (window as any).Telegram.WebApp.close();
                });
                break;

            // 3. 新手教程完成
            case GameEvent.GuideFinish:
                console.log("3.新手教程完成");
                this.add(AccountNetDataComp);
                break

            // 4. 数据初始化完成
            case GameEvent.DataInitialized:
                console.log("4.数据初始化完成");
                oops.gui.openAsync(UIID.Map);
                oops.gui.openAsync(UIID.Main);
                AccountNetService.createWebSocket();
                break;

            // 5. WebSocket连接成功
            case GameEvent.WebSocketConnected:
                console.log("5.WebSocket连接成功");
                tonConnect.initTonConnect();
                oops.message.dispatchEvent(GameEvent.CloseLoadingUI);
                break;

            // 6. 网络连接失败
            case GameEvent.NetConnectFail:
                console.error("收到网络请求失败")
                tips.alert(oops.language.getLangByID('net_tips_fetch_fail'), () => {
                    // (window as any).Telegram.WebApp.close();
                });
                break

            // 7. 网络请求失败
            case GameEvent.WebRequestFail:
                oops.gui.toast(args);
                break
        }
    }

    /** 新手引导是否已完成(奖励未领取) */
    private async isGuideFinish(): Promise<boolean> {
        const res = await AccountNetService.getUserOfficial();
        if (res) {
            const isFinish = res.scorpionReward == 0;   //是否领取过新手奖励,0-已领取，1-未领取
            console.warn("新手引导是否已完成:", isFinish);
            return isFinish;
        }
        return false;
    }

    /** 领取奖励 */
    public OnClaimAward(awardType: AwardType) {
        switch (awardType) {
            case AwardType.Coin:
                this.updateCoinData();
                break;
            case AwardType.StarBeast:
                this.updateInstbData();
                break;
        }
    }

    async updateCoinData() {
        const coinDataRes = await AccountNetService.getUserCoinData();
        if (coinDataRes && coinDataRes.userCoin != null) {
            this.AccountModel.CoinData = coinDataRes.userCoin;
            oops.message.dispatchEvent(AccountEvent.CoinDataChange);
        }
    }

    // 更新收益星兽数据
    async updateInstbData() {
        const res = await AccountNetService.GetUserSTBData();
        let idList: number[] = [];
        if (res && res.userInstbData.UserInstb != null) {
            // 添加新的星兽
            for (const stbItem of res.userInstbData.UserInstb) {
                const stbId = stbItem.id;
                const stbConfigID = stbItem.stbConfigID;

                if (stbConfigID == null || stbConfigID == undefined || stbConfigID == 0)
                    continue;

                idList.push(stbId);
                if (this.getUserSTBData(stbId, UserSTBType.InCome) == null) {
                    this.AccountModel.addInComeSTBData(stbItem);
                    oops.message.dispatchEvent(AccountEvent.AddInComeSTB, stbId);
                }
            }

            // 删除已经不存在的星兽
            let delList: number[] = [];
            for (const stbItem of this.AccountModel.getUserInstb()) {
                if (!idList.includes(stbItem.id)) {
                    delList.push(stbItem.id);
                }
            }
            for (const delId of delList) {
                this.delUserSTBData(delId);
            }
        }
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
                this.updateCoinData();
            }

            const STBData: StartBeastData = res.userInstbSynthReData;
            let stbConfig = this.STBConfigMode.getSTBConfigData(STBData.stbConfigID);
            if (stbConfig) {
                if (stbConfig.isIncome == IsIncome.Yes) {
                    this.AccountModel.addInComeSTBData(STBData);
                    console.log("领养收益星兽: ", STBData.id + " 名称:" + stbConfig.stbName);
                    oops.message.dispatchEvent(AccountEvent.AddInComeSTB, STBData.id);
                } else {
                    this.AccountModel.addUserUnInComeSTB(STBData);
                    console.log("领养无收益星兽: ", STBData.id + " 名称:" + stbConfig.stbName + " 自动领养:" + autoAdop);
                    oops.message.dispatchEvent(autoAdop ? AccountEvent.AutoAddUnIncomeSTB : AccountEvent.AddUnIncomeSTB, STBData.id);
                }
                callback(true, "");
                return;
            }
        }
        callback(false, res.resultMsg);
    }

    public OnRecevieMessage(cmd: number, data: any) {
        switch (cmd) {
            case NetCmd.UserNinstbType:
                this.AccountModel.addUserUnInComeSTB(data);
                oops.message.dispatchEvent(AccountEvent.AutoAddUnIncomeSTB, data.id);
                break;

            case NetCmd.DownLineType:
                if (data == null || data.toString() == netConfig.deviceCode) return;
                netChannel.gameClose();
                tips.alert(oops.language.getLangByID('net_tips_multi_device_login'), () => {
                    (window as any).Telegram.WebApp.close();
                });
                break;

            case NetCmd.NinstbDeathType:
                console.error("无收益星兽死亡:", data.id);
                this.delUserSTBData(data.id);
                break;

            case NetCmd.IncomeStbDeathType:
                console.error("收益星兽死亡:", data.id);
                this.delUserSTBData(data.id);
                break;

            case NetCmd.UserIncomeType:
                console.warn("新增收益星兽:", data.id);
                this.updateInstbData();
                break;

            case NetCmd.UserCoinType:
                this.updateCoinData();

            case NetCmd.UserHatchType:
            case NetCmd.InvitedType:
            case NetCmd.UserDebrisType:
            case NetCmd.UserEmailType:
            case NetCmd.UserTaskType:
            case NetCmd.RankingType:
            case NetCmd.StbGurideType:
                oops.message.dispatchEvent(AccountEvent.RedDotCmd, cmd);
                break;
            case NetCmd.UserBounsType:
                console.log("USDT奖励:", data.bounsID, data.amount);
                oops.message.dispatchEvent(AccountEvent.UserBounsUSTD, data.amount);
                break;
        }
    }

    /**
     * 合并无收益星兽
     * @param stbID_to - The ID of the STB to merge into.
     * @param stbID_from - The ID of the STB to be deleted.
     * @param callback - A callback function that is called with a boolean parameter indicating the success of the merge operation.
     */
    async mergeUnIncomeSTBNet(stbID_to: number, stbID_from: number, callback: (success: boolean, levelUp: boolean) => void) {
        const res = await AccountNetService.mergeGoldNinSTB(stbID_to, stbID_from);
        if (res && res.userNinstb != null) {
            const STBData: StartBeastData = res.userNinstb;
            const stbConfigID = STBData.stbConfigID;
            let stbConfig = this.STBConfigMode.getSTBConfigData(stbConfigID);
            if (stbConfig) {
                if (stbConfig.isIncome == IsIncome.Yes) {
                    this.AccountModel.addInComeSTBData(STBData);
                    oops.message.dispatchEvent(AccountEvent.AddInComeSTB, STBData.id);
                    oops.message.dispatchEvent(AccountEvent.EvolveUnIncomeSTB, stbID_to);
                }
                callback(true, stbConfig.isIncome == IsIncome.Yes);
                return;
            }
        }
        callback(false, false);
    }


    /**
     * 收益星兽合成
     * @param stbID1 - 星兽ID1
     * @param stbID2 - 星兽ID2
     * @param isUpProb - 是否使用宝石提升概率 1:是 2:否
     * @param callback - 合成结果回调
     * @returns void
     */
    async mergeIncomeSTBNet(stbID1: number, stbID2: number, isUpProb: number, callback: (success: boolean, isGainNum: boolean) => void) {
        let res = await AccountNetService.mergeGoldSTB(stbID1, stbID2, isUpProb);
        if (res) {
            // 删除合成的两个星兽
            this.AccountModel.delUserInComeSTB(stbID1);
            this.AccountModel.delUserInComeSTB(stbID2);
            oops.message.dispatchEvent(AccountEvent.DelIncomeSTB, stbID1);
            oops.message.dispatchEvent(AccountEvent.DelIncomeSTB, stbID2);

            // 更新宝石数量
            if (isUpProb == 1) {
                this.updateCoinData();
            }

            const isGainNum: boolean = res.isGainNum;

            //合成是否成功，false：合成失败，true：合成成功，并且userInStb会返回新星兽数据
            if (res.isSucc) {
                this.AccountModel.addInComeSTBData(res.userInStb);
                oops.message.dispatchEvent(AccountEvent.AddInComeSTB, res.userInStb.id);
            }
            callback(res.isSucc, isGainNum);
            return;
        }
        callback(false, false);
    }


    /** 设置星兽(无收益星兽)位置 */
    async changeSTBSlotIdNet(stbId: number, slotId: number, callback: (success: boolean) => void) {
        const res = await AccountNetService.swapPosition(stbId, slotId);
        if (res && res.userNinstb) {
            // 返回交换后的数据
            this.AccountModel.addUserUnInComeSTB(res.userNinstb);
            oops.message.dispatchEvent(AccountEvent.AddUnIncomeSTB, res.userNinstb.id);
            callback(true);
            return;
        }
        callback(false);
    }

    /** 设置无收益星兽配置 */
    setUserNinstbConfig(stbId: number, stbConfigID: number): boolean {
        console.log("设置无收益星兽配置:", stbId, stbConfigID);
        let stbData = this.getUserSTBData(stbId, UserSTBType.UnInCome);
        if (stbData) {
            stbData.stbConfigID = stbConfigID;
            return this.AccountModel.updateUnIncomeSTBData(stbData);
        }
        console.error(`设置星兽配置ID异常:${stbId}, ${stbConfigID}`);
        return false;
    }

    /**
     * 获取星兽剩余存活时间
     * @param stbId - 星兽ID
     * @returns 存活时间, 0:已经死亡, >0:剩余存活时间(秒) -1:不限制存活时间
     */
    getSTBSurvivalSec(stbId: number): number {
        let stbData = this.getUserSTBData(stbId, UserSTBType.InCome);
        if (stbData) {
            const stbConfigID = stbData.stbConfigID;
            let stbConfig = this.STBConfigMode.getSTBConfigData(stbConfigID);
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
     * 获取星兽数据
     * @param stbId - 星兽ID
     * @param isIncome - 是否为收益星兽
     * @returns 返回星兽数据
     */
    getUserSTBData(stbId: number, stbType: UserSTBType = UserSTBType.UnInCome): StartBeastData | null {
        if (stbType == UserSTBType.InCome) {
            const foundData = this.AccountModel.getUserInstb().find((element) => element.id === stbId);
            if (foundData) {
                return foundData;
            }
        } else {
            const foundData = this.AccountModel.getUserNinstb().find((element) => element.id === stbId);
            if (foundData) {
                return foundData;
            }
        }

        // 如果都未找到，返回 null
        console.log("未找到星兽数据:", stbId);
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
    getSTBDataByConfigType(configIds: number[]): StartBeastData[] {
        let dataList: StartBeastData[] = [];
        this.AccountModel.getUserNinstb().forEach((element) => {
            const config = this.getSTBConfigById(element.stbConfigID)
            if (config) {
                const itemID = StringUtil.combineNumbers(config.stbKinds, config.stbGrade, 2);
                if (configIds.includes(itemID)) {
                    dataList.push(element);
                }
            }
        });

        this.AccountModel.getUserInstb().forEach((element) => {
            const config = this.getSTBConfigById(element.stbConfigID)
            if (config) {
                const itemID = StringUtil.combineNumbers(config.stbKinds, config.stbGrade, 2);
                if (configIds.includes(itemID)) {
                    dataList.push(element);
                }
            }
        });
        return dataList;
    }

    /** 获取星兽配置(ID:1) */
    getSTBConfigById(configId: number): UserInstbConfigData | null {
        for (const element of this.STBConfigMode.instbConfigData) {
            if (element.id == configId) {
                return element;
            }
        }
        return null;
    }

    /** 获取星兽配置(类型101) */
    getSTBConfigByType(type: number): UserInstbConfigData | null {
        for (const element of this.STBConfigMode.instbConfigData) {
            const itemID = StringUtil.combineNumbers(element.stbKinds, element.stbGrade, 2);
            if (itemID == type) {
                return element;
            }
        }
        return null;
    }

    /** 收集金币 */
    public async UseCollectCoin(coinType: AccountCoinType) {
        let res: any = null;
        if (coinType == AccountCoinType.Gold)
            res = await AccountNetService.UseCollectCoin();
        if (coinType == AccountCoinType.Gems)
            res = await AccountNetService.UseCollectGem();

        if (res && res.userCoin) {
            this.AccountModel.CoinData = res.userCoin;
            oops.message.dispatchEvent(AccountEvent.CoinDataChange);
        }
    }
}