let rows = 0;
let columns = 0;
let gameTable; // rows X columns X 2 ( 1 --> image, 2 --> state)
let totalPairs;
let removedPairs;
let moves = 0;
let correctMoves = 0;
let wrongMoves = 0;
let gameStarted = false;
let startingTime = new Date();

let elementState = {
    REMOVED: 0,
    SELECTED: 1,
    NORMAL: 2
};

let testElement = {
    VALUE: null,
    C: -1,
    R: -1
};

function isEven(n) {
    n = Number(n);
    return (n % 2) === 0;
}

function startNewGame() {
    let r = document.getElementById("rows").value;
    let c = document.getElementById("columns").value;
    testElement.VALUE = null;
    testElement.C = -1;
    testElement.R = -1;

    if (r === "" || r < 4 || r > 12) {
        alert("Please enter a number of rows between 4 and 12");
        return;
    }

    if (c === "" || c < 4 || c > 30) {
        alert("Please enter a number of columns between 4 and 30");
        return;
    }

    if (!isEven(r * c)) {
        alert("The number of tiles must be even. Please select a different setup");
        return;
    }

    rows = r;
    columns = c;
    createGameBoard(document.getElementById("level").value);
    gameStarted = true;
    moves = 0;
    startingTime = new Date();
    document.getElementById("gameBoard").setAttribute("style", "visibility:visible;");
    document.getElementById("setupNewGamePanel").setAttribute("style", "visibility:hidden");
    document.getElementById("setupNewGamePanel").setAttribute("height", "0px");
}


function createGameBoard(level) {
    let table = document.getElementById("board");
    table.innerHTML = "";
    totalPairs = rows * columns / 2;
    removedPairs = 0;
    let c = 0;
    let r;
    let i = 0;
    let values = createRandomArray(level, totalPairs);
    gameTable = [];

    for (r = 0; r < rows; r++) {
        let row = table.insertRow(r);
        gameTable[r] = [];

        for (c = 0; c < columns; c++) {
            let cell = row.insertCell(c);
            cell.innerHTML = "<a onclick='check(" + r + "," + c +
                ")'><img src='" +
                values[i] +
                "' alt='' /></a>";
            gameTable[r][c] = [];

            gameTable[r][c][0] = values[i];
            gameTable[r][c][1] = elementState.NORMAL;
            i++;
        }
    }
}

function intToImage(i) {
    let s = i.toString();
    while (s.length < 3) {
        s = '0' + s;
    }
    return 'images/' + s + '.jpg';
}

function createRandomArray(level, numOfPairs) {
    let repeat = Number(level);
    let result = [];
    let i;
    let ImageIndex = 1;
    let image = '';

    for (i = 0; i < numOfPairs * 2; i += 2) {
        image = intToImage(ImageIndex);
        result[i] = image;
        result[i + 1] = image;
        repeat--;
        if (repeat === 0) {
            repeat = Number(level);
            ImageIndex++;
            if (ImageIndex === 43) // we have only 42 available images
                ImageIndex = 1;
        }
    }

    // shuffle the table
    let j = 0;
    let temp;
    for (i = 0; i < numOfPairs * 2 - 1; i++) {
        j = i + Math.floor(Math.random() * (numOfPairs * 2 - i));
        temp = result[i];
        result[i] = result[j];
        result[j] = temp;
    }

    return result;
}

function cancelTheGame() {
    if (document.getElementById("btnCancel").value === "cancel this game")
        if (!confirm("Are you sure you want to cancel the game?"))
            return;

    document.getElementById("btnCancel").value = "cancel this game";
    document.getElementById("setupNewGamePanel").setAttribute("style", "visibility:visible;");
    document.getElementById("setupNewGamePanel").setAttribute("style", "height, 100%");
    document.getElementById("gameBoard").setAttribute("style", "visibility:hidden");
    gameStarted = false;
}

function removeTile(r, c) {
    document.getElementById("board").rows[r].cells[c].innerHTML =
        "<a><img src='../images/blank.jpg' alt='' /></a>";
    gameTable[r][c][1] = elementState.REMOVED;
}

function selectTile(r, c) {
    document.getElementById("board").rows[r].cells[c].setAttribute("class", "selected");
    gameTable[r][c][1] = elementState.SELECTED;
}

