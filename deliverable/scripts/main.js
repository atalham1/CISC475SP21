"use strict";

// Maybe Need to implement timer funciton

//Set of all nodes on the grid
var nodes = new Set();

/*
    Set of all wires added to the grid

    Since wires are barely implemented, this may not be the best
    way to deal with them. Maybe put them in 'nodes' set
*/
var wires = new Set();

//tmp to hold current selected gate
var tmp_gate = null;
var touch = false;
var interval;


/*
    Used to hold id of button clicked

    This is handled at the bottom event listner
    In order to click on gate and place several new gates of the 
    same type, you need to make a new instance of the piece.
    Since the new instance is made when the button is pressed, 
    I have put a line in the bottom listener that 'clicks' the button
    with gate_btn_id
*/
var gate_btn_id = null


//boolean for play button
var play_pressed = false;

//boolean for move button
var moving = false;

//boolean for delete button
var deleting = false;

//bool for clearing the board

var clearing =false;

//vars for wire button
var isWire = false;
var tmp_wire = null;
var label = false
var images = [];
var truthTableArray = [];
var totalGateInputs = 0;
var totalGateOutputs = 0;

var totalTableInputs = 0;
var totalTableOutputs = 0;

/*
   PLAY FUNCTION
   Cycle through all gates; Reset inputs and outputs to default

   Cycle through all gates; get inputs for each gates
   Cycle through all gates; get outputs for all gates

   repeat previous 2 steps to keep circiut going continuously

    OUR CURRENT VERSION
        we do not have it running continuously.

        The 'led' variable is for testing:
            --add 1 led to the grid and its output will be printed
              to the console.
        
        The while loop is what determines how many times the loop runs
        This is what needs to be made continuous
*/
function play() {
    var led = null
    var i = 0;
    nodes.forEach(function(element){
        element.piece.reset()
    })
    wires.forEach(function(element){
        element.reset()
    })
    connectionCheck();
    while (i < 5) {
        nodes.forEach(function (element) {
            if(element.piece instanceof LEDout){
                //element.piece.getOutput();
                led = element;
            }
            element.getInput();
            element.piece.getOutput();
        });
		wires.forEach(function(element){
			element.reset()
		});
		wires.forEach(function (element) {
			if(element.playTurn == 0) {
				element.getInput();
			}
		});
        i++;
    }
    
    console.log(nodes);
    drawGates();

    if(led != null){
        console.log(led.piece.output);
    }
}

function stop() {
    nodes.forEach(function(element){
        element.piece.reset()
        element.piece.img_path = element.piece.img_default;
    });
    wires.forEach(function(element) {
        element.reset();
    });
    drawGates();
}

// MAKING & BREAKING CONNECTIONS
/*
   New connection adds parent to the list of parents for the child

   Break connection removes the parent from the child's parent list

*/
function newConnection(parentNode, childNode,input_idx) {
    childNode.parent.push([parentNode,input_idx]);
}
function breakConnections(parentNode, childNode) {
    for(let i=0;i<childNode.parent.length;i++){
        if(Object.is(childNode.parent[i][0],parentNode)){
            childNode.parent.splice(i,1);
            break;
        }
    }

}


