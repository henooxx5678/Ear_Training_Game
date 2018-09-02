function gameStart () {
    game.start();
}
function gameUpdate () {
    for (let scene of game.scenes.children) {
        if (scene.status != 'stopped') {
            if (scene.status == 'running') {
                scene.update();
            }
            scene.paint();

            for (let panel of scene.panels.children) {
                if (panel.status == 'on') {
                    panel.update();
                    panel.paint();
                }
            }
        }
    }
    for (let panel of game.panels.children) {
        if (panel.status == 'on') {
            panel.update();
            panel.paint();
        }
    }

    if (game.loaded.sceneSwitching) {
        let newSceneName = game.loaded.data.newSceneName;
        let currentLevel = game.loaded.data.currentLevel;
        game.scenes.stop(game.loaded.data.sceneName);
        if (newSceneName == 'Game') { game.loaded.data.currentLevel = currentLevel; }
        game.scenes.start(newSceneName);
    }
    if (game.input.mouseClick) {
        game.input.mouseClick = false;
    }
    game.input.keyPress = [];
    game.input.keyRelease = [];
}

function buttonClick (scene, name) {
    console.log('\"' + name + '\"' + ' clicked');
    game.input.mouseClick = false;
    if (scene.name == 'Menu') {
        // Beginning page
        if (name == 'New Game') {
            switchScene(scene, 'Game');
            game.loaded.data.currentLevel = game.levels.get('Test');
        }
        else if (name == 'Load Game') {
            scene.page = 'load-game';
        }
        else if (name == 'Select Level') {
            scene.page = 'select-level';
        }
        else if (name == 'Options') {
            scene.page = 'options';
        }
        // Select Level page

    }
    else if (scene.name == 'Game') {
        if (name == 'Pause') {
            game.scenes.pause('Game');
            scene.panels.on('Paused');
        }
        else if (name == 'Resume') {
            game.scenes.wake('Game');
            scene.panels.off('Paused');
        }
        else if (name == 'Quit') {
            scene.panels.off('Paused');
            switchScene(scene, 'Menu');
        }
    }
}

function switchScene(scene, newSceneName) {
    game.loaded.sceneSwitching = true;
    game.loaded.data.sceneName = scene.name;
    game.loaded.data.newSceneName = newSceneName;
}

// ===================================

function sceneStart (scene) {
    console.log(scene.name + ' scene preloading..');
    scene.preload();
    console.log(scene.name + ' scene creating..');
    scene.create();
    console.log(scene.name + ' scene running...');
    scene.status = 'running';
}
function sceneStop (scene) {
    console.log(scene.name + ' scene stopped');
    scene.status = 'stopped';
    game.clearLoaded();
}
function scenePause (scene) {
    if (scene.status == 'running') {
        console.log(scene.name + ' scene paused');
        scene.status = 'paused';
    } else {
        console.log('[ERROR] ' + scene.name + ' scene is not running')
    }
}
function sceneWake (scene) {
    if (scene.status == 'paused') {
        console.log(scene.name + ' scene waked');
        scene.status = 'running';
    } else {
        console.log('[ERROR] ' + scene.name + ' scene is not paused');
    }
}

function panelsInit (panels) {
    for (let panel of panels) {
        panel.preload();
        panel.create();
    }
}
function panelOn (panel) {
    panel.status = 'on';
}
function panelOff (panel) {
    panel.status = 'off';
}

function Panels () {
    this.children = [];
    this.init = function () {
        panelsInit(this.children);
    };
    this.add = function (newOne) {
        this.children.push(newOne);
    };
    this.get = function (theName) {
        return getFromChildren(theName, this.children)
    };
    this.on = function (theName) {
        panelOn(this.get(theName));
    };
    this.off = function (theName) {
        panelOff(this.get(theName));
    };
}

