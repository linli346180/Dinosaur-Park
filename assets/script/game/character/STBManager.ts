import { _decorator, Component, Node } from 'cc';
import { ecs } from '../../../../extensions/oops-plugin-framework/assets/libs/ecs/ECS';
import { STBEntity } from './STBEntity';
const { ccclass, property } = _decorator;


/** 星兽管理 */
export class STBManager {
    private static _instance: STBManager = null!;
    public static get instance(): STBManager {
        if (!STBManager._instance) {
            STBManager._instance = new STBManager();
        }
        return STBManager._instance;
    }
    private constructor() {
    }

    public init() {
        // ecs.getEntity<STBEntity>(STBEntity);
        // ecs.getEntity<STBEntity>(STBEntity);
        // ecs.getEntity<STBEntity>(STBEntity);
        // ecs.getEntity<STBEntity>(STBEntity);
    }
    public update(deltaTime: number) {
        
    }
    public destroy() {
        
    }
}


