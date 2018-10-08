var game = {
    canvas: document.createElement('canvas'),
    start: function () {
        this.canvas.width = config.width;
        this.canvas.height = config.height;
        this.ctx = this.canvas.getContext('2d');
        this.canvas.onmousemove = function (e) {
            let rect = game.canvas.getBoundingClientRect();
            game.mousePos.x = e.clientX - rect.left;
            game.mousePos.y = e.clientY - rect.top;
            // console.log(game.mousePos.x, game.mousePos.y);
        };
        this.canvas.onclick = function (e) {
            game.input.mouseClick = true;
            // console.log('mouse click');
        };
        document.onmousedown = function (e) {
            game.input.mouseDown = true;
            // console.log('mouse down');
        };
        document.onmouseup = function (e) {
            game.input.mouseDown = false;
            // console.log('mouse up');
        };
        window.onkeydown = function (e) {
            game.input.keyDown[e.keyCode] = true;
            game.input.keyPress[e.keyCode] = true;
        };
        window.onkeyup = function (e) {
            game.input.keyDown[e.keyCode] = false;
            game.input.keyRelease[e.keyCode] = true;
        };
        document.body.appendChild(this.canvas);

        game.scenes.start('Menu');

        this.interval = setInterval(gameUpdate, config.interval);
    },
    scenes: {
        children: [],
        add: function (newOne) {
            this.children.push(newOne);
        },
        get: function (theName) {
            return getFromChildren(theName, this.children);
        },
        start: function (theName) {
            sceneStart( this.get(theName) );
        },
        stop: function (theName) {
            sceneStop( this.get(theName) );
        },
        pause: function (theName) {
            scenePause( this.get(theName) );
        },
        wake: function (theName) {
            sceneWake( this.get(theName) );
        }
    },
    panels: new Panels(),
    levels: {
        children: [],
        add: function (newOne) {
            this.children.push(newOne);
        },
        get: function (theName) {
            return getFromChildren(theName, this.children);
        },
    },
    loadImage: function (name, source) {
        let img = new Image();
        img.src = source;
        this.loaded.images[name] = img;
    },
    loadSprite: function (name, width, height, source) {
        let img = new Image();
        img.src = source;
        this.loaded.sprites[name] = new Sprite(img, width, height);
    },
    loadAudio: function (name, source) {
        this.loaded.audio[name] = new Audio(source);
    },
    getImage: function (name) {
        return this.loaded.images[name];
    },
    getSprite: function (name) {
        return this.loaded.sprites[name];
    },
    getAudio: function (name) {
        return this.loaded.audio[name];
    },
    clearScreen: function () {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    },
    clearLoaded: function () {
        this.loaded = {
            images: {},
            sprites: {},
            audio: {},
            data: {},
            sceneSwitching: false
        };
    },
    loaded: {
        images: {},
        sprites: {},
        audio: {},
        data: {},
        sceneSwitching: false
    },
    settings: JSON.parse( JSON.stringify(config.settings) ),
    mousePos: {
        x: null,
        y: null
    },
    input: {
        mouseClick: false,
        mouseDown: false,
        keyDown: [],
        keyPress: [],
        keyRelease: []
    }
};

