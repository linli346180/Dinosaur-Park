import { _decorator, Component, Toggle } from 'cc';
import { oops } from '../../../../extensions/oops-plugin-framework/assets/core/Oops';
import { GameComponent } from '../../../../extensions/oops-plugin-framework/assets/module/common/GameComponent';
const { ccclass, property } = _decorator;

@ccclass('setting')
export class setting extends GameComponent {

    @property(Toggle)
    switchMusic: Toggle = null!;
    
    @property(Toggle)
    volumeMusic: Toggle = null!;

    start() {
        this.switchMusic.isChecked = oops.audio.switchMusic;
        this.volumeMusic.isChecked = oops.audio.switchEffect;
        this.switchMusic.node.on('toggle', this.onVolumeMusic, this);
        this.volumeMusic.node.on('toggle', this.onSwitchMusic, this);
    }

    onVolumeMusic(toggle: Toggle) {
        oops.audio.switchMusic = toggle.isChecked;
        oops.audio.save();
        if (toggle.isChecked) {
            oops.audio.playMusicLoop("audios/nocturne");
        } else {
            oops.audio.stopMusic();
        }
    }

    onSwitchMusic(toggle: Toggle) {
        oops.audio.switchEffect = toggle.isChecked;
        oops.audio.save();
    }
}


