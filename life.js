// Copyright (C) 2011 Jan Wrobel <wrr@mixedbit.org>

(function () {
  "use strict";

  var CELL_SIZE_PX = 15;

  function createTable(height, width) {
    var space, row, cell, i, j;
    space = document.getElementById("space");
    for (i = 0; i < height; i += 1) {
      row = space.insertRow(-1);
      for (j = 0; j < width; j += 1) {
        cell = row.insertCell(j);
        cell.style.width = (CELL_SIZE_PX - 1) + "px";
        cell.style.height = (CELL_SIZE_PX - 1) + "px";
      }
    }
  }

  function displaySpace(possiblyChanged, oldSpace, evolvedSpace) {
    var table, row, cell, k, i, j;
    table = document.getElementById("space");
    for (k = 0; k < possiblyChanged.length; k += 1) {
      i = possiblyChanged[k][0];
      j = possiblyChanged[k][1];
      if (oldSpace[i][j] !== evolvedSpace[i][j]) {
        row = table.rows[i];
        cell = row.cells[j];
        if (evolvedSpace[i][j] === 1) {
          cell.style.background = "red";
        } else {
          cell.style.background = "#333333";
        }
      }
    }
  }

  function create2dArray(height, width) {
    var result, i;
    result = [];
    result.length = height;
    for (i = 0; i < height; i += 1) {
      result[i] = [];
      result[i].length = width;
    }
    return result;
  }

  function randomizeSpace(space, height, width) {
    var i, j;
    for (i = 1; i < height - 1; i += 1) {
      for (j = 1; j < width - 1; j += 1) {
        if (Math.floor(Math.random() * 11) % 10 === 0) {
          space[i][j] = 1;
        } else {
          space[i][j] = 0;
        }
      }
    }
  }

  function addNeighborhoodToNewCanChange(row, col,
                                         newCanChange, addedToNewCanChange) {
    var i, j;
    for (i = -1; i <= 1; i += 1) {
      for (j = -1; j <= 1; j += 1) {
        if (row + i > 0 && row + i < addedToNewCanChange.length - 1 &&
            col + j > 0 && col + j < addedToNewCanChange[0].length - 1 &&
            !addedToNewCanChange[row + i][col + j]) {
          addedToNewCanChange[row + i][col + j] = true;
          newCanChange.push([row + i, col + j]);
        }
      }
    }
  }

  function evolveSpace(space, evolvedSpace, canChange, addedToNewCanChange) {
    var k, i, j, neighboursCount, callback, newCanChange;
    newCanChange = [];

    for (k = 0; k < canChange.length; k += 1) {
      i = canChange[k][0];
      j = canChange[k][1];
      neighboursCount = space[i - 1][j - 1]
        + space[i - 1][j]
        + space[i - 1][j + 1]
        + space[i][j - 1]
        + space[i][j + 1]
        + space[i + 1][j - 1]
        + space[i + 1][j]
        + space[i + 1][j + 1];
      if (neighboursCount === 2 && space[i][j] === 1) {
        evolvedSpace[i][j] = 1;
      } else if (neighboursCount === 3) {
        evolvedSpace[i][j] = 1;
      } else {
        evolvedSpace[i][j] = 0;
      }
      if (space[i][j] !== evolvedSpace[i][j]) {
        addNeighborhoodToNewCanChange(i, j, newCanChange, addedToNewCanChange);
      }
    }
    for (k = 0; k < newCanChange.length; k += 1) {
      i = newCanChange[k][0];
      j = newCanChange[k][1];
      addedToNewCanChange[i][j] = false;
    }
    displaySpace(newCanChange, space, evolvedSpace);

    callback = function () {
      evolveSpace(evolvedSpace, space, newCanChange, addedToNewCanChange);
    };
    setTimeout(callback, 100);
  }

  function getWindowWidthAndHeight() {
    // the more standards compliant browsers
    // (mozilla/netscape/opera/IE7) use window.innerWidth and
    // window.innerHeight
    if (typeof window.innerWidth !== 'undefined') {
      return [window.innerWidth, window.innerHeight];
    }

    // IE6 in standards compliant mode (i.e. with a valid doctype as the
    // first line in the document)
    if (typeof document.documentElement !== 'undefined'
        && typeof document.documentElement.clientWidth !==
        'undefined' && document.documentElement.clientWidth !== 0) {
      return [document.documentElement.clientWidth,
              document.documentElement.clientHeight];
    }
    // older versions of IE
    return [document.getElementsByTagName('body')[0].clientWidth,
            document.getElementsByTagName('body')[0].clientHeight];

  }

  function getWindowWidth() {
    return getWindowWidthAndHeight()[0];
  }

  function getWindowHeight() {
    return getWindowWidthAndHeight()[1];
  }

  function main() {
    var width, height, space, emptySpace, addedToNewCanChange, canChange, i, j;
    width = Math.floor(getWindowWidth() / CELL_SIZE_PX) - 1;
    height = Math.floor(getWindowHeight() / CELL_SIZE_PX) - 1;
    createTable(height, width);
    // 2D array with nth generation of the space.
    space = create2dArray(height, width);
    randomizeSpace(space, height, width);
    // 2D array to hold (n + 1)th generation of the space.
    emptySpace = create2dArray(height, width);
    // Which cells can change in the next generation (cells not in
    // the array will for sure stay the same).
    canChange = [];
    // 2D array to quickly determine if a cell is already added to
    // canChange array.
    addedToNewCanChange = create2dArray(height, width);
    for (i = 1; i < height - 1; i += 1) {
      for (j = 1; j < width - 1; j += 1) {
        canChange.push([i, j]);
        addedToNewCanChange[i][j] = false;
        emptySpace[i][j] = 0;
      }
    }
    displaySpace(canChange, emptySpace, space);
    evolveSpace(space, emptySpace, canChange, addedToNewCanChange);
  }

  if (window.attachEvent) {
    window.attachEvent('onload', main);
  } else {
    window.onload = main;
  }
}());
