// INITIALIZATION FUNCTIONS

// Find the neighbors of a given cell position
function computeNeighbors(position, width, height) {
  var cellCount = width * height;

  var isOnLeftEdge = position % width === 0;
  var isOnRightEdge = position % width === width - 1;
  var isOnTopEdge = position < width;
  var isOnBottomEdge = position > cellCount - width - 1;

  var topLeftCorner = isOnLeftEdge && isOnTopEdge;
  var topRightCorner = isOnRightEdge && isOnTopEdge;
  var bottomLeftCorner = isOnLeftEdge && isOnBottomEdge;
  var bottomRightCorner = isOnRightEdge && isOnBottomEdge;

  var neighborList;

  if (topLeftCorner) {
    neighborList = [1, width - 1, width, width + 1, width * 2 - 1, cellCount - width, cellCount - width + 1, cellCount - 1];
  } else if (topRightCorner) {
    neighborList = [0, width - 2, width, width * 2 - 2, width * 2 - 1, cellCount - width, cellCount - 1, cellCount - 2];
  } else if (bottomLeftCorner) {
    neighborList = [0, 1, width - 1, cellCount - width - 1, cellCount - (width * 2), cellCount - (width * 2) + 1, cellCount - width + 1, cellCount - 1];
  } else if (bottomRightCorner) {
    neighborList = [0, width - 2, width - 1, cellCount - (width * 2), cellCount - width - 2, cellCount - width - 1, cellCount - width, cellCount - 2];
  } else if (isOnLeftEdge) {
    neighborList = [position - width, position + width, position - width + 1, position + 1, position + width + 1, position - 1, position + width - 1, position + (width * 2) - 1];
  } else if (isOnRightEdge) {
    neighborList = [position - width - 1, position - 1, position + width - 1, position - width, position + width, position - (width * 2) + 1, position - width + 1, position + 1];
  } else if (isOnTopEdge) {
    neighborList = [position - 1, position + 1, position + width - 1, position + width, position + width + 1, cellCount - width + position - 1, cellCount - width + position, cellCount - width + position + 1];
  } else if (isOnBottomEdge) {
    neighborList = [position - width - 1, position - width, position - width + 1, position - 1, position + 1, (position % width) - 1, position % width, (position % width) + 1];
  } else {
    neighborList = [position - width - 1, position - width, position - width + 1, position - 1, position + 1, position + width - 1, position + width, position + width + 1];
  }

  return neighborList;
}

function computeAllNeighborRelations(width, height) {
  var cellCount = width * height;
  var result = [];

  for (var i = 0; i < cellCount; i++) {
    result.push(computeNeighbors(i, width, height));
  }

  return result;
}


// Generating big dictionaries
function generateRuleDict() {
  return getBigBinaryList(9);
}

function getAllUniqueStartConfigs(width, height) {
  // some we have computed before and saved - if so, use those.
  if (width === 3 && height === 3) {
    return threeByThreeStartConfigs;
  } else if (width === 4 && height === 4) {
    return fourByFourStartConfigs;
  } else if (width === 3 && height === 4) {
    return threeByFourStartConfigs;
  } else if (width === 3 && height === 5) {
    return threeByFiveStartConfigs;
  } else if (width === 4 && height === 5) {
    return fourByFiveStartConfigs;
  }

  var uniqueConfigs = [];
  var cellCount = width * height;

  var rawStartConfigList = getBigBinaryList(width * height);

  var functions = [performAllHorizontalFlips, performAllVerticalFlips, performAllTranslations, performAllInversions];
  if (width === height) {
    functions.push(performAllRotations);
  }

  // Probably would  be good to refactor this to remove offending elements rather than zapping them
  for (var i = 0; i < rawStartConfigList.length; i++) {
    if (rawStartConfigList[i] != "duplicate") {
      uniqueConfigs.push(rawStartConfigList[i]);

      var duplicateConfigs = getEquivalentPositions(width, height, rawStartConfigList[i], functions);
      for (var j = 0; j < duplicateConfigs.length; j++) {
        var dupeIndex = convertArrayToNumber(duplicateConfigs[j]);
        rawStartConfigList[dupeIndex] = "duplicate";
      }

      // To keep track of progress
      if (uniqueConfigs.length % 100 === 0) {
        console.log(uniqueConfigs.length + " elements in unique configs so far!");
      }
    }
  }

  return uniqueConfigs;
}

function getEquivalentPositions(width, height, config, functions) {
  var positions = [config];

  for (var i = 0; i < functions.length; i++) {
    var newPositions = [];

    for (var j = 0; j < positions.length; j++) {
      newPositions = newPositions.concat(functions[i](width, height, positions[j])).unique();
    }

    positions = positions.concat(newPositions).unique();
  }

  return positions;
}