/*
    Only works for gates not wires

    2 for loops comparing every element to each other.
    Checking for breaks:
        If element1 is a parent of element2, and its output location
        is not in the location of element2's inputLocation[parent_input_idx],
        break the connection and set element2 inputLocation[parent_input_idx][2]
        to false

        what is parent_input_idx: The index of the child's input attribute

    Checking for connects:
        If element1 is on element2 input location and that location boolean is false,
        new connection and set boolean to true
*/
function connectionCheck(){
    nodes.forEach(function(element1){
        if(element1.piece instanceof LEDout){ // LEDout class does not have outputLocations
            return;
        }
        nodes.forEach(function(element2){
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
                breakConnections(element1, element2)
                return;
            }
            //making connections
            //check if on each other, then connect
            for(let i=0;i<element2.piece.inputLocations.length;i++){
                if((element1.piece.outputLocations[0]==element2.piece.inputLocations[i][0]) &&
                    (element1.piece.outputLocations[1]==element2.piece.inputLocations[i][1]) &&
                    (element2.piece.inputLocations[i][2]==false)){
                    element2.piece.inputLocations[i][2]=true;
                    newConnection(element1,element2,i);
                }
            }
        });
    });
	
	// remove all wire parents
	nodes.forEach(function(element1){
		for(let i=0; i<element1.parent.length; i++) {
			if (element1.parent[i][0] instanceof Wire) {
				element1.parent.splice(i,1);
				i--;
			}
		}
	})
	
	wires.forEach(function(wireElement){
		//breaking connections
		wireElement.connectedWires = new Set();
		wireElement.connectedOutputs = new Set();
		wireElement.connectedInputs = new Set();
	});
	
	wires.forEach(function(wireElement){
		
		//making connections
		var wirePoint1X = wireElement.left[0];
		var wirePoint1Y = wireElement.left[1];
		var wirePoint2X = wireElement.right[0];
		var wirePoint2Y = wireElement.right[1];
		
		//connections with Wires
		wires.forEach(function(wireComp) {
			if (Object.is(wireElement,wireComp)== true){
				
			} else if(wireElement.connectedWires.has(wireComp)) {
				
			} else {
			
				var wireCompPoint1X = wireComp.left[0];
				var wireCompPoint1Y = wireComp.left[1];
				var wireCompPoint2X = wireComp.right[0];
				var wireCompPoint2Y = wireComp.right[1];
				
				if ((wirePoint1X==wireCompPoint1X && wirePoint1Y==wireCompPoint1Y) ||
						(wirePoint1X==wireCompPoint2X && wirePoint1Y==wireCompPoint2Y) ||
						(wirePoint2X==wireCompPoint1X && wirePoint2Y==wireCompPoint1Y) ||
						(wirePoint2X==wireCompPoint2X && wirePoint2Y==wireCompPoint2Y)) {
							
							wireElement.connectedWires.add(wireComp);
							wireComp.connectedWires.add(wireElement);
						}
			}
		});
		
		//connections with Nodes
		nodes.forEach(function(element1){
            if(element1.piece instanceof LEDout){ // LEDout class does not have outputLocations
                return;
            }
			// input
			if (element1.piece.input==null){
				
			} else {
				for(let i=0; i<element1.piece.input.length; i++) {
					var element1InputX = element1.piece.inputLocations[i][0];
					var element1InputY = element1.piece.inputLocations[i][1];
					if ((wirePoint1X==element1InputX && wirePoint1Y==element1InputY) ||
						(wirePoint2X==element1InputX && wirePoint2Y==element1InputY)) {
							wireElement.connectedInputs.add([element1,i]);
							element1.parent.push([wireElement,i]);
						}
				}
			}
			// output
			var element1OutputX = element1.piece.outputLocations[0];
			var element1OutputY = element1.piece.outputLocations[1];
			if ((wirePoint1X==element1OutputX && wirePoint1Y==element1OutputY) ||
					(wirePoint2X==element1OutputX && wirePoint2Y==element1OutputY)) {
						wireElement.connectedOutputs.add(element1);
					}
		});
	});
}

/*Saving and reading

  Save works: Writes nodes to JSON string. Works with circular reference.

  Load not fully working:
    Need to JSON.parse then cast each element of 'nodes' set back to 
    a CircuitNode and each piece in the nodes to
    the correct type of gate (AndGate, OrGate, etc)

    CHANGING THE NAME WITH giveName() function will cause error.
        You are not able to parse the name field if it's changed.

  Will eventually need to implement html box to ask for 
    file name and location for saving/loading like a normal 
    website.


*/


