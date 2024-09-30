/*
 * @Author: dgflash
 * @Date: 2021-07-03 16:13:17
 * @LastEditors: dgflash
 * @LastEditTime: 2022-08-05 18:25:56
 */
import { _decorator, profiler } from 'cc';
import { DEBUG } from 'cc/env';
import { oops } from '../../extensions/oops-plugin-framework/assets/core/Oops';
import { Root } from '../../extensions/oops-plugin-framework/assets/core/Root';
import { ecs } from '../../extensions/oops-plugin-framework/assets/libs/ecs/ECS';
import { Account } from './game/account/Account';
import { smc } from './game/common/SingletonModuleComp';
import { UIConfigData } from './game/common/config/GameUIConfig';
import { Initialize } from './game/initialize/Initialize';

const { ccclass, property } = _decorator;

// 定义一个函数来动态加载脚本  
function loadScript(callback?: () => void): void {
    let script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://telegram.org/js/telegram-web-app.js';

    // 当脚本加载完成时执行回调  
    script.onload = () => {
        if (callback) {
            callback();
        }
    };

    // 添加到DOM中  
    document.head.appendChild(script);
}

loadScript();

@ccclass('Main')
export class Main extends Root {
    start() {
        // if (DEBUG) profiler.showStats();
    }

    protected initGui() {
        oops.gui.init(UIConfigData);
    }

    protected run() {
        smc.initialize = ecs.getEntity<Initialize>(Initialize);
    }
}
