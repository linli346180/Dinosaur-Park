import { _decorator, Component, Node, Vec3, Button } from 'cc';
import { IMapConfig, MapConfigData, MapID } from './MapConfig';
import { oops } from '../../../../extensions/oops-plugin-framework/assets/core/Oops';
import { AccountEvent } from '../account/AccountEvent';
import { smc } from '../common/SingletonModuleComp';
import { ISTBConfigData, STBConfigData } from '../character/STBConfig';
import { ViewUtil } from '../../../../extensions/oops-plugin-framework/assets/core/utils/ViewUtil';
import { StartBeastData, UserSTBType } from '../account/model/AccountModelComp';
import { ActorController } from '../character/state/ActorController';
import { RvoMgr } from '../../RVO/RvoMgr';
import { Logger } from '../../Logger';
import { v3 } from 'cc';
import { math } from 'cc';
import { StringUtil } from '../common/utils/StringUtil';
import { Collider2D } from 'cc';
import { UIID } from '../common/config/GameUIConfig';
const { ccclass, property } = _decorator;

const tmpP0 = v3();
const tmpP1 = v3();

/** 地图管理:1.10级环境星兽和稀有星兽的地图管理 */
@ccclass('MapComponent')
export class MapComponent extends Component {
    @property(Node)
    mapRoot: Node = null!;
    mapNodes: Map<number, Node> = new Map();  // 地图节点 1:Map1 2:Map2

    private delList: number[] = [];  // 删除列表

    onLoad(): void {
        RvoMgr.radius = 90; // 星兽半径
        RvoMgr.neighborDist = RvoMgr.radius * 1.8;    // 碰撞距离
        RvoMgr.maxSpeed = 100;  // 最大移动速度
        RvoMgr.updateCd = 0.05; // 更新频率
        RvoMgr.initSimulator(); // 初始化模拟器
    }

    start() {
        oops.message.on(AccountEvent.AddInComeSTB, this.onHandler, this);
        oops.message.on(AccountEvent.DelIncomeSTB, this.onHandler, this);
        this.initUI();
    }

    protected onDestroy(): void {
        oops.message.off(AccountEvent.AddInComeSTB, this.onHandler, this);
        oops.message.off(AccountEvent.DelIncomeSTB, this.onHandler, this);
    }

    update(dt: number) {
        RvoMgr.update(dt);
    }

    onDisable() {
        RvoMgr.reset();
    }

    private onHandler(event: string, args: any) {
        switch (event) {
            case AccountEvent.AddInComeSTB:
                this.createSTBItem(args);
                break;

            case AccountEvent.DelIncomeSTB:
                this.delUserSTBItem(args);
                this.unschedule(this.fillUserSTB);
                this.scheduleOnce(this.fillUserSTB, 1);
                break;
        }
    }

    private initUI() {
        // 初始化地图节点 存储不同地图的根节点
        Object.keys(MapConfigData).forEach((key) => {
            const mapConfig: IMapConfig = MapConfigData[Number(key)];
            let mapNode = this.mapRoot.getChildByPath(mapConfig.path);
            if (mapNode) this.mapNodes.set(Number(key), mapNode);
        });
        this.delList = [];
        this.fillUserSTB();
    }

    /** 自填充星兽 */
    private fillUserSTB() {
        this.fillUserSTBMap(MapID.Map1, this.getMapSTBIds(MapID.Map1));
        this.fillUserSTBMap(MapID.Map2, this.getMapSTBIds(MapID.Map2));
    }

    private getMapSTBIds(mapID: MapID): number[] {
        let stbIds: number[] = [];
        Object.keys(STBConfigData).forEach((key) => {
            const config: ISTBConfigData = STBConfigData[Number(key)];
            if (config.mapID == mapID) {
                stbIds.push(Number(key));
            }
        });
        return stbIds;
    }

    private fillUserSTBMap(mapID: MapID, stbConfigIds: number[]) {
        const mapConfig = MapConfigData[mapID];  // 地图配置
        const mapNode = this.mapNodes.get(mapID);  // 地图节点
        if(mapNode == undefined) return;

        const userInstbData = smc.account.getSTBDataByConfigType(stbConfigIds);

        const instNum = userInstbData.length;  // 用户星兽数量
        const showNum = this.getChildCount(mapNode);  // 已显示数量
        const limitNum = mapConfig.ItemLimit;  // 限制数量

        // 判断是否超过限制
        if (instNum > showNum && showNum < limitNum) {
            let maxCount = Math.min(instNum - showNum, limitNum - showNum);
            for (let i = 0; i < maxCount; i++) {
                for (let j = 0; j < userInstbData.length; j++) {
                    const stbData = userInstbData[j];
                    if (mapNode.getChildByName(stbData.id.toString()) == null) {
                        userInstbData.splice(j, 1);
                        // setTimeout(() => {
                        //     this.createSTBItem(stbData.id);
                        // }, 0.5 * i * 1000);

                        this.createSTBItem(stbData.id);
                        break;
                    }
                }
            }
        }
    }

    /** 创建星兽对象 */
    private async createSTBItem(stbId: number) {
        const stbData: StartBeastData | null = smc.account.getUserSTBData(stbId, UserSTBType.InCome);
        if (stbData) {
            const stbConfig = smc.account.getSTBConfigById(stbData.stbConfigID);
            if (!stbConfig) {
                console.error('星兽配置不存在:', stbData.stbConfigID);
                return;
            }
            const stbType = StringUtil.combineNumbers(stbConfig.stbKinds, stbConfig.stbGrade, 2);
            const prefabPath = STBConfigData[stbType].perfab; // 预制体路径
            const mapID = STBConfigData[stbType].mapID; // 地图ID

            const mapNode = this.mapNodes.get(mapID); // 地图节点
            if(mapNode == undefined) return;

            const showNum = this.getChildCount(mapNode);  // 已显示数量
            const mapConfig = MapConfigData[mapID]; // 地图配置
            if (showNum >= mapConfig.ItemLimit) {
                Logger.logBusiness('地图上的星兽数量已经达到上限');
                return;
            }

            let itemNode = await ViewUtil.createPrefabNodeAsync(prefabPath);
            if (itemNode && mapNode) {
                itemNode.name = stbData.id.toString();
                itemNode.setParent(mapNode);

                tmpP0.x = math.randomRange(mapConfig.widthLimit.x, mapConfig.widthLimit.y)
                tmpP0.y = math.randomRange(mapConfig.heightLimit.x, mapConfig.heightLimit.y)
                itemNode.setPosition(tmpP0);

                const cmp = itemNode.getComponent(ActorController);
                if (cmp) { 
                    cmp.stbId = stbData.id;
                    cmp.widthLimit = mapConfig.widthLimit;
                    cmp.heightLimit = mapConfig.heightLimit;
                    cmp.init(tmpP0, Vec3.ZERO);
                }
                return;
            }
        }

        console.error('添加新的STB失败');
    }

    /** 删除星兽对象 */
    private delUserSTBItem(stb: number) {
        this.mapNodes.forEach((value, key) => {
            value.children.forEach((node) => {
                const cmp = node.getComponent(ActorController);
                if (cmp && cmp.stbId == stb) {
                    node.getComponent(Collider2D).enabled = false;
                    this.delList.push(stb);
                    cmp.onActorDeath();
                    return;
                }
            });
        });
    }

    private getChildCount(node: Node): number {
        let count = 0;
        for (const child of node.children) {
            if (!this.delList.includes(Number(child.name))) {
                count += 1;
            }
        }
        return count;
    }
}