function download(data, filename, type) {
    var file = new Blob([data], {type: type});
    if (window.navigator.msSaveOrOpenBlob) // IE10+
        window.navigator.msSaveOrOpenBlob(file, filename);
    else { // Others
        var a = document.createElement("a"),
                url = URL.createObjectURL(file);
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(function() {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);  
        }, 0); 
    }
}

//not fully working
function loadFile(file_name) {
    var string_to_load = fs.readFileSync(file_name, 'utf-8');
    var myarr = JSON.parse(string_to_load);
    nodes = new Set(myarr);
    
}

/*
    We only draw gates on the HTML canvas element with id = gates

    Draw Gates: also draws wires,
        should be used to draw everything

    clear canvas, draw each gate in new location, draw each wire

    drawImage() width and height:
        you must not change these parameters. They are specific to the original image size
        and specific to the spacing of the grid lines.

        width: element.img.width/10
        height: element.img.hight/10


*/
function drawGates() {
    var c = document.getElementById("gates")
    var ctx = c.getContext("2d")
    ctx.font = "25px serif";
    ctx.textBaseline = 'middle'; //Set the vertical alignment of the text
    ctx.textAlign = 'center';//Set the horizontal alignment of the text

    //We clear the canvas to prevent a trail of gates from being
    //drawn when we drag a gate across the screen
    var canvas = document.getElementById("canvas");

    var elements = document.getElementsByClassName('divs');
    for (var i = elements.length - 1; i >= 0; i--) {
        elements[i].parentNode.removeChild(elements[i]);
    }

    var img = document.createElement("img");//Create picture
    img.src = "images/icon.png";
    img.className = 'divs'
    img.style.width = '20px'
    img.style.height = '20px';

    ctx.clearRect(0,0,2000,2000)
    nodes.forEach(function (element) {
        if (element.piece.label) {
            img.addEventListener('click', () => {
                var name = prompt("Input text:", element.piece.label);
                element.piece.label = name
                drawGates()
            });
            //ctx.fillStyle = "#e5ffeaa8";
            //ctx.fillRect(element.piece.xpos, element.piece.ypos, element.piece.label.length * 30, 70);
            ctx.fillStyle = "#000000";
            ctx.fillText(element.piece.label, element.piece.xpos + (element.piece.label.length * 30 / 2), element.piece.ypos + 40)
            img.style.left = element.piece.xpos + 5 + 'px'
            img.style.top = element.piece.ypos + 25 + 'px'
            canvas.append(img)
        } else {
            ctx.drawImage(images.find(t=>t.img_path === element.piece.img_path).img,element.piece.xpos,element.piece.ypos,element.img.width/10,element.img.height/10)
            
        }
    });


    ctx.beginPath();
    ctx.restore()
    wires.forEach(function(element){
		ctx.beginPath();
		ctx.strokeStyle='#000000';
		if (element.output == 1) {
			ctx.strokeStyle='#FF0000';
		}   
        ctx.moveTo(element.left[0], element.left[1]);
        ctx.arc(element.left[0], element.left[1], 5, 0, 2*Math.PI)
        ctx.arc(element.right[0], element.right[1], 5, -Math.PI,Math.PI)
        ctx.stroke();
    })
}




/*  
    Check if position of mouse (x,y) is within the bounds of the image
    return the image clicked on.
*/
function checkClick(x,y){
    var tmp = null
    nodes.forEach(function (element) {
        if (tmp) { return null }
        if (element.piece.label) {
            if ((x > element.piece.xpos && (x - element.piece.xpos <= element.piece.width + 100)) && (y > element.piece.ypos && (y - element.piece.ypos <= element.piece.height / 2))) {
                tmp = element;
            }
        } else {
            if ((x > element.piece.xpos) && (x < element.piece.xpos + (element.img.width / 10)) &&
                (y > element.piece.ypos) && (y < element.piece.ypos + (element.img.height / 10))) {
                tmp = element;
            }
        }
    });
    wires.forEach(function (element) {

        let maps = {
            1: ((element.left[0] - x) <= 10 && (element.left[0] - x) >= 0) && ((element.left[1] - y) <= 10 && (element.left[1] - y) >= 0),
            2: ((element.right[0] - x) <= 10 && (element.right[0] - x) >= 0) && ((element.right[1] - y) <= 10 && (element.right[1] - y) >= 0)
        }
        element['maps'] = maps
        if (tmp) { return null }
        if (maps[1] || maps[2]) {
            element['touch'] = false
            tmp = element
        } else {

            let ismode = {
                1: (x > element.left[0] && x - element.left[0] >= 0) && (x < element.right[0] && element.right[0] - x >= 0),
                // 2: y + 30 >= element.left[1] && y <= element.right[1] && element.right[1] - y >= 40
                2: true
            }
            // && (() && element.right[0] < y
            if (ismode[1] && ismode[2]) {
                element['touch'] = true
                tmp = element
            }
        }
    })
    return tmp;
}

