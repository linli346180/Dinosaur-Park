import { Label } from 'cc';
import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('InputItem')
export class InputItem extends Component {
    @property(Label)
    private inputLabel:Label = null!;

    set InputText(text:string){
        this.inputLabel.string = text;
    }

    get InputText(){
        return this.inputLabel.string;
    }
}