function unselectTile(r, c) {
    document.getElementById("board").rows[r].cells[c].setAttribute("class", "normal");
    gameTable[r][c][1] = elementState.NORMAL;
}

function tileCanBeRemoved(r, c) {
    if (r === 0 || r === rows - 1 || c === 0 || c === columns - 1)
        return true;

    return (
        gameTable[r - 1][c][1] === elementState.REMOVED ||
        gameTable[r][c + 1][1] === elementState.REMOVED ||
        gameTable[r + 1][c][1] === elementState.REMOVED ||
        gameTable[r][c - 1][1] === elementState.REMOVED
    );
}

function check(r, c) {
    if (gameTable[r][c][1] === elementState.REMOVED)
        return;

    if (testElement.VALUE === null && tileCanBeRemoved(r, c)) {
        testElement.VALUE = gameTable[r][c][0]; // the image of the clicked cell
        testElement.C = c;
        testElement.R = r;
        selectTile(r, c);
    }
    else if (testElement.C === c && testElement.R === r) {
        unselectTile(r, c);
        testElement.VALUE = null;
        testElement.C = -1;
        testElement.R = -1;
    }
    else if (testElement.VALUE === gameTable[r][c][0] && tileCanBeRemoved(r, c)) {
        unselectTile(testElement.R, testElement.C);
        // remove must follow unselect to set the element in the correct state
        removeTile(testElement.R, testElement.C);
        removeTile(r, c);

        testElement.VALUE = null;

        removedPairs++;
        moves++;
        correctMoves++;

        if (removedPairs === totalPairs) {
            updateInfoPanel();
            gameStarted = false;
            document.getElementById("btnCancel").value = "start new game";
            alert("You WON !!!\nYou have " + correctMoves +
                " correct moves (" +
                Math.round(100 * (correctMoves / moves)).toString()
                + "% successful)\nand " +
                wrongMoves + " wrong moves (" +
                Math.round(100 * (wrongMoves / moves)).toString()
                + "% unsuccessful)");
            return;
        }
    }
    else {
        moves++;
        wrongMoves++;
    }

    if (!moveIsPossible()) {
        updateInfoPanel();
        gameStarted = false;
        document.getElementById("btnCancel").value = "start new game";
        alert("No more moves are possible !!!\nYou Lose !!!\nYou have " +
            correctMoves + " correct moves (" +
            Math.round(100 * (correctMoves / moves)).toString()
            + "% successful)\nand " +
            wrongMoves + " wrong moves (" +
            Math.round(100 * (wrongMoves / moves)).toString()
            + "% unsuccessful)");
    }
}

function moveIsPossible() {
    let r;
    let c = 0;
    let imagesCanBeRemoved = [];
    let counter = 0;

    for (r = 0; r < rows; r++)
        for (c = 0; c < columns; c++)
            if (gameTable[r][c][1] !== elementState.REMOVED && tileCanBeRemoved(r, c)) {
                if (imagesCanBeRemoved.length === 0)
                    imagesCanBeRemoved.push(gameTable[r][c][0]);
                else
                    for (counter = 0; counter < imagesCanBeRemoved.length; counter++) {
                        if (imagesCanBeRemoved[counter] === gameTable[r][c][0])
                            return true;
                        else
                            imagesCanBeRemoved.push(gameTable[r][c][0]);
                    }
            }

    return false;
}

function updateInfoPanel() {
    let today = new Date();
    let h = today.getHours();
    let m = today.getMinutes();
    let s = today.getSeconds();
    m = checkTime(m);
    s = checkTime(s);

    document.getElementById('clock').innerHTML = h + ":" + m + ":" + s;

    if (gameStarted) {
        document.getElementById('moves').innerHTML = moves + " moves";
        let secondsElapsed = Math.round((today - startingTime) / 1000);
        document.getElementById('timeElapsed').innerHTML = "seconds elapsed:" + secondsElapsed;
    }
}

function startTime() {
    setTimeout(function () {
        updateInfoPanel();
        startTime();
    }, 500);
}

function checkTime(i) {
    if (i < 10) {
        i = "0" + i;
    }  // add zero in front of numbers < 10
    return i;
}