function Set_toJSON(key, value) {
    if (typeof value === 'object' && value instanceof Set) {
      return [...value];
    }
    return value;
  }


/*
    EVENT LISTENERS

    Button listeners:
        Each button does something when pressed.
        Will need to add listeners with the same format for each new button.

        Clicking a circuit piece button like "And Gate" sets tmp_gate to
        a new instance of that gate.

    Mouse click listeners:
        The final listener at the bottom is for clicking in the canvas (grid)
        See more detailed comments down there

*/
//clear button
document.getElementById("clear").addEventListener("click", function() {
    nodes.clear();
    wires.clear();
    drawGates();
    document.getElementById('desc2').textContent = "Click a gate to clear all.";
});
//Control buttons
document.getElementById("save_btn").addEventListener("click", function() {
    console.log(nodes);
    var json = JSON.stringify(nodes, Set_toJSON);
    download(json, "test.json", "json");
});
document.getElementById("load_btn").addEventListener("click", function() {
    document.getElementById('desc1').textContent = "Circuit is currently: STOPPED.";
    play_pressed = false;
    var files = document.getElementById('selectFiles').files;
    console.log(files);
    if (files.length <= 0) {
      return false;
    }
  
    var fr = new FileReader();
    
  
    fr.onload = function(e) { 
        console.log(e);
        var result = JSON.parse(e.target.result);
        var formatted = JSON.stringify(result, null, 2);
        var setFormat = new Set();
        console.log(result);
        result.forEach(function( element) {
            var piece;

            switch(element.piece.type) {
                case "andGate":
                    piece = new AndGate();
                    break;
                case "label":
                    piece = new Labels();
                    break;
                case "nandGate":
                    piece = new NandGate();
                    break;
                case "orGate":
                    piece = new OrGate();
                    break;
                case "xorGate":
                    piece = new XorGate();
                    break;
                case "norGate":
                    piece = new NorGate();
                    break;
                case "xnorGate":
                    piece = new XnorGate();
                    break;
                case "notGate":
                    piece = new NotGate();
                    break;
                case "fiveAndGate":
                    piece = new FiveAndGate();
                    break;
                case "fiveOrGate":
                    piece = new FiveOrGate();
                    break;
                case "posInput":
                    piece = new PositiveIn();
                    break;
                case "negInput":
                    piece = new NegativeIn();
                    break;
                case "ledOut":
                    piece = new LEDout();
                    break;
                case "button":
                    piece = new Button();
                    break;
                case "switch":
                    piece = new Switch();
                    break;
                default:
                    break;
            } 

            var x = Object.assign(piece, element.piece);
            element.piece = x;

            var circNode = new CircuitNode(element.piece);
            circNode.parent = element.parent;

            setFormat.add(circNode);
        });
        nodes = setFormat;
        stop();
        drawGates();  
    }
  
    fr.readAsText(files.item(0));
});
document.getElementById("play_btn").addEventListener("click", function() {
    document.getElementById('desc1').textContent = "Circuit is currently: PLAYING.";
    play_pressed = true;
    play();
});
document.getElementById("stop_btn").addEventListener("click", function() {
    document.getElementById('desc1').textContent = "Circuit is currently: STOPPED.";
    play_pressed = false;
    stop();
    
});
document.getElementById("checkBtn").addEventListener("click", function() {
    console.log(nodes);
    console.log(truthTableArray);
    checkNodeInputsAndOutputs();


});

