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
        } ]
    } ],
    preload: function () {
        game.loadImage('enemy-bat', 'assets/img/enemies/bat.png');
    },
    create: function () {
        let data = game.loaded.data;
        let sceneConfig = config.scenes.game;

        data.enemy = {
            index: 0,
            children: []
        };
        this.updateEnemy();
    },
    update: function () {
        let data = game.loaded.data;
        let enemy = game.loaded.data.enemy;
        let player = game.loaded.data.player;

        // Update HP-bar
        for (let theEnemy of enemy.children) {
            theEnemy.hpBar.rect.width = theEnemy.maxHpBar.width * theEnemy.hp / theEnemy.maxHp;
        }
    },
    paint: function () {
        let data = game.loaded.data;
        let enemy = game.loaded.data.enemy;

        for (let theEnemy of enemy.children) {
            // Draw Enemy
            game.ctx.filter = theEnemy.filter;
            game.ctx.drawImage.apply(game.ctx, Object.values(theEnemy.drawArgs));
            // Draw Enemy HP-bar
            game.ctx.filter = theEnemy.maxHpBar.filter;
            game.ctx.fillStyle = theEnemy.maxHpBar.color;
            game.ctx.fillRect.apply(game.ctx, Object.values(theEnemy.maxHpBar.rect));
            game.ctx.filter = theEnemy.hpBar.filter;
            game.ctx.fillStyle = theEnemy.hpBar.color;
            game.ctx.fillRect.apply(game.ctx, Object.values(theEnemy.hpBar.rect));
        }

        game.ctx.filter = 'none';
    },
    updateEnemy: function () {
        let data = game.loaded.data;
        
        for (let theEnemy of this.enemies[data.enemy.index].children) {
            data.enemy.children.push( {
                name: theEnemy.name,
                hp: theEnemy.maxHp,
                maxHp: theEnemy.maxHp,
                filter: theEnemy.filter['normal'],
                image: game.getImage('enemy-' + theEnemy.name),
                x: theEnemy.x,
                y: theEnemy.y,
                width: theEnemy.width,
                height: theEnemy.height,
                hpBar: {
                    color: theEnemy.hpBar.color['remained'],
                    filter: theEnemy.hpBar.filter['remained'],
                    rect: Object.assign({}, theEnemy.hpBar.rect)
                },
                maxHpBar: {
                    color: theEnemy.hpBar.color['lost'],
                    filter: theEnemy.hpBar.filter['lost'],
                    rect: Object.assign({}, theEnemy.hpBar.rect)
                },
                generateArgs: function () {
                    this.drawArgs = {
                        image: this.image,
                        sx: 0,
                        sy: 0,
                        sWidth: this.width,
                        sHeight: this.height,
                        dx: this.x,
                        dy: this.y,
                        dWidth: this.width,
                        dHeight: this.height
                    }
                }
            } );
        }
        for (let theEnemy of data.enemy.children) {
            theEnemy.hpBar.rect.y -= 1;
            theEnemy.generateArgs();
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
