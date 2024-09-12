import { _decorator, Component, Node } from 'cc';
import { Dinosaur } from './Dinosaur';
const { ccclass, property } = _decorator;

interface IDinosaurManager 
{

}

/** 恐龙管理 */ 
export class DinosaurManager implements IDinosaurManager{

    private static instance: DinosaurManager;

    public static getInstance(): DinosaurManager {
        if (!DinosaurManager.instance) {
            DinosaurManager.instance = new DinosaurManager();
        }
        return DinosaurManager.instance;
    }

    private constructor() {

    }

    /** 背包列表 **/  
    DinosaurMap: Map<number, Dinosaur> = new Map<number, Dinosaur>();

    // 初始化

    // 购买1级金币恐龙

    // 自动下发1级金币恐龙

    // 1-9级金币龙合并升级

    // 10级金币龙合并升级

    // 金币池收益

  

}


