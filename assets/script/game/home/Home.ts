import { _decorator, Component, Node, Button, Animation, tween, UIOpacity, Vec3, easing } from 'cc';
import { oops } from '../../../../extensions/oops-plugin-framework/assets/core/Oops';
import { UIID } from '../common/config/GameUIConfig';
import { AccountEvent } from '../account/AccountEvent';
import { KnapsackControlle } from './KnapsackControlle';
import { KnapsackSlot } from './KnapsackSlot';
import { UserCoinView } from './UserCoinView';
import { AccountCoinType } from '../account/AccountDefine';
import { Label } from 'cc';
import { AnimUtil } from '../common/utils/AnimUtil';
import { smc } from '../common/SingletonModuleComp';
import { RedDotCmd } from '../reddot/ReddotDefine';
import { ReddotComp } from '../reddot/ReddotComp';
const { ccclass, property } = _decorator;

@ccclass('HomeView')
export class HomeView extends Component {
    @property(Button)
    btn_user: Button = null!;
    @property(Button)
    btn_email: Button = null!;
    @property(Button)
    btn_task: Button = null!;
    @property(Button)
    btn_rank: Button = null!;
    @property(Button)
    btn_book: Button = null!;
    @property(Button)
    btn_revivei: Button = null!;
    @property(Button)
    btn_store: Button = null!;
    @property(Button)
    btn_hatch: Button = null!;
    @property(Button)
    btn_invite: Button = null!;
    @property(Button)
    btn_activity: Button = null!;

    // 收集金币动画
    @property(Node)
    goldAnimNode: Node = null!;
    @property(Node)
    goldAnimEndNode: Node = null!;
    @property(Node)
    goldAnimBeginNode: Node = null!;

    // 收集USTD动画
    @property(Node)
    usdtAnimNode: Node = null!;
    @property(Label)
    usdtCount: Label = null!;
    @property(Node)
    usdtAnimEndNode: Node = null!;

    // 星兽进化动画
    @property(Node)
    evolveTips: Node = null!;

    @property(UserCoinView)
    userCoinView: UserCoinView = null!;

    private buttonMap: { [key: string]: Button } = {};

    start() {
        // oops.audio.playMusicLoop("audios/nocturne");
        this.initializeButtonMap();
        this.addEventListeners();
        oops.message.on(AccountEvent.EvolveUnIncomeSTB, this.onHandler, this);
        oops.message.on(AccountEvent.UserCollectGold, this.onHandler, this);
        oops.message.on(AccountEvent.UserBounsUSTD, this.onHandler, this);
    }

    onDestroy() {
        // this.removeEventListeners();
        oops.message.off(AccountEvent.EvolveUnIncomeSTB, this.onHandler, this);
        oops.message.off(AccountEvent.UserCollectGold, this.onHandler, this);
        oops.message.off(AccountEvent.UserBounsUSTD, this.onHandler, this);
    }

    private initializeButtonMap() {
        this.buttonMap = {
            [UIID.User]: this.btn_user,
            [UIID.Email]: this.btn_email,
            [UIID.Task]: this.btn_task,
            [UIID.RankUI]: this.btn_rank,
            [UIID.Book]: this.btn_book,
            [UIID.Revive]: this.btn_revivei,
            [UIID.STBShop]: this.btn_store,
            [UIID.Hatch]: this.btn_hatch,
            [UIID.Invite]: this.btn_invite,
            [UIID.Activity]: this.btn_activity,
        };
    }

    private addEventListeners() {
        for (const key in this.buttonMap) {
            const button = this.buttonMap[key];
            button?.node.on(Button.EventType.CLICK, () => { this.OpenUI(key as unknown as UIID) }, this);
        }
    }

    private removeEventListeners() {
        for (const key in this.buttonMap) {
            const button = this.buttonMap[key];
            button?.node.off(Button.EventType.CLICK, () => { this.OpenUI(key as unknown as UIID) }, this);
        }
    }

    private OpenUI(uid: UIID) {
        const targetNode = this.buttonMap[uid]?.node;
        targetNode.getComponentInChildren(ReddotComp)?.setRead();
        
        if(uid == UIID.Invite) { 
            oops.gui.toast(oops.language.getLangByID("common_tips_Not_Enabled"));
            return;
        }

        oops.gui.open(uid);
    }

    private onHandler(event: string, args: any) {
        switch (event) {
            case AccountEvent.UserCollectGold:
                this.showGoldAnim();
                break;
            case AccountEvent.EvolveUnIncomeSTB:
                this.showStartAnim(args);
                break;
            case AccountEvent.UserBounsUSTD:
                this.showUSTDAnim(args as number);
                break;
        }
    }

    private showGoldAnim() {
        this.goldAnimNode.active = true; 
        this.goldAnimNode.getComponent(Animation)?.play();
        tween(this.goldAnimNode)
            .call(() => { 
                this.goldAnimNode.setWorldPosition(this.goldAnimBeginNode.worldPosition);
            })
            .delay(0.5)
            .to(0.5, { worldPosition: this.goldAnimEndNode.worldPosition })
            .call(() => {
                this.goldAnimNode.active = false;
            })
            .start();
    }

    private showUSTDAnim(count: number = 0) {
        this.usdtCount.string = "+" + count;
        AnimUtil.playAnim_Move_Opacity(this.usdtAnimNode, this.usdtAnimEndNode.worldPosition, () => {
            smc.account.updateCoinData();
        });
    }

    private showStartAnim(stbId: number) {
        // oops.gui.toast("星兽进化成功");
        const endPos = this.btn_book.node.worldPosition;
        for (const slotNode of KnapsackControlle.instance.SlotNodes) {
            const slotComp = slotNode.getComponent<KnapsackSlot>(KnapsackSlot);
            if (slotComp && slotComp.STBId == stbId) {
                // 背包播放升级动画
                slotComp.showLevelUpAnim(true, () => {
                    oops.message.dispatchEvent(AccountEvent.DelUnIncomeSTB, stbId);
                });
                this.evolveTips.worldPosition = slotComp.node.worldPosition;
                AnimUtil.playAnim_Move_Opacity(this.evolveTips, endPos, () => {
                    console.log("播放完毕", RedDotCmd.StbBookType);
                    oops.message.dispatchEvent(AccountEvent.RedDotCmd, RedDotCmd.StbBookType);
                });
                return;
            }
        }
    }
}