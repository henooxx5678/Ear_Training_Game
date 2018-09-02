game.levels.get('Test').enemies[0].get('bat').getActions = function () {
    return {
        atkTime: 3000,      // Measured in milliseconds
        atkInterval: 2000,  // Measured in milliseconds
        voices: {
            light: {
                'a4': game.getAudio('enemy-' + this.name + '-a4-lgt')
            },
            heavy: {
                'a4': game.getAudio('enemy-' + this.name + '-a4-hvy')
            }
        },
        damage: {
            normal: 20,
            high: 30
        },
        attacking: { nextCounter: 0 },
        actionNo: 0,
        status: 'waiting',      // waiting, attacking
        attack: function (type) {
            if (type == 'light') {
                console.log('[ENEMY ACTION] Bat: Light attack');
                this.attacking.audio = this.voices.light['a4'];
                this.attacking.damage = this.damage['normal'];
            }
            else if (type == 'heavy') {
                console.log('[ENEMY ACTION] Bat: Heavy attack');
                this.attacking.audio = this.voices.heavy['a4'];
                this.attacking.damage = this.damage['high'];
            }
            this.attacking.movesfx = 'attack';
            this.attacking.note = 'a4';
            this.attacking.counter = 0;
        },
        decide: function () {       // start from 1
            if (++this.actionNo % 3 == 0) {
                this.attack('heavy');
            }
            else {
                this.attack('light');
            }
        },
        init: function () {
            this.attacking.parent = this;
            delete this.init;
            return this;
        }
    }.init();
}
