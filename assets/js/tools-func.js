function getFromChildren (name, children) {
    return children.find( function (elem) {
        return elem.name == name;
    } );
}

function isHover (shape, ...args) {
    let pos = game.mousePos;
    let x = args[0];
    let y = args[1];

    if (shape == 'rect') {             // [x, y, width, height]
        let testtest = x + args[2];
        let y2 = y + args[3];
        if (pos.x >= x && pos.x <= testtest && pos.y >= y && pos.y <= y2) {
            return true;
        } else {
            return false;
        }
    }
    else if (shape == 'square') {     // [x, y, length_of_a_side]
        let testtest = x + args[2];
        let y2 = y + args[2];
        if (pos.x >= x && pos.x <= testtest && pos.y >= y && pos.y <= y2) {
            return true;
        } else {
            return false;
        }
    }
    else if (shape == 'curcle') {     // [x, y, radius]
        let r = args[2];
        let distanceSq = Math.pow(pos.x - x, 2) + Math.pow(pos.y - y, 2);
        if (distamceSq < Math.pow(r, 2)) {
            return true;
        } else {
            return false;
        }
    }
}

// === Math ===
function getDistance (point1, point2) {
    let sqx = Math.pow(point1.x - point2.x, 2);
    let sqy = Math.pow(point1.y - point2.y, 2);
    return Math.sqrt(sqx + sqy);
}