// only in square grids
function performAllRotations(width, height, config) {
  var result = [];

  for (var i = 0; i < 4; i++) {
    result.push(config);
    config = rotateRight(width, height, config);
  }

  result = result.unique();

  return result;
}

// only in square grids
function rotateRight(width, height, config) {
  var result = [];
  var cellCount = width * height;

  for (var i = 0; i < cellCount; i++) {
    var cellXPosition = i % width;
    var cellYPosition = Math.floor(i/width);

    var newXPosition = width - cellYPosition;
    var newYPosition = cellXPosition;

    result.push(config[newYPosition * width + newXPosition]);
  }

  return result;
}

function performAllHorizontalFlips(width, height, config) {
  var result = [];

  for (var i = 0; i < width; i++) {
    result.push(flipOnYAxis(width, height, i, config));
  }

  result = result.unique();
  return result;
}

function performAllVerticalFlips(width, height, config) {
  var result = [];

  for (var i = 0; i < height; i++) {
    result.push(flipOnXAxis(width, height, i, config));
  }

  result = result.unique();
  return result;
}

function flipOnXAxis(width, height, row, config) {
  var result = [];
  var cellCount = config.length;

  for (var i = 0; i < cellCount; i++) {
    var cellYPosition = Math.floor(i/width);
    var newYPosition = modularFlip(row, cellYPosition, height);

    var cellXPosition = i % width;

    result.push(config[newYPosition * width + cellXPosition]);
  }

  return result;
}

function flipOnYAxis(width, height, column, config) {
  var result = [];
  var cellCount = config.length;

  for (var i = 0; i < cellCount; i++) {
    var cellXPosition = i % width;
    var newXPosition = modularFlip(column, cellXPosition, width);

    var cellYPosition = Math.floor(i/width);

    result.push(config[cellYPosition * width + newXPosition]);
  }

  return result;
}

function performAllTranslations(width, height, config) {
  var result = [];
  for (var i = 0; i < width; i++) {
    for (var j = 0; j < height; j++) {
      result.push(config);
      config = translateDown(width, height, config);
    }
    config = translateRight(width, height, config);
  }

  result = result.unique();
  return result;
}

function translateRight(width, height, config) {
  var result = [];

  for (var i = 0; i < config.length; i++) {
    if (i % width === 0) {
      result.push(config[i + width - 1]);
    } else {
      result.push(config[i - 1]);
    }
  }

  return result;
}

function translateDown(width, height, config) {
  var result = [];
  var cellCount = config.length;

  for (var i = 0; i < cellCount; i++) {
    if (i < width) {
      result.push(config[i + cellCount - width]);
    } else {
      result.push(config[i - width]);
    }
  }

  return result;
}

// there are always two: the original and the inverted - nothing is its own inversion in this system.
function performAllInversions(width, height, config) {
  var result = [config];
  var newConfig = [];

  for (var i = 0; i < config.length; i++) {
    newConfig.push(!config[i] * 1);
  }

  result.push(newConfig);
  return result;
}


// RUNNING THE PROCESS FUNCTIONS
function initCA(width, height, noFilter) {
  var startConfigs;

  if (noFilter) {
    startConfigs = getBigBinaryList(width * height);
  } else {
    startConfigs = getAllUniqueStartConfigs(width, height);
  }
  var neighborInformation = computeAllNeighborRelations(width, height);

  return {neighborInformation: neighborInformation, startConfigs: startConfigs};
}

function runCA(width, height, byRuleResults, noFilter) {
  var init = initCA(width, height, noFilter);

  var neighborInformation = init.neighborInformation;
  var startConfigs = init.startConfigs;

  var result = 0;
  var allRules = getBigBinaryList(9);

  if (byRuleResults) {
    var ruleResults = [];
    var rawRuleResults = [];
  }

  for (var i = 0; i < allRules.length; i++) {
    var ruleResult = runForRule(allRules[i], startConfigs, neighborInformation);
    if (ruleResult > result) {
      result = ruleResult;
    }

    if (byRuleResults) {
      ruleResults.push({rule: allRules[i], result: ruleResult});
      rawRuleResults.push(ruleResult);
    }

  }

  if (byRuleResults) {
    rawRuleResults.sort(function(a, b){return a-b})
    return {result: result, ruleResults: ruleResults, rawRuleResults: rawRuleResults};
  }
  return result;
}