// Menu scene
game.scenes.add( {
    name: 'Menu',
    status: 'stopped',          // stopped, running, paused
    page: 'beginning',
    panels: new Panels(),
    preload: function () {
        game.loadImage('scene-bg', 'assets/img/menu-scene.jpg');
        game.loadImage('menu-buttons', 'assets/img/menu-buttons.png');
        game.loadImage('menu-buttons-hover', 'assets/img/menu-buttons-hover.png');
        game.loadImage('level-selection', 'assets/img/level-selection.png');
        game.loadImage('level-selection-hover', 'assets/img/level-selection-hover.png');
        game.loadImage('level-selection-locked', 'assets/img/level-selection-locked.png');
    },
    create: function () {
        let background = config.scenes.menu.background;
        let menuButtons = config.scenes.menu.buttons;
        let pages = config.scenes.menu.pages;
        let data = game.loaded.data;
        let button = [];

        data.background = {
            filter: background.filter['normal'],
            image: game.getImage('scene-bg'),
            mask: {
                filter: background.mask.filter['normal'],
                color: background.mask.color['normal'],
                rect: Object.assign({}, background.mask.rect)
            }
        }
        for (let i = 0; i < menuButtons.names.length; i++) {
            button[i] = {
                name: config.scenes.menu.buttons.names[i],
                filter: config.scenes.menu.buttons.filter['normal'],
                images: {
                    normal: game.getImage('menu-buttons'),
                    hover: game.getImage('menu-buttons-hover'),
                },
                width: menuButtons.width,
                height: menuButtons.height,
                sx: 0,
                sy: i * menuButtons.height,
                dx: menuButtons.leftTop.x,
                dy: menuButtons.leftTop.y + (i * menuButtons.intervalY)
            };
            button[i].drawArgs = {
                image: button[i].images['normal'],
                sx: button[i].sx,
                sy: button[i].sy,
                sWidth: button[i].width,
                sHeight: button[i].height,
                dx: button[i].dx,
                dy: button[i].dy,
                dWidth: button[i].width,
                dHeight: button[i].height
            };
            button[i].isHoverArgs = {
                shape: 'rect',
                x: button[i].dx,
                y: button[i].dy,
                width: button[i].width,
                height: button[i].height
            };
        }
        data.menuButton = button;

        // Level-Selet Page
        data.levelSelections =  JSON.parse( JSON.stringify(pages.selectLevel.selections) );
        data.levelSelections.images = {
                normal: game.getImage('level-selection'),
                hover: game.getImage('level-selection-hover'),
                locked: game.getImage('level-selection-locked')
        };
        data.levelSelections.children = [];
        for (let level of game.levels.children) {
            data.levelSelections.children.push( {
                name: level.name,
                locked: level.locked
            } );
        }
        let theLength = data.levelSelections.children.length;
        let totalWidth = data.levelSelections.intervalX * (theLength - 1) + data.levelSelections.width;
        for (let i = 0, selection = data.levelSelections.children; i < theLength; i++) {
            selection[i].filter = 'none';
            selection[i].xNormal = (game.canvas.width - totalWidth) / 2 + (i * data.levelSelections.intervalX);
            selection[i].xHover = (data.levelSelections.width - data.levelSelections.widthHover) / 2 + selection[i].xNormal;
            selection[i].x = selection[i].xNormal;
            selection[i].yNormal = data.levelSelections.topY;
            selection[i].yHover = data.levelSelections.topYHover;
            selection[i].y = selection[i].yNormal;
            selection[i].width = pages.selectLevel.selections.width;
            selection[i].height = pages.selectLevel.selections.height;
            selection[i].isHoverArgs = {
                shape: 'rect',
                x: selection[i].x,
                y: selection[i].y,
                width: selection[i].width,
                height: selection[i].height
            };
            selection[i].drawArgs = {
                image: data.levelSelections.images['normal'],
                sx: 0,
                sy: 0,
                sWidth: selection[i].width,
                sHeight: selection[i].height,
                dx: selection[i].x,
                dy: selection[i].y,
                dWidth: selection[i].width,
                dHeight: selection[i].height
            }
            selection[i].updateArgs = function () {
                this.isHoverArgs.x = this.x;
                this.isHoverArgs.y = this.y;
                this.isHoverArgs.width = this.width;
                this.isHoverArgs.height = this.height;
                this.drawArgs.sWidth = this.width;
                this.drawArgs.sHeight = this.height;
                this.drawArgs.dx = this.x;
                this.drawArgs.dy = this.y;
                this.drawArgs.dWidth = this.width;
                this.drawArgs.dHeight = this.height;
            }
        }
    },
    update: function () {
        let sceneConfig = config.scenes.menu;
        let data = game.loaded.data;
        let background = game.loaded.data.background;
        let menuButton = game.loaded.data.menuButton;

        game.loaded.data.drawPage = this.page;

        if (this.page == 'beginning') {
            background.filter = sceneConfig.background.filter['normal'];
            background.mask.filter = sceneConfig.background.mask.filter['normal'];
            background.mask.color = sceneConfig.background.mask.color['normal'];
            for (let theButton of menuButton) {
                if ( isHover.apply(null, Object.values(theButton.isHoverArgs)) ) {
                    theButton.filter = sceneConfig.buttons.filter['hover'];
                    theButton.drawArgs.image = theButton.images['hover'];
                    if (game.input.mouseClick) {
                        buttonClick(this, theButton.name);
                    }
                }
                else {
                    theButton.filter = sceneConfig.buttons.filter['normal'];
                    theButton.drawArgs.image = theButton.images['normal'];
                }
            }
        }
        else {        // blur background
            background.filter = sceneConfig.background.filter['mask'];
            background.mask.filter = sceneConfig.background.mask.filter['mask'];
            background.mask.color = sceneConfig.background.mask.color['mask'];
            if (this.page == 'load-game') {

            }
            else if (this.page == 'select-level') {
                for (let selection of data.levelSelections.children) {
                    if (selection.locked) {
                        selection.drawArgs.image = data.levelSelections.images['locked'];
                    }
                    else {
                        if ( isHover.apply(null, Object.values(selection.isHoverArgs)) ) {
                            selection.filter = data.levelSelections.filter['hover'];
                            selection.x = selection.xHover;
                            selection.y = selection.yHover;
                            selection.width = data.levelSelections.widthHover;
                            selection.height = data.levelSelections.heightHover;
                            selection.updateArgs();
                            selection.drawArgs.image = data.levelSelections.images['hover'];
                            if (game.input.mouseClick) {
                                buttonClick(this, 'Level-' + selection.name);
                            }
                        }
                        else {
                            selection.filter = data.levelSelections.filter['normal'];
                            selection.x = selection.xNormal;
                            selection.y = selection.yNormal;
                            selection.width = data.levelSelections.width;
                            selection.height = data.levelSelections.height;
                            selection.updateArgs();
                            selection.drawArgs.image = data.levelSelections.images['normal'];
                        }
                    }
                }
            }
            else if (this.page == 'options') {

            }

            if (game.input.keyDown[27]) {       // key 'Esc'
                this.page = 'beginning';
            }
        }
    },
    paint: function () {
        let sceneConfig = config.scenes.menu;
        let data = game.loaded.data;
        let background = game.loaded.data.background;
        let menuButton = game.loaded.data.menuButton;
        let drawPage = game.loaded.data.drawPage;

        // Draw Background
        game.clearScreen();
        game.ctx.filter = background.filter;
        game.ctx.drawImage(background.image, 0, 0);
        game.ctx.filter = background.mask.filter;
        game.ctx.fillStyle = background.mask.color;
        game.ctx.fillRect.apply(game.ctx, Object.values(background.mask.rect));
        game.ctx.filter = 'none';

        // Draw Page
        if (drawPage == 'beginning') {
            for (let theButton of menuButton) {
                game.ctx.filter = theButton.filter;
                game.ctx.drawImage.apply(game.ctx, Object.values(theButton.drawArgs));
            }
        }
        else if (drawPage == 'load-game') {

        }
        else if (drawPage == 'select-level') {
            for (let selection of data.levelSelections.children) {
                game.ctx.filter = selection.filter;
                game.ctx.drawImage.apply( game.ctx, Object.values(selection.drawArgs) );
            }
        }
        game.ctx.filter = 'none';
    }
} );

