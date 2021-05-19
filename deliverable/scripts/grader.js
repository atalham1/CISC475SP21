/*
    grader.js:
    This file contains all the checking/autograding functions to compare the circuits to a truth table
    We didn't make a ton of progress in terms of it being user-friendly and abstracted, but we got a basic implementation of comparing the
    circuits to a truth table to work that hopefully you can build off of. You can uncomment any of the console.log() functions that we 
    call to check the current format of the circuit array or truth table

    Each function will be explained more in depth, but as a basic rundown this is the current process:
    
    1. From the main function, we take in the global node set, and the global truthTableArray
    2. The first thing we do is check to make sure the current inputs and outputs match between the truthTableArray and circuits
       If they do not match, we alert the user, and return (this is done in the main checkNodeInputsAndOutputs() function)
       Inputs are currently designated as a Positive Input or Negative Input. For auto-grading purposes it checks all possibilities,
       so even if the input is a Positive input, it will check for when it is Negative as well. We were going to either add a new input type
       or have something more clear to show the user that the process happens like this.
    3. The next thing we do is call createGradedArray(), which is used to convert the Node Set into an array with a format
       matching truthTableArray. This function calls a lot of helper functions, but it essentially creates a 2^n array with n being 
       the number of inputs to make sure every combination of inputs is accounted for. Right now we just hard coded the label for inputs starting
       at 'a' and going up for every input ('a', 'b', 'c'). Ideally these inputs would be able to be chosen by the user.
    4. These inputs are then used to generate the outputs (0 if the input combination returns false, 1 if the input combination returns true), then they are
       added to the array as well
    5. After we have created the array from the node list we call compareGateAndTable() to do the check to see if the tables match each other. It is currently
       essentially hardcoded to only work with 3 inputs - this needs to be abstracted. Right now it simply displays a 'PASSED' or 'FAILED' after the check has gone through.

    The next steps for autograding will be outlined in the Writeup.txt
*/

var truthTableArray = [];
var totalGateInputs = 0;
var totalGateOutputs = 0;

var totalTableInputs = 0;
var totalTableOutputs = 0;

var nodes = new Set();

