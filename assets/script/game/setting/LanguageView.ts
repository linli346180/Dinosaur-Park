import { Button } from 'cc';
import { _decorator, Component, Node } from 'cc';
import { oops } from '../../../../extensions/oops-plugin-framework/assets/core/Oops';
import { Prefab } from 'cc';
import { instantiate } from 'cc';
import { LanguageItem } from './LanguageItem';
import { UIID } from '../common/config/GameUIConfig';
import { AccountEvent } from '../account/AccountEvent';
const { ccclass, property } = _decorator;

@ccclass('LanguageView')
export class LanguageView extends Component {
    @property(Prefab)
    itemPrefab: Prefab = null!;
    @property(Button)
    btn_ok: Button = null!;
    @property(Node)
    content: Node = null!;

    private _language: string = "";

    start() {
        this.content.removeAllChildren();
        this.initView();
        this.btn_ok?.node.on(Button.EventType.CLICK, this.closeUI, this);
    }

    initView() {
        const languageList = oops.language.languages;
        const curLanguage = oops.language.current;
        for (const language of languageList) {
            const itemNode = instantiate(this.itemPrefab);
            if (itemNode) {
                this.content.addChild(itemNode);
                const comp = itemNode.getComponent(LanguageItem);
                if (comp) {
                    const name = oops.language.languageNames[language];
                    if (name === undefined) {
                        console.error("language name is undefined", language);
                        continue;
                    }
                    comp.InitItem(language, name, curLanguage === language);
                    comp.OnSelect = this.onItemClicked.bind(this);
                }
            }
        }
    }

    onItemClicked(name: string) {
        this._language = name;
    }

    closeUI() {
        oops.language.setLanguage(this._language, (success) => {
            if (success) {
                oops.storage.set("language", this._language);
                oops.message.dispatchEvent(AccountEvent.ChangeLanguage);
                console.log("切换多语言" + name);
            }
        });
        oops.gui.remove(UIID.LanguageUI, false);
    }
}