function checkNodeInputsAndOutputs() {
    nodes.forEach(function (element) {
        if(element.piece instanceof PositiveIn || element.piece instanceof NegativeIn){
            totalGateInputs += 1;

        }
        if(element.piece instanceof LEDout){
            totalGateOutputs += 1;

        }
    });
    console.log("gate inputs: " + totalGateInputs);
    console.log("gate outputs: " + totalGateOutputs);

    truthTableArray[0].forEach(function (header) {
        if (header == header.toUpperCase()) {
            totalTableOutputs += 1;
        }
        else if (header == header.toLowerCase()) {
            totalTableInputs += 1;
        }
    });
    console.log("table inputs: " + totalTableInputs);
    console.log("table outputs: " + totalTableOutputs);

    createGradedArray();

};

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

    //console.log(inputArray);
    //console.log(test);
    var len = test.length
    ,trueSet		
    ,trues = []
    ,falses = []
    ,splitBy = Math.round(len/2);
    
    var loopSize = Math.pow(2, inputArray.size);

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
    console.log(endArray);
    console.log(truthTableArray);

    compareGateAndTable(endArray)



}

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

    console.log(gateOutput);
    console.log(tableCompareArray);
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

function compareOutput(gateRow, table) {
    var checkArray = [];
    for (var i = 0; i < table.length; i++) {
        if (gateRow[0]["a"] == table[i][0]["a"] && gateRow[1]["b"] == table[i][1]["b"] && gateRow[2]["c"] == table[i][2]["c"]) {
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
                breakConnections(element1, element2)
                return;
            }
            //making connections
            //check if on each other, then connect
            for(let i=0;i<element2.piece.inputLocations.length;i++){
                if((element1.piece.outputLocations[0]==element2.piece.inputLocations[i][0]) &&
                    (element1.piece.outputLocations[1]==element2.piece.inputLocations[i][1]) &&
                    (element2.piece.inputLocations[i][2]==false)){
                    element2.piece.inputLocations[i][2]=true;
                    newConnection(element1,element2,i);
                }
            }
        });
    });
    return nodeList;
}

/*
PAUSE BUTTON NOT IMPLEMENTED

document.getElementById("pause_btn").addEventListener("click", function() {
    play_pressed = false
    document.getElementById('desc1').textContent = "Circuit is currently: STOPPED.";
});
*/
var fileupload = $("#truthTableFiles");
fileupload.on('change', function(){
    var files = document.getElementById('truthTableFiles').files;
    var reader = new FileReader();
    reader.onload = function(e) {
        var CSVARRAY = parseResult(e.target.result); //this is where the csv array will be
        truthTableArray = CSVARRAY;
        createTable(CSVARRAY);

    };  
    reader.readAsText(files.item(0));
})

function parseResult(result) {
    var resultArray = [];
    result.split("\n").forEach(function(row) {
        var rowArray = [];
        row.split(",").forEach(function(cell) {
            rowArray.push(cell);
        });
        resultArray.push(rowArray);
    });
    return resultArray;
}

function createTable(arr) {
    var content = "";
    arr.forEach(function(row, j) {
        content += "<tr>";
        for (let i = 0; i < row.length; i++) {
            if (j == 0) {
                content += "<th>" + row[i] + "</th>" ;
            }
            else {
                content += "<td>" + row[i] + "</td>" ;
            }
        };
        content += "</tr>";
    });
    document.getElementById("truthTable").innerHTML = content;
}

