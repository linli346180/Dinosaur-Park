import { Vec3 } from 'cc';
import { tween } from 'cc';
import { Vec2 } from 'cc';
import { EventTouch } from 'cc';
import { _decorator, Component, Node } from 'cc';
import { IMapConfig, MapConfigData, MapID } from './MapConfig';
import { Enum } from 'cc';
import { Tween } from 'cc';
import { math } from 'cc';
import { oops } from '../../../../extensions/oops-plugin-framework/assets/core/Oops';
import { AccountEvent } from '../account/AccountEvent';
import { smc } from '../common/SingletonModuleComp';
import { STBID } from '../character/STBDefine';
import { STBConfigData } from '../character/STBConfig';
import { ViewUtil } from '../../../../extensions/oops-plugin-framework/assets/core/utils/ViewUtil';
import { ArrayUtil } from '../../../../extensions/oops-plugin-framework/assets/core/utils/ArrayUtil';
import { IStartBeastData, IUserInstbData } from '../account/model/AccountModelComp';
import { ActorController } from '../character/state/ActorController';
const { ccclass, property } = _decorator;


@ccclass('MapComponent')
export class MapComponent extends Component {
    @property(Node)
    mapRoot: Node = null!;

    private mapNodes: Map<number, Node> = new Map();

    start() {
        oops.message.on(AccountEvent.LoginSuccess, this.onHandler, this);
        oops.message.on(AccountEvent.AddUserSTB, this.onHandler, this);

        Object.keys(MapConfigData).forEach((key) => {
            const mapConfig: IMapConfig = MapConfigData[Number(key)];
            let mapNode = this.mapRoot.getChildByPath(mapConfig.path);
            if (mapNode)
                this.mapNodes.set(Number(key), mapNode);
            else
                console.error("地图节点不存在");
        });
    }

    private onHandler(event: string, args: any) {
        switch (event) {
            case AccountEvent.AddUserSTB:
                this.addUserSTBItem(args);
                break;
            case AccountEvent.LoginSuccess:
                this.initUI();
                break;
        }
    }

    initUI() {
        let UserInstbData = smc.account.AccountModel.userInstbData.UserInstb
        UserInstbData.forEach((stb: IStartBeastData) => {
            this.addUserSTBItem(stb.id)
        });
    }

    async addUserSTBItem(stb: number) {
        const data = smc.account.AccountModel.getUserSTBData(stb)
        if (data) {
            console.log("添加新的STB");
            const stbConfigID = data.stbConfigID;
            const prefabPath = STBConfigData[stbConfigID].perfab;
            const mapID = STBConfigData[stbConfigID].mapID;

            // 获取随机生成点
            const mapConfig = MapConfigData[mapID];
            if (mapConfig.spawnPoint.length == 0) {
                console.error("地图出生点已用完");
                return;
            }

            const randomSpawnPoint = ArrayUtil.getRandomValueInArray(mapConfig.spawnPoint);
            // 从数组中移除随机选择的出生点
            // const index = mapConfig.spawnPoint.indexOf(randomSpawnPoint);
            // if (index > -1) {
            //     mapConfig.spawnPoint.splice(index, 1);
            // }

            let itemPerfab = await ViewUtil.createPrefabNodeAsync(prefabPath);
            const mapNode = this.mapNodes.get(mapID);
            if (itemPerfab && mapNode) {
                itemPerfab.setParent(mapNode);
                let spawnPoint = new Vec3(randomSpawnPoint.x, randomSpawnPoint.y, 0);
                itemPerfab.setPosition(spawnPoint);

                const actorController = itemPerfab.getComponent(ActorController);
                if(actorController)
                {
                    actorController.widthLimit = mapConfig.widthLimit;
                    actorController.heightLimit = mapConfig.heightLimit;
                }
            }
        }
        else {
            console.log("添加新的STB失败");
        }
    }

    delUserSTBItem(stb: number) {

    }
}