function runForRule(rule, startConfigs, neighborInformation) {
  var result = 0;

  for (var i = 0; i < startConfigs.length; i++) {
    var terminationCounter = calculateTerminationCounter(rule, startConfigs[i], neighborInformation);
    if (terminationCounter > result) {
      result = terminationCounter;
    }
  }

  return result;
}

function findPositionSuccessor(rule, config, neighborInformation) {
  var successorConfig = [];

  for (var i = 0; i < config.length; i++) {
    var activeNeighborCount = 0;

    for (var j = 0; j < 8; j++) {
      activeNeighborCount += config[neighborInformation[i][j]];
    }

    successorConfig.push((rule[activeNeighborCount] === 1) * 1);
  }

  return successorConfig;
}

function calculateTerminationCounter(rule, config, neighborInformation) {
  // The number of unique positions generated is 1 if the pattern immediately repeats.
  var counter = 0;
  var pastStates = [];
  var repeated = false;

  while (!repeated) {
    counter++;
    pastStates.push(config);

    config = findPositionSuccessor(rule, config, neighborInformation);
    repeated = searchForConfig(pastStates, config);
  }

  return counter;
}

function findBestConfigsForRule(rule, startConfigs, neighborInformation) {
  var bestConfigs = [];
  var result = 0;

  for(var i = 0; i < startConfigs.length; i++) {
    var terminationCounter = calculateTerminationCounter(rule, startConfigs[i], terminationCounter);
    if (terminationCounter > result) {
      result = terminationCounter;
      bestConfigs = [];
      bestConfigs.push(startConfigs[i]);
    } else if (terminationCounter === result) {
      bestConfigs.push(startConfigs[i]);
    }
  }

  return {result: result, configs: bestConfigs};
}

// UTILITIES
function searchForConfig(allConfigs, config){
  var i, j, current;
  for(i = 0; i < allConfigs.length; ++i){
    if(config.length === allConfigs[i].length){
      current = allConfigs[i];
      for(j = 0; j < config.length && config[j] === current[j]; ++j);
      if(j === config.length)
        return true;
    }
  }
  return false;
}

Array.prototype.unique = function() {
    var a = this.concat();
    for(var i=0; i<a.length; ++i) {
        for(var j=i+1; j<a.length; ++j) {
            if(a[i].toString() === a[j].toString())
                a.splice(j--, 1);
        }
    }

    return a;
};

function getBigBinaryList(maxValue) {
  var result = [];

  for (var i = 0; i < Math.pow(2, maxValue); i++) {
    var newElement = [];
    var string = Math.abs(i).toString(2);

    var trailingZerosLength = maxValue - string.length;
    for (var k = 0; k < trailingZerosLength; k++) {
      string = "0" + string;
    }

    for (var j = 0; j < maxValue; j++) {
      newElement.push(string[j] * 1);
    }

    result.push(newElement);
  }

  return result;
}

function modularFlip(axis, value, modulus) {
  var distance = Math.abs(axis - value);
  var valence = axis < value;

  if (valence) {
    return mod(axis - distance, modulus);
  } else {
    return mod(axis + distance, modulus);
  }
}

function mod(n, m) {
    return ((n % m) + m) % m;
}

function convertArrayToNumber(config) {
  var result = 0;
  for (var i = 0; i < config.length; i++) {
    result = result + (Math.pow(2, config.length - i - 1) * config[i])
  }

  return result;
}

// DISPLAY
function showConfig(config) {
  for (var i = 0; i < config.length; i++) {
    if (config[i] === 1) {
      $("#cell" + i).css("backgroundColor", "black");
      $("#cell" + i).css("color", "black");
      $("#cell" + i).css("border", "1 px solid red");
    } else {
      $("#cell" + i).css("backgroundColor", "white");
      $("#cell" + i).css("color", "white");
      $("#cell" + i).css("border", "1 px solid red");
    }
  }
}

function showSimulation(config, rule, neighborInformation, pastStates) {
  showConfig(config);

  config = findPositionSuccessor(rule, config, neighborInformation);
  repeated = searchForConfig(pastStates, config);

  if (!repeated) {
    pastStates.push(config);
    setTimeout(function() {showSimulation(config, rule, neighborInformation, pastStates)}, 500);
  }
}

// SANDBOX
function showLongest4x4Path() {
  var sandboxRule = [0, 1, 0, 0, 1, 0, 0, 0, 0];

  var sandboxStartConf = [0, 0, 0, 0, 0, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 0];

  var sandboxNeighborInfo = computeAllNeighborRelations(4, 4);

  showSimulation(sandboxStartConf, sandboxRule, sandboxNeighborInfo, []);
}
