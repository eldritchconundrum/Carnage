'use strict';

var allDirections = [
        {x: -1, y: -1},
        {x:  0, y: -1},
        {x: -1, y:  0},
        {x:  1, y:  0},
        {x:  0, y:  1},
        {x:  1, y:  1},
    ];

function newGame() {
    // TODO
    return makeDummyState();
}

function move(state, d) { // active worm is moved by player
    if (state.movesLeft > 0) {
	state.movesLeft -= 1;
	var w = state.selectedWorm;
	var worm = state.worms[w];
	state.trail.push({x:worm.x, y:worm.y});
	moveWorm(state, w, addXY(worm, d));
	return state;
    }
}

function moveWorm(state, wormId, p) {
    checkargs(state, wormId, p);
    var x = state.worms[wormId].x;
    var y = state.worms[wormId].y;
    state.board[x][y].worm = -1;
    state.board[p.x][p.y].worm = wormId;
    state.worms[wormId].x = p.x;
    state.worms[wormId].y = p.y;
    return state;
}

// test if position exists
function exists(state, x, y) {
    if (x < 0 || x > 10) {
        return false;
    }
    if (y < 0 || y > 10) {
        return false;
    }
    return state.board[x][y].exists;
}

function canMove(state, d) {
    if (state.movesLeft <= 0) {
	return false;
    }
    var w = state.selectedWorm;
    var x = state.worms[w].x + d.x;
    var y = state.worms[w].y + d.y;

    if (!exists(state, x, y)) {
        return false;
    }
    if (state.board[x][y].worm != -1) {
        return false;
    }
    return true;
}

function kill(state, w) {
    w.life = 0;
    state.board[w.x][w.y].worm = -1;
}

function harm(state, w) {
    if (w.life < 1) {
        throw "cannot harm dead worms";
    } else if (w.life == 1) {
        kill(state, w);
    } else {
        w.life--;
    }
}

function endTurn(state) {
    state.selectedCard = -1;
    state.selectedWorm = -1;
    return state;
}

function newTurn(state, c) {
    state.selectedCard = 0;
    state.selectedWorm = c.worm;
    state.currentPlayer = (state.currentPlayer + 1) % state.players.length;
    state.hasPlayed = false;
    state.movesLeft = 3;
    state.trail = [];
    return state;
}

function canAttack(state, c) {
    if (state.selectedCard <= 0) {
        return false;
    }
    if (c.worm === state.selectedWorm) {
        return false;
    }

    var activeWorm = state.worms[state.selectedWorm];
    var clickedWorm = c.worm < 0 ? null : state.worms[c.worm];
    var direction = findDirection(activeWorm, c.worm < 0 ? c : clickedWorm);
    var distance = distanceBetween(activeWorm, c.worm < 0 ? c : clickedWorm);
    var nearestTarget = direction === null ? null : nearestWorm(state, activeWorm, direction);

    if (state.actions[state.selectedCard] === "Shotgun") {
	return clickedWorm !== null && direction !== null && nearestTarget === clickedWorm;
    } else if (state.actions[state.selectedCard] === "Bow") {
	return clickedWorm !== null && direction !== null && nearestTarget === clickedWorm;
    } else if (state.actions[state.selectedCard] === "Baseball Bat") {
	return clickedWorm !== null && direction !== null && distance === 1;
    } else if (state.actions[state.selectedCard] === "Pistol") {
    } else if (state.actions[state.selectedCard] === "Flame Thrower") {
    } else if (state.actions[state.selectedCard] === "Kamikaze") {
    } else if (state.actions[state.selectedCard] === "Hook") {
    } else if (state.actions[state.selectedCard] === "Mine") {
	return containsXY(state.trail, c);
    } else if (state.actions[state.selectedCard] === "Dynamite") {
	return containsXY(state.trail, c);
    } else if (state.actions[state.selectedCard] === "") {
    }
    // TODO
    return true;
}