// Delete button
document.getElementById("delete").addEventListener("click", function() {
    deleting = true;
    moving = false;
	isWire = false;
    label = false
    document.getElementById('desc2').textContent = "Click a gate to delete it.";
});
//Move button
document.getElementById("move").addEventListener("click", function() {
    deleting = false;
	isWire = false;
    moving = true;
    label = false
    document.getElementById('desc2').textContent = "Click a gate to drag around.";
});
//Wire button
document.getElementById("wire").addEventListener("click", function() {
    isWire = true;
	deleting = false;
	moving = false;
	tmp_gate= null;
    label = false
    document.getElementById('desc2').textContent = "Click a gate to drag around.";
});

//Label Buttons
document.getElementById("Label-gate").addEventListener("click", function () {
    gate_btn_id = "Label-gate"
    deleting = false;
    clearing = false;
    moving = false;
    isWire = false;
    label = true;
    document.getElementById('desc2').textContent = "Click to add Label.";
});

//Gate Buttons
document.getElementById("and-gate").addEventListener("click", function() {
    tmp_gate = new CircuitNode(new AndGate());
    gate_btn_id = "and-gate"
    deleting = false;
    moving = false;
	isWire = false;
    label = false
	document.getElementById('desc2').textContent =  "Click to add AND Gate.";
});
document.getElementById("or-gate").addEventListener("click", function() {
    tmp_gate = new CircuitNode(new OrGate());
    gate_btn_id = "or-gate"
    deleting = false;
    moving = false;
    isWire = false;
    label = false
	document.getElementById('desc2').textContent = "Click to add OR Gate.";
});
document.getElementById("not-gate").addEventListener("click", function() {
    tmp_gate = new CircuitNode(new NotGate());
    gate_btn_id = "not-gate"
    deleting = false;
    moving = false;
	isWire = false;
    label = false
	document.getElementById('desc2').textContent = "Click to add NOR Gate.";
});
document.getElementById("nand-gate").addEventListener("click", function() {
    tmp_gate = new CircuitNode(new NandGate());
    gate_btn_id = "nand-gate"
    moving = false;
    clearing = false;
    isWire = false;
    label = false
	document.getElementById('desc2').textContent = "Click to add NAND Gate.";
});
document.getElementById("nor-gate").addEventListener("click", function() {
    tmp_gate = new CircuitNode(new NorGate());
    gate_btn_id = "nor-gate"
    deleting = false;
    clearing = false;
    moving = false;
	isWire = false;
    label = false
	document.getElementById('desc2').textContent = "Click to add NOR Gate.";
});
document.getElementById("xnor-gate").addEventListener("click", function() {
    tmp_gate = new CircuitNode(new XnorGate());
    gate_btn_id = "xnor-gate"
    moving = false;
    clearing = false;
    isWire = false;
    label = false
	document.getElementById('desc2').textContent = "Click to add XNOR Gate.";
});
document.getElementById("xor-gate").addEventListener("click", function() {
    tmp_gate = new CircuitNode(new XorGate());
    gate_btn_id = "xor-gate"
    deleting = false;
    moving = false;
    isWire = false;
    label = false
	document.getElementById('desc2').textContent = "Click to add XOR Gate.";
});
document.getElementById("out-led").addEventListener("click", function() {
    tmp_gate = new CircuitNode(new LEDout());
    gate_btn_id = "out-led"
    moving = false;
	isWire = false;
    label = false
	document.getElementById('desc2').textContent = "Click to add LED Output.";
});
document.getElementById("positive-input").addEventListener("click", function() {
    tmp_gate = new CircuitNode(new PositiveIn());
    gate_btn_id = "positive-input"
    deleting = false;
    moving = false;
    isWire = false;
    label = false
	document.getElementById('desc2').textContent = "Click to add Positive Input.";
});
document.getElementById("zero-input").addEventListener("click", function() {
    tmp_gate = new CircuitNode(new NegativeIn());
    gate_btn_id = "zero-input"
    deleting = false;
    moving = false;
	isWire = false;
    label = false
	document.getElementById('desc2').textContent = "Click to add Zero Input.";
});
document.getElementById("switch").addEventListener("click", function() {
    tmp_gate = new CircuitNode(new Switch());
    gate_btn_id = "switch"
    deleting = false;
    moving = false;
	isWire = false;
    label = false
	document.getElementById('desc2').textContent = "Click to add Switch.";
});
/*
    Clicking the grid: (holding the mouse down)

    First get the correct mouse position. Must be how its is here to
    make the pieces line up on the grid.

    Deleting: obvious
        Remove the node from the set of nodes 'nodes'

    Moving:
        first check where clicking to set which gate will be moving
        drag the gate to activate mousemove listener.
        mousemove listener calls local moveTo() function
            moveTo()
                This sets the new x,y of piece, checks connection, draws gates

        upon mouseup, remove the mousemove listener

    Wire: (almost same as moving)
        Click and drag to draw wire
        Can't delete wire
        Can't move wire after mouseup
        Add wire to set of wires

    If placing a piece: (not doing any of the above)
        upon clicking the grid:
            the piece position is set 
            the piece added to the set of nodes

    As you can see, we are constantly calling play();
    This is to simulate the live circuit while moving and deleting pieces
    On the real site, you can press 'play' button and move gates and still
    see how the live current behaves.



*/
document.getElementById("gates").addEventListener("mousedown", function (e) {
    var x = (e.offsetX) - (e.offsetX % 10);
    var y = (e.offsetY) - (e.offsetY % 10);
    if (label == true) {
        var name = prompt("Enter Label Text:"); //Assign the entered content to the variable name 
        if (name) {
            tmp_gate = new CircuitNodeView(new Labels(name));
            document.getElementById(gate_btn_id).click(); //used to make new gate instance
            tmp_gate.piece.setLocation(x, y);
            nodes.add(tmp_gate);
        };
    } else {
        if (deleting) {
            tmp_gate = checkClick(x, y)
            if (tmp_gate != null) {
                nodes.delete(tmp_gate);
                wires.delete(tmp_gate);
                tmp_gate = null;
            }
            if (play_pressed) {
                play();
            }
		} else if (play_pressed && checkClick(x, y) != null && checkClick(x, y).piece instanceof Switch) {
			tmp_gate = checkClick(x, y);
			var tmp_gate_switch = checkClick(x, y).piece;
			tmp_gate_switch.toggle();
			play();
        } else if (moving) {
            tmp_gate = checkClick(x, y);
            if (tmp_gate != null) {
                var moveTo
                if (tmp_gate.left) {
                    if (tmp_gate['touch']) {
                        console.log(tmp_gate)

                        moveTo = function (e) {
                            let left0 = tmp_gate.left[0]
                            x = (e.offsetX) - (e.offsetX % 10);
                            y = (e.offsetY) - (e.offsetY % 10);
                            let xx = left0 >= x ? left0 - x : x - left0
                            let xy = left0 >= x ? tmp_gate.right[0] - xx : tmp_gate.right[0] + xx
                            let values = tmp_gate.rights - tmp_gate.lefts
                            let righty = y > tmp_gate.right[1] ? y - values : y + values
                            tmp_gate.setLeft(x, y);
                            tmp_gate.setRight(xy, righty);
                            if (play_pressed) {
                                play();
                            };
							drawGates();
                        };
                    } else {
                        moveTo = function (e) {
                            if (tmp_gate['maps'][1]) {
                                x = (e.offsetX) - (e.offsetX % 10);
                                y = (e.offsetY) - (e.offsetY % 10);
                                tmp_gate.setLeft(x, y);
                            } else {
                                x = (e.offsetX) - (e.offsetX % 10);
                                y = (e.offsetY) - (e.offsetY % 10);
                                tmp_gate.setRight(x, y);
                            }
                            //connectionCheck();
                            if (play_pressed) {
                                play();
                            };
							drawGates();
                        };
                    }

                } else {
                    //fucntion to be used by listeners
                    moveTo = function (e) {
                        x = (e.offsetX) - (e.offsetX % 10);
                        y = (e.offsetY) - (e.offsetY % 10);
                        tmp_gate.piece.setLocation(x, y);
                        //connectionCheck();
                        if (play_pressed) {
                            play();
                        };
						drawGates();
                    };
                }

                document.getElementById("gates").addEventListener("mousemove", moveTo);
                document.getElementById("gates").addEventListener("mouseup", function () {
                    //console.log(99999)
                    //console.log(tmp_gate)
                    document.getElementById("gates").removeEventListener("mousemove", moveTo);
                });
            }
        } else if (tmp_gate) {
            document.getElementById(gate_btn_id).click(); //used to make new gate instance
            tmp_gate.piece.setLocation(x, y);
            nodes.add(tmp_gate);
            if (play_pressed) {
                play();
            }
        } else if (isWire) {
            tmp_wire = new Wire();
            tmp_wire.setLeft(x, y);
            tmp_wire.setRight(x, y);
            tmp_wire['leftwidhts'] = x
            tmp_wire['lefts'] = y
            var moveTo = function (e) {
                x = (e.offsetX) - (e.offsetX % 10);
                y = (e.offsetY) - (e.offsetY % 10);
                tmp_wire['rightwidhts'] = x
                tmp_wire['rights'] = y
                tmp_wire.setRight(x, y);
                if (play_pressed) {
                    play();
                } 
				drawGates();
            }

            document.getElementById("gates").addEventListener("mousemove", moveTo);
            document.getElementById("gates").addEventListener("mouseup", function () {
                document.getElementById("gates").removeEventListener("mousemove", moveTo)
            });

            wires.add(tmp_wire);
        }

    }

    connectionCheck();
    drawGates();
});