/*
    checkNodeInputsAndOutputs():
    this is the main function that gets called from grader.js, it takes in the Node Set and truthTableArray from
    the global variables in main.js. We just do a quick check to count inputs and outputs from the truth table and 
    the nodes to make sure they match. So for example, if a truth table with 3 inputs and 2 outputs was uploaded, we make sure
    there are 3 inputs and 2 outputs in the circuit. After that it continues the process of autograding.
*/
function checkNodeInputsAndOutputs(nodeList, truthTable) {

    totalGateInputs = 0;
    totalGateInputs = 0;
    totalGateOutputs = 0;
    totalTableInputs = 0;
    totalTableOutputs = 0;

    nodes = new Set(nodeList);
    truthTableArray = truthTable;

    nodes.forEach(function (element) {
        if(element.piece instanceof PositiveIn || element.piece instanceof NegativeIn){
            totalGateInputs += 1;

        }
        if(element.piece instanceof LEDout){
            totalGateOutputs += 1;

        }
    });
    //console.log("gate inputs: " + totalGateInputs);
    //console.log("gate outputs: " + totalGateOutputs);

    truthTableArray[0].forEach(function (header) {
        if (header == header.toUpperCase()) {
            totalTableOutputs += 1;
        }
        else if (header == header.toLowerCase()) {
            totalTableInputs += 1;
        }
    });
    //console.log("table inputs: " + totalTableInputs);
    //console.log("table outputs: " + totalTableOutputs);

    if (totalGateInputs != totalTableInputs) {
        alert('The number of gate and table inputs does not match.');
        return;
    }
    else if (totalGateOutputs != totalTableOutputs){
        alert('The number of gate and table outputs does not match.');
        return;
    }
    else {
        createGradedArray();
    }
};
/*
    createGradedArray():
    This is the 2nd step in the auto-grading process. We create an array from the nodeList that can be used
    to compare against the truthTable array. As we said previously, inputs are determined from Positive Inputs or
    Negative Inputs, and outputs are LED outputs. The first thing we do is go through the Node Set and add the inputs
    to an array, as well as give them a label. Right now we just hard code the input label, but the user should be able to determine them somehow.
    From there it calls a number of functions to create the input table. With that input table, for every row of input (ie. 0 0 1, 0 1 1, 1 1 1),
    we set the output of the associated circuit piece to that value, then we create a temp variable in the format of a node set,
    we add all the circuit pieces that aren't inputs from the original Node Set to our temp node set, add the newly updated input circuit pieces, 
    then call checkGates() with that temp node set. checkGates() will return an array that has the outputs associated with those inputs, which we can add to
    out gate array. This is kind of a confusing process, but we are essentially creating a node set for each input combination that is the same format as 
    the global node set in main.js, then calling it against a function that is pretty much the same as checkConnections() in main.js to determine the outputs. It is
    basically the same process that is used to determine whether the LED Outputs should be on or off, except we are doing it for every possible 0 and 1 combination.
    After this we have an array representing our circuit that has the all the inputs possible and the associated outputs that go with it. We call compareGateAndTable()
    next.
*/
function createGradedArray() {

    var inputArray = new Set();
    var nodesCopy = new Set();
    var test = [];
    nodes.forEach(function(element) {
        if(element.piece instanceof PositiveIn || element.piece instanceof NegativeIn){
            inputArray.add(element);
        }
        else {
            nodesCopy.add(element);
        }
    });

    for (var i = 0; i < inputArray.size; i++) {
        var x = String.fromCharCode(97 + i).toString();
        test.push(x);
    }
    var len = test.length
    ,trueSet		
    ,trues = []
    ,splitBy = Math.round(len/2);


    var outputArray = [];
    var endArray = [];
    outputArray.push(truth(test,test,true));

	for(var i=1; i<=splitBy; i++) {
		trueSet = reduceToCombinations(permut(test, i));
		
		trueSet.forEach((truthSrc)=>{
			trues = truth(test, truthSrc);
			outputArray.push(trues);
		}); 
    }
    outputArray.push(truth(test, test));


    for (var i = 0; i < outputArray.length; i++) {
        var merged = new Set([...nodesCopy, ...inputArray])

        var index = 0;
        var temp = [];

        merged.forEach(function(element) {
            if(element.piece instanceof PositiveIn || element.piece instanceof NegativeIn){
                var x = String.fromCharCode(97 + index).toString();
                x = x.toString();
                element.piece.output = outputArray[i][x];
                var o = {[x]: outputArray[i][x]}
                temp.push(o);
                index += 1;
            }
        });
        var n = temp.concat(checkGates(merged));
        endArray.push(n);
    }
    //console.log(endArray);
    //console.log(truthTableArray);

    compareGateAndTable(endArray);

}
/*
    compareGateAndTable():
    Once this function is called, we are almost at the point where we can compare the circuit to the truth table. The last thing we do before that is reformat our
    truthTable array to be in the same format as our circuit array. From there we are able to compare the two arrays. Our current comparision process is not fully correct,
    and the changes needed will be outlined in the Writeup.txt. As we said, right now it is hardcoded to only work if the inputs are pre-set properly and there are only 3
    inputs. But essentially what the function does is match the labels and their values of the circuit array to the ones of the truthTableArray. So for example, it will start with
    ('a': 0, 'b': 0, 'c': 0) of the circuit array, then look for the row where ('a': 0, 'b': 0, 'c': 0) is in the truthTableArray. After that is compares the outputs between those 
    two rows to see if they are the same. If they are, the check has passed for that row and it continues. If they are not the same, the check will fail.
*/
function compareGateAndTable(gateOutput) {
    var tableCompareArray = [];
    for (var i = 1; i < truthTableArray.length; i++) {
        var temp = [];
        for (var j = 0; j < truthTableArray[0].length; j++) {
            if (truthTableArray[0][j] == truthTableArray[0][j].toUpperCase()) {
                var o = parseInt(truthTableArray[i][j]);
                temp.push(o);
            }
            else {
                var head = truthTableArray[0][j];
                var o = {[head]: parseInt(truthTableArray[i][j])};
                temp.push(o);
            }

        }
        tableCompareArray.push(temp);
    }

    //console.log(gateOutput);
    //console.log(tableCompareArray);
    var checkResult = true;
    gateOutput.forEach(function(row) {
        var res = compareOutput(row, tableCompareArray);
        if (!res) {
            checkResult = false;
        }
    });

    if (checkResult) {
        document.getElementById('checkText').style.color = '#32CD32';
        document.getElementById('checkText').textContent = "PASSED";
    }
    else {
        document.getElementById('checkText').style.color = '#FF0000';
        document.getElementById('checkText').textContent = "FAILED";
    }
    
}

