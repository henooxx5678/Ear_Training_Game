const config = {
    interval: 40,       // measured in milliseconds (FPS:25)
    width: 800,
    height: 600,
    instruments: {
        'keyboard': {
            notes: ['c4', 'a4']
        }
    },
    settings: {
        instName: 'keyboard',
        player: {
            atkTime: 2000,  //ms
            atkChanceRate: 1
        }
    },
    levels: [
        { name: 'Test', locked: false },
        { name: 'Locked1', locked: true },
        { name: 'Locked2', locked: true }
    ],
    hpBarType: {
        default: {
            color: { remained:'#00cf00', lost:'red' },
            filter: { remained:'drop-shadow(1px 2px 2px #333333)', lost:'none' }
        }
    }
}

config.scenes = {
    menu: {
        background: {
            filter: { normal:'none', mask:'blur(5px)' },
            mask: {
                filter: { normal:'none', mask:'none' },
                color: { normal:'rgba(0,0,0,0)', mask:'rgba(255,255,255,0.5)' },
                rect: {
                    x: 0,
                    y: 0,
                    width: config.width,
                    height: config.height
                }
            }
        },
        buttons: {
            filter: { normal:'none', hover:'none' },
            width: 303,
            height: 47,
            leftTop: { x: 249, y: 277 },
            intervalY: 65,
            names: [
                'New Game',
                'Load Game',
                'Select Level',
                'Options'
            ]
        },
        pages: {
            loadGame: {},
            selectLevel: {
                selections: {
                    filter: { normal:'none', hover:'none' },
                    width: 108,
                    height: 454,
                    topY: 73,
                    widthHover: 122,
                    heightHover: 514,
                    topYHover: 43,
                    intervalX: 148,
                    intervalXHover: 162
                }
            }
        }
    },
    game: {
        background: {
            filter: { normal:'none' }
        },
        pauseButton: {
            filter: { normal:'none' },
            x: 738,
            y: 10,
            width: 52,
            height: 52
        },
        panels: {
            paused: {
                filter: { normal:'drop-shadow(1px 1px 2px #3d3d3d)' },
                x: 286,
                y: 98,
                width: 228,
                height: 404,
                buttons: {
                    filter: { normal:'none', hover:'none' },
                    width: 169,
                    height: 38,
                    leftTop: { x:29, y:99 },
                    intervalY: 44,
                    names: [
                        'Resume',
                        'Restart',
                        'Save',
                        'Load',
                        'Options',
                        'Quit'
                    ]
                },
                mask: {
                    filter: { normal:'none' },
                    color: { normal:'rgba(255,255,255,0.5)' },
                    rect: {
                        x: 0,
                        y: 0,
                        width: config.width,
                        height: config.height
                    }
                }
            }
        },
        player: {
            hpBar: {
                color: config.hpBarType['default'].color,
                filter: config.hpBarType['default'].filter,
                rect: {
                    x: 200,
                    y: 570,
                    width: 400,
                    height: 20
                }
            }
        },
        instruments: {
            keyboard: {
                filter: { normal:'none' },
                x: 17,
                y: 371,
                width: 766,
                height: 158
            }
        }
    }
};

config.panels = {
    options: {
        filter: { normal:'drop-shadow(1px 1px 2px #3d3d3d)' },
        mask: {
            filter: { normal:'none' },
            color: { normal:'rgba(255,255,255,0.5)' },
            rect: {
                x: 0,
                y: 0,
                width: config.width,
                height: config.height
            }
        }
    }
};