// Game scene
game.scenes.add( {
    name: 'Game',
    status: 'stopped',
    panels: new Panels(),
    preload: function () {
        game.loadImage('scene-bg', 'assets/img/game-scene.jpg');
        game.loadImage('settings-icon', 'assets/img/settings-icon.png');
        game.loadImage('inst-keyboard', 'assets/img/inst/keyboard.png');
        game.loadImage('enemy-bat', 'assets/img/enemies/bat.png');
        game.loaded.data.currentLevel.preload();
        let instName = game.settings.instName;
        for (let theNote of config.instruments[instName].notes) {
            game.loadAudio('inst-'+instName+'-'+theNote, 'assets/aud/inst/'+instName+'/'+theNote+'.mp3');
        }
    },
    create: function () {
        let data = game.loaded.data;
        let sceneConfig = config.scenes.game;

        data.currentLevel.create();

        data.background = {
            filter: sceneConfig.background.filter['normal'],
            images: {
                default: game.getImage('scene-bg')
            }
        }
        data.background.image = data.background.images['default'];

        data.pauseButton = Object.assign({
            filter: sceneConfig.pauseButton.filter['normal'],
            images: {
                normal: game.getImage('settings-icon')
            }
        }, sceneConfig.pauseButton);
        data.pauseButton.drawArgs = {
            image: data.pauseButton.images['normal'],
            sx: 0,
            sy: 0,
            sWidth: data.pauseButton.width,
            sHeight: data.pauseButton.height,
            dx: data.pauseButton.x,
            dy: data.pauseButton.y,
            dWidth: data.pauseButton.width,
            dHeight: data.pauseButton.height
        };
        data.pauseButton.isHoverArgs = {
            shape: 'rect',
            x: data.pauseButton.x,
            y: data.pauseButton.y,
            width: data.pauseButton.width,
            height: data.pauseButton.height
        }

        this.createPanels();

        data.player = {
            hp: 100,
            maxHp: 100,
            atkChance: data.enemy.children.length * game.settings.player.atkChanceRate,
            atkChanceCounter: 0,
            hpBar: {
                color: sceneConfig.player.hpBar.color['remained'],
                filter: sceneConfig.player.hpBar.filter['remained'],
                rect: Object.assign({}, sceneConfig.player.hpBar.rect)
            },
            maxHpBar: {
                color: sceneConfig.player.hpBar.color['lost'],
                filter: sceneConfig.player.hpBar.filter['lost'],
                rect: Object.assign({}, sceneConfig.player.hpBar.rect)
            },
            getHit: function (damage) {
                this.hp -= damage;
            }
        };
        data.player.hpBar.rect.y -= 1;

        data.inst = {
            name: game.settings.instName,
            filter: sceneConfig.instruments[game.settings.instName].filter['normal'],
            image: game.getImage('inst-' + game.settings.instName),
            x: sceneConfig.instruments[game.settings.instName].x,
            y: sceneConfig.instruments[game.settings.instName].y,
            width: sceneConfig.instruments[game.settings.instName].width,
            height: sceneConfig.instruments[game.settings.instName].height,
            notes: {
                'a4': game.getAudio('inst'+game.settings.instName+'-a4'),
                'c4': game.getAudio('inst'+game.settings.instName+'-c4')
            },
            playable: false,
            played: null,
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
            },
            init: function () {
                this.generateArgs();
                delete this.init;
                return this;
            }
        }.init();
    },
    update: function () {
        let data = game.loaded.data;
        let pauseButton = data.pauseButton;
        let enemy = data.enemy;
        let player = data.player;
        let inst = data.inst;


        // Paused-button
        if ( isHover.apply(null, Object.values(pauseButton.isHoverArgs)) ) {
            if (game.input.mouseClick) {
                game.input.mouseClick = false;
                buttonClick(this, 'Pause');
            }
        }

        // player's death
        if ( player.hp <= 0 ) {
            console.log('Player Died.');
            gameOver();
        }

        data.currentLevel.update();

        // Player Instrument playing
        if (true) inst.playable = true;
        if (inst.playable) {
            if (game.input.keyPress[65]) {      // key: A
                inst.played = 'a4';
                // inst.notes['a4'].play();
            }
            if (game.input.keyPress[67]) {      // key: C
                inst.played = 'c4';
                // inst.notes['c4'].play();
            }
        }

        if (inst.played != null && enemy.atkList.length > 0) {
            if (inst.played == enemy.atkList[0].note) {
                console.log('[PLAYER] '+enemy.atkList[0].parent.parent.name+"'s attack cought");
                enemy.atkList[0].parent.parent.actions.status = 'underAttacking';
                enemy.atkList[0].parent.parent.underAtk = {
                    damage: enemy.atkList[0].damage,
                    counter: 0
                };
                enemy.atkList.shift();
            }
            else {
                console.log('[PLAYER] Failed to catch '+enemy.atkList[0].parent.parent.name+"'s attack'");
                enemy.atkList[0].parent.parent.status = 'succesAttacking';
                enemy.atkList[0].parent.parent.underAtk = {
                    damage: enemy.atkList[0].damage,
                    counter: 0
                }
                enemy.atkList.shift();
            }
        }

        // Enemies
        for (let theEnemy of enemy.children) {
            // Status
            if (theEnemy.actions.attacking.nextCounter < theEnemy.actions.atkInterval) {
                theEnemy.actions.attacking.nextCounter += config.interval;
            }
            else {
                if (theEnemy.actions.status == 'waiting') {
                    theEnemy.actions.status = 'attacking';
                    theEnemy.actions.decide();
                    enemy.atkList.push(theEnemy.actions.attacking);
                }
                else if (theEnemy.actions.status == 'attacking') {
                    if (theEnemy.actions.attacking.counter < theEnemy.actions.atkTime) {
                        theEnemy.actions.attacking.counter += config.interval;
                    }
                    else {
                        theEnemy.actions.status = 'waiting';
                        theEnemy.actions.attacking.nextCounter = 0;
                        player.getHit(theEnemy.actions.attacking.damage);
                        enemy.atkList.shift();
                    }
                }
                else if (theEnemy.actions.status == 'underAttacking') {
                    if (theEnemy.underAtk.counter < game.settings.player.atkTime) {
                        theEnemy.underAtk.counter += config.interval;
                    }
                    else {
                        theEnemy.actions.status = 'waiting';
                        theEnemy.actions.attacking.nextCounter = 0;
                        theEnemy.getHit(theEnemy.underAtk.damage);
                        theEnemy.underAtk = null;
                    }
                }
                else if (theEnemy.actions.status == 'succesAttacking') {
                    if (theEnemy.underAtk.counter < game.settings.player.atkTime) {
                        theEnemy.underAtk.counter += config.interval;
                    }
                    else {
                        theEnemy.actions.status = 'waiting';
                        theEnemy.actions.attacking.nextCounter = 0;
                        player.getHit(theEnemy.underAtk.damage);
                        theEnemy.underAtk = null;
                    }
                }
            }

            // Animations & Moves FX
            theEnemy.anims.update();
            theEnemy.movesfx.update();
        }
        if (inst.played != null) inst.played = null;

        // Status update
        data.background.image = data.background.images['default'];

        if (player.hp < 0) player.hp = 0
        player.hpBar.rect.width = player.maxHpBar.rect.width * player.hp / player.maxHp;
        for (let theEnemy of enemy.children) {
            if (theEnemy.hp < 0) theEnemy.hp = 0;
            theEnemy.hpBar.rect.width = theEnemy.maxHpBar.rect.width * theEnemy.hp / theEnemy.maxHp;
        }

    },
    paint: function () {
        let data = game.loaded.data;
        let pauseButton = data.pauseButton;
        let enemy = data.enemy;
        let player = data.player;
        let inst = data.inst;

        game.clearScreen();
        // Draw background
        game.ctx.filter = data.background.filter;
        game.ctx.drawImage(data.background.image, 0, 0);

        // Draw Current Level
        data.currentLevel.paint();

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
        //  Draw instrument
        game.ctx.filter = inst.filter;
        game.ctx.drawImage.apply(game.ctx, Object.values(inst.drawArgs));
        //  Draw Player's HP-bar
        game.ctx.filter = player.maxHpBar.filter;
        game.ctx.fillStyle = player.maxHpBar.color;
        game.ctx.fillRect.apply(game.ctx, Object.values(player.maxHpBar.rect));
        game.ctx.filter = player.hpBar.filter;
        game.ctx.fillStyle = player.hpBar.color;
        game.ctx.fillRect.apply(game.ctx, Object.values(player.hpBar.rect));

        // Draw pause-button
        game.ctx.filter = pauseButton.filter;
        game.ctx.drawImage.apply(game.ctx, Object.values(pauseButton.drawArgs));

        game.ctx.filter = 'none';
    }
} );