// this function will need to be updated so the labels are not hard coded.
function compareOutput(gateRow, table) {
    for (var i = 0; i < table.length; i++) {
        if (gateRow[0]['a'] == table[i][0]['a'] && gateRow[1]["b"] == table[i][1]["b"] && gateRow[2]["c"] == table[i][2]["c"]) {
            return gateRow[3] == table[i][3];
        }
    }
}

function truth(set, truths, reverse) {
	var w = {};
	
	set.forEach(v=>w[v]=(truths.indexOf(v)>=0 ? true : false)^reverse);
	
	return w;
}

function reduceToCombinations(arr) {
	var i=1
		,lastEl;

	arr = arr.map(v=>{return v.split('').sort().join('')}).sort();
	
	lastEl = arr[0];
	while(i<arr.length) {
		if(arr[i] == lastEl) {
			arr.splice(i,1);
		} else {
			lastEl = arr[i];
			i++;
		}
	}
	
	arr = arr.map(v=>{return v.split('')});
	
	return arr;
}

function permut(arr, c) {
	var buf = []
		,len
		,arrSlice
		,permArr
		,proArr;
	if(c<=1) {
		return arr;
	} else {
		len = arr.length;
		for(var i=0;i<len;i++) {
			arrSlice = arr.slice(0,i).concat(arr.slice(i+1));
			permArr = permut(arrSlice,c-1);
			proArr = [];
			for(var y=0; y<permArr.length; y++) {
				proArr.push([arr[i]].concat(permArr[y]).join(''));
			}
			buf.push(...proArr);
		}
	}
	return buf;
}

function checkGates(nodeList) {
    var led = null
    var i = 0; 

    var outArray = [];

    nodeList = new Set(connectionCheckForGrade(nodeList));
    while (i < 5) {
        nodeList.forEach(function (element) {
            if(element.piece instanceof LEDout){
                //element.piece.getOutput();
                led = element;
            }
            element.getInput();
            element.piece.getOutput();
        });
        i++;
    }

    nodeList.forEach(function(element) {
        if (element.piece instanceof LEDout) {
            outArray.push(element.piece.output);
        }
    });

    return outArray;

}

function connectionCheckForGrade(nodeList){
    nodeList.forEach(function(element1){
        if(element1.piece instanceof LEDout){ // LEDout class does not have outputLocations
            return;
        }
        nodeList.forEach(function(element2){
            //breaking connections
            //check if parent and if not on the input, then break
            var isParent = false;
            var parent_input_idx = 0
            for(let i=0;i<element2.parent.length;i++){
                if(Object.is(element1,element2.parent[i][0]) == true){
                    isParent=true;
                    parent_input_idx = element2.parent[i][1]
                    break;
                }
            };
            if
                ((isParent) && ((element1.piece.outputLocations[0] != element2.piece.inputLocations[parent_input_idx][0]) ||
                    (element1.piece.outputLocations[1] != element2.piece.inputLocations[parent_input_idx][1])) &&
                (element2.piece.inputLocations[parent_input_idx][2] == true)) {
                element2.piece.inputLocations[parent_input_idx][2] = false
                breakConn(element1, element2)
                return;
            }
            //making connections
            //check if on each other, then connect
            for(let i=0;i<element2.piece.inputLocations.length;i++){
                if((element1.piece.outputLocations[0]==element2.piece.inputLocations[i][0]) &&
                    (element1.piece.outputLocations[1]==element2.piece.inputLocations[i][1]) &&
                    (element2.piece.inputLocations[i][2]==false)){
                    element2.piece.inputLocations[i][2]=true;
                    newConn(element1,element2,i);
                }
            }
        });
    });
    return nodeList;
}

function newConn(parentNode, childNode,input_idx) {
    childNode.parent.push([parentNode,input_idx]);
}
function breakConn(parentNode, childNode) {
    for(let i=0;i<childNode.parent.length;i++){
        if(Object.is(childNode.parent[i][0],parentNode)){
            childNode.parent.splice(i,1);
            break;
        }
    }

}

