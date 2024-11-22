import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;


export default class GuideManager {
    private static _instance: GuideManager;

    public static getInstance(): GuideManager {
        if (this._instance == null) {
            this._instance = new GuideManager();
        }
        return this._instance;
    }
}


