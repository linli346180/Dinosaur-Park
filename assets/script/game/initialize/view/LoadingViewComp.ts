/*
 * @Author: dgflash
 * @Date: 2021-07-03 16:13:17
 * @LastEditors: bansomin
 * @LastEditTime: 2024-03-31 01:17:02
 */
import { _decorator } from "cc";
import { oops } from "../../../../../extensions/oops-plugin-framework/assets/core/Oops";
import { ecs } from "../../../../../extensions/oops-plugin-framework/assets/libs/ecs/ECS";
import { CCVMParentComp } from "../../../../../extensions/oops-plugin-framework/assets/module/common/CCVMParentComp";
import { ModuleUtil } from "../../../../../extensions/oops-plugin-framework/assets/module/common/ModuleUtil";
import { smc } from "../../common/SingletonModuleComp";
import { UIID } from "../../common/config/GameUIConfig";
import { GameEvent } from "../../common/config/GameEvent";
import { GuideEntity } from "../../../guide/entity/GuideEntity";

const { ccclass, property } = _decorator;

/** 游戏资源加载 */
@ccclass('LoadingViewComp')
@ecs.register('LoadingView', false)
export class LoadingViewComp extends CCVMParentComp {
    /** VM 组件绑定数据 */
    data: any = {
        /** 加载资源当前进度 */
        finished: 0,
        /** 加载资源最大进度 */
        total: 0,
        /** 加载资源进度比例值 */
        progress: "0",
        /** 加载流程中提示文本 */
        prompt: ""
    };

    private progress: number = 0;

    start() {
        oops.message.on(GameEvent.CloseLoadingUI, this.onHandler, this);
        this.loadRes();
    }

    onDestroy() {
        oops.message.off(GameEvent.CloseLoadingUI, this.onHandler, this);
    }

    private onHandler(event: string, args: any) {
        switch (event) {
            case GameEvent.CloseLoadingUI:
                this.CloseUI();
                break;
        }
    }

    /** 加载资源 */
    private async loadRes() {
        this.data.progress = 0;
        await this.loadCustom();
        this.loadGameRes();
    }

    /** 加载游戏本地JSON数据（自定义内容） */
    private loadCustom() {
        // 加载游戏本地JSON数据的多语言提示文本
        this.data.prompt = oops.language.getLangByID("loading_load_json");
        return new Promise(async (resolve, reject) => {
            resolve(null);
        });
    }

    /** 加载初始游戏内容资源 */
    private loadGameRes() {
        // 加载初始游戏内容资源的多语言提示文本
        this.data.prompt = oops.language.getLangByID("loading_load_game");

        this.data.finished = 0;
        this.data.total = 10;

        // 模拟加载进度
        this.schedule(this.updateProgress, 0.1);

        // 优先加载配置的指定资源包中资源
        oops.gui.PreLoadUIAsset();

        // 优先加载配置的指定资源包中资源，如果没配置则加载默认资源包资源
        // oops.res.loadDir("animation", this.onProgressCallback.bind(this), this.onCompleteCallback.bind(this));
    }

    /** 加载进度事件 */
    private onProgressCallback(finished: number, total: number, item: any) {
        this.data.finished = finished;
        this.data.total = total;

        var progress = finished / total;
        if (progress > this.progress) {
            this.progress = progress;
            this.data.progress = (progress * 100).toFixed(2);
        }
    }

    /** 加载完成事件 */
    private async onCompleteCallback() {
        // 获取用户信息的多语言提示文本
        // this.data.prompt = oops.language.getLangByID("loading_load_player");
        console.log("进度条加载完成");
        oops.message.dispatchEvent(GameEvent.OnLoadingUIClosed);
    }

    private CloseUI() {
        if (this.progress >= 1) {
            ModuleUtil.removeViewUi(this.ent, LoadingViewComp, UIID.Loading);
            this.onCompleteCallback();
        } else {
            setTimeout(() => {
                ModuleUtil.removeViewUi(this.ent, LoadingViewComp, UIID.Loading);
                this.onCompleteCallback();
            }, Math.abs(1 - this.progress) * 1000);
        }
    }

    private updateProgress() {
        if (this.progress >= 1) {
            this.unschedule(this.updateProgress);
            this.onCompleteCallback();
        } else {
            this.data.finished += 1;
            this.onProgressCallback(this.data.finished, this.data.total, null);
        }
    }

    reset(): void { }
}