game.scenes.get('Game').createPanels = function () {
    // add Panel "Paused"
    let panelConfig = config.scenes['game'].panels.paused;
    this.panels.add( {
        name: 'Paused',
        status: 'off',
        filter: panelConfig.filter,
        x: panelConfig.x,
        y: panelConfig.y,
        width: panelConfig.width,
        height: panelConfig.height,
        buttons: JSON.parse( JSON.stringify(panelConfig.buttons) ),
        mask: JSON.parse( JSON.stringify(panelConfig.mask) ),
        preload: function () {
            game.loadImage('paused-panel', 'assets/img/panels/paused-panel.png');
            game.loadImage('paused-panel-buttons', 'assets/img/panels/paused-panel-buttons.png');
            game.loadImage('paused-panel-buttons-hover', 'assets/img/panels/paused-panel-buttons-hover.png');
        },
        create: function () {
            let button = [];

            this.image = game.getImage('paused-panel');
            this.buttons.images = {
                normal: game.getImage('paused-panel-buttons'),
                hover: game.getImage('paused-panel-buttons-hover')
            };
            for (let i = 0; i < this.buttons.names.length; i++) {
                button[i] = {
                    name: this.buttons.names[i],
                    filter: this.buttons.filter['normal'],
                    x: this.x + this.buttons.leftTop.x,
                    y: this.y + this.buttons.leftTop.y + (i * this.buttons.intervalY),
                    width: this.buttons.width,
                    height: this.buttons.height
                }
                button[i].drawArgs = {
                    image: this.buttons.images['normal'],
                    sx: 0,
                    sy: i * this.buttons.height,
                    sWidth: button[i].width,
                    sHeight: button[i].height,
                    dx: button[i].x,
                    dy: button[i].y,
                    dWidth: button[i].width,
                    dHeight: button[i].height
                };
                button[i].isHoverArgs = {
                    shape: 'rect',
                    x: button[i].x,
                    y: button[i].y,
                    width: button[i].width,
                    height: button[i].height
                };
            }
            game.loaded.data.pausedPanelButton = button;
        },
        update: function () {
            let button = game.loaded.data.pausedPanelButton;

            if ( !isHover('rect', this.x, this.y, this.width, this.height) && game.input.mouseClick ) {
                buttonClick(game.scenes.get('Game'), 'Resume');
            }

            for (let theButton of button) {
                if( isHover.apply(null, Object.values(theButton.isHoverArgs)) ) {
                    theButton.filter = this.buttons.filter['hover'];
                    theButton.drawArgs.image = this.buttons.images['hover'];
                    if (game.input.mouseClick) {
                        buttonClick(game.scenes.get('Game'), theButton.name);
                    }
                } else {
                    theButton.filter = this.buttons.filter['normal'];
                    theButton.drawArgs.image = this.buttons.images['normal'];
                }
            }
        },
        paint: function () {
            let data = game.loaded.data;
            let button = data.pausedPanelButton;

            // Draw mask
            game.ctx.filter = this.mask.filter['normal'];
            game.ctx.fillStyle = this.mask.color['normal'];
            game.ctx.fillRect.apply(game.ctx, Object.values(this.mask.rect));

            // Draw pause-button
            game.ctx.filter = data.pauseButton.filter;
            game.ctx.drawImage.apply(game.ctx, Object.values(data.pauseButton.drawArgs));

            // Draw background
            game.ctx.filter = this.filter['normal'];
            game.ctx.drawImage(this.image, this.x, this.y);

            // Draw buttons
            game.ctx.filter = this.buttons.filter['normal'];
            for (let theButton of button) {
                game.ctx.filter = theButton.filter;
                game.ctx.drawImage.apply(game.ctx, Object.values(theButton.drawArgs))
            }

            game.ctx.filter = 'none';
        }
    } );

    //add Panel "GameOver"
    panelConfig = config.scenes['game'].panels.gameOver;
    this.panels.add( {
        name: 'GameOver',
        status: 'off',
        filter: panelConfig.filter,
        x: panelConfig.x,
        y: panelConfig.y,
        width: panelConfig.width,
        height: panelConfig.height,
        buttons: JSON.parse( JSON.stringify(panelConfig.buttons) ),
        mask: JSON.parse( JSON.stringify(panelConfig.mask) ),
        preload: function () {
            game.loadImage('gameOver-panel', 'assets/img/panels/game-over-panel.png');
            game.loadImage('gameOver-panel-buttons', 'assets/img/panels/game-over-panel-buttons.png');
            game.loadImage('gameOver-panel-buttons-hover', 'assets/img/panels/game-over-panel-buttons-hover.png');
        },
        create: function () {
            let button = [];

            this.image = game.getImage('gameOver-panel');
            this.buttons.images = {
                normal: game.getImage('gameOver-panel-buttons'),
                hover: game.getImage('gameOver-panel-buttons-hover')
            };
            for (let i = 0; i < this.buttons.names.length; i++) {
                button[i] = {
                    name: this.buttons.names[i],
                    filter: this.buttons.filter['normal'],
                    x: this.x + this.buttons.leftTop.x,
                    y: this.y + this.buttons.leftTop.y + (i * this.buttons.intervalY),
                    width: this.buttons.width,
                    height: this.buttons.height
                }
                button[i].drawArgs = {
                    image: this.buttons.images['normal'],
                    sx: 0,
                    sy: i * this.buttons.height,
                    sWidth: button[i].width,
                    sHeight: button[i].height,
                    dx: button[i].x,
                    dy: button[i].y,
                    dWidth: button[i].width,
                    dHeight: button[i].height
                };
                button[i].isHoverArgs = {
                    shape: 'rect',
                    x: button[i].x,
                    y: button[i].y,
                    width: button[i].width,
                    height: button[i].height
                };
            }
            game.loaded.data.gameOverPanelButton = button;
        },
        update: function () {
            let button = game.loaded.data.gameOverPanelButton;

            for (let theButton of button) {
                if( isHover.apply(null, Object.values(theButton.isHoverArgs)) ) {
                    theButton.filter = this.buttons.filter['hover'];
                    theButton.drawArgs.image = this.buttons.images['hover'];
                    if (game.input.mouseClick) {
                        buttonClick(game.scenes.get('Game'), theButton.name);
                    }
                } else {
                    theButton.filter = this.buttons.filter['normal'];
                    theButton.drawArgs.image = this.buttons.images['normal'];
                }
            }
        },
        paint: function () {
            let data = game.loaded.data;
            let button = data.gameOverPanelButton;

            // Draw mask
            game.ctx.filter = this.mask.filter['normal'];
            game.ctx.fillStyle = this.mask.color['normal'];
            game.ctx.fillRect.apply(game.ctx, Object.values(this.mask.rect));

            // Draw background
            game.ctx.filter = this.filter['normal'];
            game.ctx.drawImage(this.image, this.x, this.y);

            // Draw buttons
            game.ctx.filter = this.buttons.filter['normal'];
            for (let theButton of button) {
                game.ctx.filter = theButton.filter;
                game.ctx.drawImage.apply(game.ctx, Object.values(theButton.drawArgs))
            }

            game.ctx.filter = 'none';
        }
    } );

    this.panels.init();
}


// Options panel
game.panels.add( {
    name: 'Options',
    status: 'off',
    mask: JSON.parse( JSON.stringify(config.panels.options.mask) ),
    preload: function () {

    },
    create: function () {

    },
    update: function () {

    },
    paint: function () {

    }
} );