$(document).ready(function() {

    var arr = ['images/7x6_positive_on.png', 'images/7x6_positive.png', 'images/7x6_LED_on.png', 'images/7x6_LED.png', 'images/7x6_zero.png', 'images/10x6_and_on_bot.png'
    , 'images/10x6_and_on_both.png', 'images/10x6_and_on_top.png', 'images/10x6_and.png', 'images/10x6_not_off.png', 'images/10x6_not_on.png', 'images/10x6_not.png'
    , 'images/10x6_or_on_bot.png', 'images/10x6_or_on_both.png', 'images/10x6_or_on_top.png', 'images/10x6_or.png', 'images/10x6_xor_on_bot.png', 'images/10x6_xor_on_both.png'
    , 'images/10x6_xor_on_top.png', 'images/10x6_xor.png', 'images/11x6_nand_on_bot.png', 'images/11x6_nand_on_both.png', 'images/11x6_nand_on_top.png', 'images/11x6_nand_off.png'
    , 'images/11x6_nand.png', 'images/11x6_nor_on_bot.png', 'images/11x6_nor_on_both.png', 'images/11x6_nor_on_top.png', 'images/11x6_nor.png', 'images/11x6_nor_off.png'
    , 'images/11x6_xnor_on_bot.png', 'images/11x6_xnor_on_both.png', 'images/11x6_xnor_on_top.png', 'images/11x6_xnor_off.png', 'images/11x6_xnor.png', 'images/switch-close-0-0.png'
    , 'images/switch-close-1-1.png', 'images/switch-open-0-0.png', 'images/switch-open-0-1.png', 'images/switch-open-1-0.png', 'images/switch-open-1-1.png'];

    var loader = loadImages(arr, function() {
        console.log(images);
    });
});

function loadImages(arr, callback) {
    var loadedImageCount = 0;

    // Make sure arr is actually an array and any other error checking
    for (var i = 0; i < arr.length; i++){
        var img = new Image();
        img.onload = imageLoaded;
        img.src = arr[i];
        var toAdd = {"img": img, "img_path": arr[i]}
        images.push(toAdd);
    }

    function imageLoaded(e) {
        loadedImageCount++;
        if (loadedImageCount >= arr.length) {
            callback();
        }
    }
}
