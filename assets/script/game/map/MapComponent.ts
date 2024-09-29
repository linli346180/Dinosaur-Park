import { Vec3 } from 'cc';
import { _decorator, Component, Node } from 'cc';
import { IMapConfig, MapConfigData } from './MapConfig';
import { oops } from '../../../../extensions/oops-plugin-framework/assets/core/Oops';
import { AccountEvent } from '../account/AccountEvent';
import { smc } from '../common/SingletonModuleComp';
import { STBConfigData } from '../character/STBConfig';
import { ViewUtil } from '../../../../extensions/oops-plugin-framework/assets/core/utils/ViewUtil';
import { ArrayUtil } from '../../../../extensions/oops-plugin-framework/assets/core/utils/ArrayUtil';
import { IStartBeastData } from '../account/model/AccountModelComp';
import { ActorController } from '../character/state/ActorController';
import { Button } from 'cc';
const { ccclass, property } = _decorator;


@ccclass('MapComponent')
export class MapComponent extends Component {
    @property(Node)
    mapRoot: Node = null!;
    private userInstbDataIndex: number = 0;
    private userInstbData: IStartBeastData[] = [];
    private mapNodes: Map<number, Node> = new Map();
    private itemNodes: Map<number, Node> = new Map();

    start() {
        oops.message.on(AccountEvent.AddInComeSTB, this.onHandler, this);
        oops.message.on(AccountEvent.DedIncomeSTB, this.onHandler, this);
        Object.keys(MapConfigData).forEach((key) => {
            const mapConfig: IMapConfig = MapConfigData[Number(key)];
            let mapNode = this.mapRoot.getChildByPath(mapConfig.path);
            if (mapNode)
                this.mapNodes.set(Number(key), mapNode);
            else
                console.error("地图节点不存在");
        });

        this.initUI();
    }

    private onHandler(event: string, args: any) {
        switch (event) {
            case AccountEvent.AddInComeSTB:
                this.createSTBItem(args);
                break;
            case AccountEvent.DedIncomeSTB:
                this.delUserSTBItem(args);
                break;
        }
    }

    initUI() {
        this.itemNodes.clear();
        this.userInstbData = smc.account.AccountModel.userInstbData.UserInstb;
        if (this.userInstbData.length > 0) {
            this.schedule(this.scheduleAddUserSTBItem, 0.5, this.userInstbData.length, 0);
        }
    }

    scheduleAddUserSTBItem() {
        if (this.userInstbDataIndex < this.userInstbData.length) {
            const stbData = this.userInstbData[this.userInstbDataIndex];
            this.createSTBItem(stbData.id);
            this.userInstbDataIndex++;
        } else {
            this.unschedule(this.scheduleAddUserSTBItem);
        }
    }

    /** 创建星兽对象 */
    async createSTBItem(stb: number) {
        const stbData: IStartBeastData | null = smc.account.AccountModel.getUserSTBData(stb)
        if (stbData) {
            const stbConfigID = stbData.stbConfigID;
            const prefabPath = STBConfigData[stbConfigID].perfab;
            const mapID = STBConfigData[stbConfigID].mapID;

            // 获取随机生成点
            const mapConfig = MapConfigData[mapID];
            const randomSpawnPoint = ArrayUtil.getRandomValueInArray(mapConfig.spawnPoint);

            let itemPerfab = await ViewUtil.createPrefabNodeAsync(prefabPath);
            const mapNode = this.mapNodes.get(mapID);
            if (itemPerfab && mapNode) {
                itemPerfab.setParent(mapNode);
                let spawnPoint = new Vec3(randomSpawnPoint.x, randomSpawnPoint.y, 0);
                itemPerfab.setPosition(spawnPoint);

                this.initItemComponent(itemPerfab, stbData);
            }
        }
        else {
            console.error("添加新的STB失败");
        }
    }

    initItemComponent(item: Node, stbData: IStartBeastData) {
        const stbConfigID = stbData.stbConfigID;
        const mapConfig: IMapConfig = MapConfigData[STBConfigData[stbConfigID].mapID];

        const actorController = item.getComponent(ActorController);
        if (actorController) {
            actorController.stbId = stbData.id;
            actorController.widthLimit = mapConfig.widthLimit;
            actorController.heightLimit = mapConfig.heightLimit;
        }
    }

    delUserSTBItem(stb: number) {
        this.mapNodes.forEach((value, key) => {
            value.children.forEach((node) => {
                const actorController = node.getComponent(ActorController);
                if (actorController && actorController.stbId == stb) {
                    node.destroy();
                }
            });
        });
    }
}