function attack(state, c) {
    var activeWorm = state.worms[state.selectedWorm];
    var clickedWorm = c.worm < 0 ? null : state.worms[c.worm];
    var direction = findDirection(activeWorm, c.worm < 0 ? c : clickedWorm);
    var distance = distanceBetween(activeWorm, c.worm < 0 ? c : clickedWorm);
    var nearestTarget = direction === null ? null : nearestWorm(state, activeWorm, direction);
    if (state.actions[state.selectedCard] === "Shotgun") {
	if (clickedWorm !== null && direction !== null && nearestTarget === clickedWorm) {
	    push(state, clickedWorm, direction);
	    if (clickedWorm.life > 0) {
		harm(state, clickedWorm);
	    }
	}
    } else if (state.actions[state.selectedCard] === "Bow") {
	if (clickedWorm !== null && direction !== null && nearestTarget === clickedWorm) {
	    push(state, clickedWorm, direction);
	    push(state, clickedWorm, direction);
	}
    } else if (state.actions[state.selectedCard] === "Baseball Bat") {
	if (clickedWorm !== null && direction !== null && distance === 1) {
	    push(state, clickedWorm, direction);
	    push(state, clickedWorm, direction);
	    push(state, clickedWorm, direction);
	}
    } else if (state.actions[state.selectedCard] === "Pistol") {
    } else if (state.actions[state.selectedCard] === "Flame Thrower") {
    } else if (state.actions[state.selectedCard] === "Kamikaze") {
    } else if (state.actions[state.selectedCard] === "Hook") {
    } else if (state.actions[state.selectedCard] === "Mine") {
	board[c.x][c.y].mine = true;
    } else if (state.actions[state.selectedCard] === "Dynamite") {
	board[c.x][c.y].dynamite = true;
    } else if (state.actions[state.selectedCard] === "") {
    } else {
	// TODO
	harm(state, state.worms[c.worm]);
    }
    return state;
}

function push(state, worm, direction) {
    checkargs(state, worm, direction);
    if (worm.life < 1) {
	return;
    }
    var behind = addXY(worm, direction);
    if (!exists(state, behind.x, behind.y)) {
	kill(state, worm);
    } else {
	var wormBehind = findWormAt(state, behind);
	if (wormBehind !== null) {
	    push(state, wormBehind, direction);
	}
	moveWorm(state, wormId(state, worm), addXY(worm, direction));
    }
}

function wormId(state, worm) {
    checkargs(state, worm);
    return state.board[worm.x][worm.y].worm;
}

function findWormAt(state, p) {
    checkargs(state, p);
    var wormId = state.board[p.x][p.y].worm;
    return wormId < 0 ? null : state.worms[wormId];
}

function nearestWorm(state, from, direction) {
    checkargs(state, from, direction);
    var p = addXY(from, direction);
    if (!exists(state, p.x, p.y)) {
	return null;
    }
    var worm = findWormAt(state, p);
    if (worm !== null) {
	return worm;
    }
    return nearestWorm(state, p, direction);
}


// hexagonal topology

function isLinedUpWith(from, to) {
    checkargs(from, to);
    var dx = to.x - from.x, dy = to.y - from.y;
    return dx === 0 || dy === 0 || dx - dy === 0;
}

function distanceBetween(from, to) {
    checkargs(from, to);
    var dx = to.x - from.x, dy = to.y - from.y;
    if (dx * dy > 0) {
	return Math.max(Math.abs(dx), Math.abs(dy));
    } else {
	return Math.abs(dx) + Math.abs(dy);
    }
}

function findDirection(from, to) {
    checkargs(from, to);
    if (!isLinedUpWith(from, to)) {
	return null;
    }
    var dx = to.x - from.x, dy = to.y - from.y;
    if (dx === dy) {
	return dx > 0 ? {x:1,y:1} : {x:-1,y:-1};
    } else if (dx === 0) {
	return dy > 0 ? {x:0,y:1} : {x:0,y:-1};
    } else {
	return dx > 0 ? {x:1,y:0} : {x:-1,y:0};
    }
}

function addXY(p1, p2) {
    checkargs(p1, p2);
    return {x:p1.x+p2.x, y:p1.y+p2.y};
}

function containsXY(list, p) {
    for (var i = 0; i < list.length; ++i) {
	var item = list[i];
	if (item.x === p.X && item.y === p.y) {
	    return true;
	}
    }
    return false;
}

// programmer sanity

function fail(message) {
    checkargs(message);
    console.log(new Error().stack);
    throw 'Assertion failed! ' + message;
}

function checkargs() { // varargs
    for (var i = 0; i < arguments.length; ++i) {
	var arg = arguments[i];
	if (arg === undefined) {
	    fail('argument is undefined.');
	}
	if (arg === null) {
	    fail('argument is null.');
	}
    }
}
