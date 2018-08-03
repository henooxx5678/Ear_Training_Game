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
