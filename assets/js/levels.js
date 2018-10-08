game.levels.add( {
    name: 'Test',
    locked: false,
    enemies: [ {
        amount: 1,
        children: [ {
            name: 'bat',
            maxHp: 100,
            filter: { normal:'none' },
            x: 236,
            y: 144,
            width: 328,
            height: 119,
            hpBar: {
                color: config.hpBarType['default'].color,
                filter: config.hpBarType['default'].filter,
                rect: {
                    x: 200,
                    y: 10,
                    width: 400,
                    height: 20
                }
            }
        } ],
        get: function (theName) {
            return getFromChildren(theName, this.children);
        }
    } ],
    preload: function () {
        game.loadImage('enemy-bat', 'assets/img/enemies/bat.png');
        game.loadAudio('enemy-bat-a4-lgt', 'assets/aud/enemies/bat-a4-lgt.mp3');
        game.loadAudio('enemy-bat-a4-hvy', 'assets/aud/enemies/bat-a4-hvy.mp3');
    },
    create: function () {
        let data = game.loaded.data;
        let sceneConfig = config.scenes.game;

        data.enemy = {
            index: 0,
            children: [],
            atkList: [],
            add: function (newOne) {
                this.children.push(newOne);
            },
            get: function (theName) {
                return getFromChildren(theName, this.children);
            }
        };
        this.updateEnemy();
    },
    update: function () {
        let data = game.loaded.data;
        let enemy = game.loaded.data.enemy;
        let player = game.loaded.data.player;

    },
    paint: function () {
        let data = game.loaded.data;
        let enemy = game.loaded.data.enemy;

        game.ctx.filter = 'none';
    },
    updateEnemy: function () {
        let data = game.loaded.data;

        for (let theEnemy of this.enemies[data.enemy.index].children) {
            let theImage = game.getImage('enemy-' + theEnemy.name);
            let newEnemy = new Sprite('enemy', theImage, theEnemy.width, theEnemy.height).init();

            newEnemy.name = theEnemy.name;
            newEnemy.hp = theEnemy.maxHp;
            newEnemy.maxHp = theEnemy.maxHp;
            newEnemy.filter = theEnemy.filter['normal'];
            newEnemy.x = theEnemy.x;
            newEnemy.y = theEnemy.y;
            newEnemy.hpBar = {
                color: theEnemy.hpBar.color['remained'],
                filter: theEnemy.hpBar.filter['remained'],
                rect: Object.assign({}, theEnemy.hpBar.rect)
            };
            newEnemy.maxHpBar = {
                color: theEnemy.hpBar.color['lost'],
                filter: theEnemy.hpBar.filter['lost'],
                rect: Object.assign({}, theEnemy.hpBar.rect)
            };
            newEnemy.actions = theEnemy.getActions();
            newEnemy.actions.parent = newEnemy;
            newEnemy.underAtk = null;
            newEnemy.getHit = function (damage) {
                newEnemy.hp -= damage;
                newEnemy.anims.play('hurt');
                newEnemy.movesfx.play('hurt');
            };
            newEnemy.generateArgs = function () {
                newEnemy.drawArgs = {
                    image: newEnemy.image,
                    sx: 0,
                    sy: 0,
                    sWidth: newEnemy.width,
                    sHeight: newEnemy.height,
                    dx: newEnemy.x,
                    dy: newEnemy.y,
                    dWidth: newEnemy.width,
                    dHeight: newEnemy.height
                };
            };
            newEnemy.init = function () {
                newEnemy.generateArgs();
                newEnemy.hpBar.rect.y -= 1;
                delete newEnemy.init;
            }();

            data.enemy.add(newEnemy);
        }
    }
} );

game.levels.add( {
    name: 'Locked1',
    locked: true,
    enemies: []
} );

game.levels.add( {
    name: 'Locked2',
    locked: true,
    enemies: []
} );

// Check Enemies Amount

for (let level of game.levels.children) {
    for (let theEnemies of level.enemies) {
        if (theEnemies.amount != theEnemies.children.length) {
            console.log('[ERROR] Enemies amount is not correct! (Level ' + level.name + ')');
        }
    }
}