function Sprite (type, image, width, height) {
    this.image = image;
    this.width = width;
    this.height = height;
    this.amount = [ image.width/width, image.height/height ];
    this.anims = {
        children: [],
        playing: null,
        index: 0,
        counter: 0,
        add: function (newAnim) {
            this.children.push(newAnim);
        },
        get: function (animName) {
            return getFromChildren(animName, this.children);
        },
        play: function (animName) {
            this.playing = animName;
            this.parent.drawArgs.sx = this.get(animName).framesIndex[0].x * this.width;
            this.parent.drawArgs.sy = this.get(animName).framesIndex[0].y * this.height;
            this.counter = 0;
        },
        update: function () {
            if (this.playing == null) {
                this.parent.drawArgs.sx = 0;
                this.parent.drawArgs.sy = 0;
                return undefined;
            }
            if (this.counter >= this.get(this.playing).framesInterval) {
                if (++this.index < this.get(this.playing).framesIndex.length) {
                    let theFrameIndex = this.get(this.playing).framesIndex[this.index];
                    this.parent.drawArgs.sx = theFrameIndex.x * this.width;
                    this.parent.drawArgs.sy = theFrameIndex.y * this.height;
                }
                else {
                    this.parent.drawArgs.sx = 0;
                    this.parent.drawArgs.sy = 0;
                    this.playing = null;
                }
                this.counter = 0;
            }
            this.counter += config.interval;
        },
        generateFramesIndex: function (startX, startY, endX, endY) {
            let result = [];
            for (let y = startY; y <= endY; y++) {
                for (let x = startX; x <= endX; x++) {
                    result.push( { x:x, y:y } );
                }
            }
            return result;
        }
    };
    this.movesfx = {
        children: [],
        playing: null,
        velocity: { x:0, y:0 },
        add: function (newOne) {
            this.children.push(newOne);
        },
        get: function (theName) {
            return getFromChildren(theName, this.children);
        },
        play: function (theName) {
            if (this.get(theName).type == 'simple-moves') {
                let totalDistance = 0;
                let directions = [];
                let theMove = this.get(theName);
                let point = theMove.point;

                for (let i = 1; i < point.length; i++) {
                    let theDistance = getDistance(point[i], point[i-1]);
                    let theDirection = {
                        x: (point[i].x - point[i-1].x) / theDistance,
                        y: (point[i].y - point[i-1].y) / theDistance
                    };
                    totalDistance += theDistance;
                    directions.push(theDirection);
                }
                this.playing = theName;
                theMove.speed = totalDistance / theMove.timeCost;
                theMove.directions = directions;
                theMove.pointIndex = 0;
                theMove.deltaPos = { x:0, y:0 };
                this.velocity = {
                    x: theMove.speed * theMove.directions[0].x,
                    y: theMove.speed * theMove.directions[0].y
                };
            }
        },
        update: function () {
            if (this.playing == null) {
                this.velocity.x = 0;
                this.velocity.y = 0;
                return undefined;
            }
            let theMove = this.get(this.playing);
            if (theMove.type == 'simple-moves') {
                let theDelta = theMove.deltaPos;
                let nextPoint = theMove.point[theMove.pointIndex + 1];
                theDelta.x = this.parent.drawArgs.dx - this.parent.x;
                theDelta.y = this.parent.drawArgs.dy - this.parent.y;
                if (Math.round(theDelta.x) == nextPoint.x && Math.round(theDelta.y) == nextPoint.y) {
                    theMove.pointIndex++;
                    if (theMove.pointIndex + 1 < theMove.point.length) {
                        this.velocity.x = theMove.speed * theMove.directions[theMove.pointIndex].x;
                        this.velocity.y = theMove.speed * theMove.directions[theMove.pointIndex].y;
                    }
                    else {
                        this.velocity.x = 0;
                        this.velocity.y = 0;
                        this.playing = null;
                    }
                }
            }
            this.parent.drawArgs.dx += this.velocity.x * config.interval;
            this.parent.drawArgs.dy += this.velocity.y * config.interval;
        },
        createFor: function (type) {
            if (type == 'enemy') {
                this.add( {
                    name: 'attack',
                    type: 'simple-moves',
                    point: [ {x:0, y:0}, {x:0, y:10}, {x:0, y:0} ],
                    timeCost: 160      // Measured in milliseconds
                } );
            }
        }
    };
    this.init = function () {
        this.anims.parent = this;
        this.movesfx.parent = this;
        this.movesfx.createFor(type);
        delete this.init;
        return this;
    }
}
