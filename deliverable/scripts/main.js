// "use strict";

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
var touch = false

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

//vars for wire button
var isWire = false;
var tmp_wire = null;

var label = false
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
    nodes.forEach(function (element) {
        element.piece.reset()
    })
    while (i < 2) {
        nodes.forEach(function (element) {
            if (element.piece instanceof LEDout) {
                led = element
            }
            element.getInput();
        });
        nodes.forEach(function (element) {
            element.piece.getOutput();
        });
        i++;
    }
    if (led != null) {
        console.log(led.piece.output)
    }
}

// MAKING & BREAKING CONNECTIONS
/*
   New connection adds parent to the list of parents for the child

   Break connection removes the parent from the child's parent list

*/
function newConnection(parentNode, childNode, input_idx) {
    childNode.parent.push([parentNode, input_idx]);
}
function breakConnections(parentNode, childNode) {
    for (let i = 0; i < childNode.parent.length; i++) {
        if (Object.is(childNode.parent[i][0], parentNode)) {
            childNode.parent.splice(i, 1);
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
function connectionCheck() {
    nodes.forEach(function (element1) {
        if (element1.piece instanceof LEDout) { // LEDout class does not have outputLocations
            return;
        }
        nodes.forEach(function (element2) {
            //breaking connections
            //check if parent and if not on the input, then break
            var isParent = false;
            var parent_input_idx = 0
            for (let i = 0; i < element2.parent.length; i++) {
                if (Object.is(element1, element2.parent[i][0]) == true) {
                    isParent = true;
                    parent_input_idx = element2.parent[i][1]
                    break;
                }

            }
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
            for (let i = 0; i < element2.piece.inputLocations.length; i++) {
                if ((element1.piece.outputLocations[0] == element2.piece.inputLocations[i][0]) &&
                    (element1.piece.outputLocations[1] == element2.piece.inputLocations[i][1]) &&
                    (element2.piece.inputLocations[i][2] == false)) {
                    element2.piece.inputLocations[i][2] = true;
                    newConnection(element1, element2, i);
                }
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

function saveFile(set_to_save, file_location, file_name) {
    //reset inputs and ouputs value but save parent connections
    set_to_save.forEach(function (element) {
        element.piece.reset();
    });
    var stringify = require('json-stringify-safe');
    var arr = Array.from(set_to_save);
    var savedCircuit = stringify(arr);
    fs.writeFileSync(file_name, savedCircuit);
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
    ctx.font = "30px serif";
    ctx.textBaseline = 'middle'; //设置文本的垂直对齐方式
    ctx.textAlign = 'center';//设置文本的水平对齐方式

    //We clear the canvas to prevent a trail of gates from being
    //drawn when we drag a gate across the screen
    var canvas = document.getElementById("canvas");

    var elements = document.getElementsByClassName('divs');
    for (var i = elements.length - 1; i >= 0; i--) {
        elements[i].parentNode.removeChild(elements[i]);
    }

    var img = document.createElement("img");//创建图片
    img.src = "images/icon.png";
    img.className = 'divs'
    img.style.width = '20px'
    img.style.height = '20px';

    ctx.clearRect(0, 0, 2000, 2000)
    nodes.forEach(function (element) {
        if (element.piece.label) {
            img.addEventListener('click', () => {
                var name = prompt("input table", element.piece.label);
                element.piece.label = name
                drawGates()
            });
            ctx.fillStyle = "#e5ffeaa8";
            ctx.fillRect(element.piece.xpos, element.piece.ypos, element.piece.label.length * 30, 70);
            ctx.fillStyle = "#000000";
            ctx.fillText(element.piece.label, element.piece.xpos + (element.piece.label.length * 30 / 2), element.piece.ypos + 40)
            img.style.left = element.piece.xpos + 5 + 'px'
            img.style.top = element.piece.ypos + 25 + 'px'
            canvas.append(img)
        } else {
            ctx.drawImage(element.img, element.piece.xpos, element.piece.ypos, element.img.width / 10, element.img.height / 10)
        }
    });

    ctx.beginPath();
    ctx.restore();

    wires.forEach(function (element) {
        ctx.moveTo(element.left[0], element.left[1]);
        ctx.arc(element.left[0] - 5, element.left[1], 5, 0, 2 * Math.PI)
        ctx.arc(element.right[0], element.right[1], 5, -Math.PI, Math.PI)
        ctx.stroke();
    })
}

/*  
    Check if position of mouse (x,y) is within the bounds of the image
    return the image clicked on.
*/
function checkClick(x, y) {
    var tmp = null
    nodes.forEach(function (element) {
        if (tmp) { return null }
        if (element.piece.label) {
            if ((x > element.piece.xpos && (x - element.piece.xpos <= element.piece.width + 100)) && (y > element.piece.ypos && (y - element.piece.ypos <= element.piece.height / 2))) {
                tmp = element
            }
        } else {
            if ((x > element.piece.xpos) && (x < element.piece.xpos + (element.img.width / 10)) &&
                (y > element.piece.ypos) && (y < element.piece.ypos + (element.img.height / 10))) {
                tmp = element
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

//Control buttons
document.getElementById("play_btn").addEventListener("click", function () {
    document.getElementById('desc1').textContent = "Circuit is currently: PLAYING.";
    play_pressed = true;
    play();
});
document.getElementById("stop_btn").addEventListener("click", function () {
    play_pressed = false
    document.getElementById('desc1').textContent = "Circuit is currently: STOPPED.";
});
/*
PAUSE BUTTON NOT IMPLEMENTED

document.getElementById("pause_btn").addEventListener("click", function() {
    play_pressed = false
    document.getElementById('desc1').textContent = "Circuit is currently: STOPPED.";
});
*/

// Delete button
document.getElementById("delete").addEventListener("click", function () {
    deleting = true;
    moving = false;
    isWire = false;
    label = false
    document.getElementById('desc2').textContent = "Click a gate to delete it.";
});
//Move button
document.getElementById("move").addEventListener("click", function () {
    deleting = false;
    isWire = false;
    moving = true;
    label = false
    document.getElementById('desc2').textContent = "Click a gate to drag around.";
});
//Wire button
document.getElementById("wire").addEventListener("click", function () {
    isWire = true;
    deleting = false;
    moving = false;
    tmp_gate = null;
    label = false
    document.getElementById('desc2').textContent = "Click a gate to drag around.";
});

//Gate Buttons
document.getElementById("and-gate").addEventListener("click", function () {
    tmp_gate = new CircuitNode(new AndGate());
    gate_btn_id = "and-gate"
    deleting = false;
    moving = false;
    isWire = false;
    label = false
    document.getElementById('desc2').textContent = "Click to add AND Gate.";
});
//Gate Buttons
document.getElementById("label-gate").addEventListener("click", function () {
    gate_btn_id = "label-gate"
    deleting = false;
    moving = false;
    isWire = false;
    label = true
    document.getElementById('desc2').textContent = "Click to add AND Gate.";
});

document.getElementById("or-gate").addEventListener("click", function () {
    tmp_gate = new CircuitNode(new OrGate());
    gate_btn_id = "or-gate"
    deleting = false;
    moving = false;
    isWire = false;
    label = false
    document.getElementById('desc2').textContent = "Click to add OR Gate.";
});
document.getElementById("not-gate").addEventListener("click", function () {
    tmp_gate = new CircuitNode(new NotGate());
    gate_btn_id = "not-gate"
    deleting = false;
    moving = false;
    label = false
    isWire = false;
    document.getElementById('desc2').textContent = "Click to add NOR Gate.";
});
document.getElementById("nand-gate").addEventListener("click", function () {
    tmp_gate = new CircuitNode(new NandGate());
    gate_btn_id = "nand-gate"
    deleting = false;
    moving = false;
    isWire = false;
    document.getElementById('desc2').textContent = "Click to add NAND Gate.";
});
document.getElementById("nor-gate").addEventListener("click", function () {
    tmp_gate = new CircuitNode(new NorGate());
    gate_btn_id = "nor-gate"
    deleting = false;
    moving = false;
    isWire = false;
    label = false
    document.getElementById('desc2').textContent = "Click to add NOR Gate.";
});
document.getElementById("xnor-gate").addEventListener("click", function () {
    tmp_gate = new CircuitNode(new XnorGate());
    gate_btn_id = "xnor-gate"
    moving = false;
    isWire = false;
    document.getElementById('desc2').textContent = "Click to add XNOR Gate.";
});
document.getElementById("xor-gate").addEventListener("click", function () {
    tmp_gate = new CircuitNode(new XorGate());
    gate_btn_id = "xor-gate"
    deleting = false;
    moving = false;
    isWire = false;
    label = false
    document.getElementById('desc2').textContent = "Click to add XOR Gate.";
});
document.getElementById("5-and-gate").addEventListener("click", function () {
    tmp_gate = new CircuitNode(new FiveAndGate());
    gate_btn_id = "5-and-gate"
    moving = false;
    isWire = false;
    label = false
    document.getElementById('desc2').textContent = "Click to add 5-input AND Gate.";
});
document.getElementById("5-or-gate").addEventListener("click", function () {
    tmp_gate = new CircuitNode(new FiveOrGate());
    gate_btn_id = "5-or-gate"
    deleting = false;
    moving = false;
    isWire = false;
    label = false
    document.getElementById('desc2').textContent = "Click to add 5-input OR Gate.";
});
document.getElementById("out-led").addEventListener("click", function () {
    tmp_gate = new CircuitNode(new LEDout());
    gate_btn_id = "out-led"
    moving = false;
    isWire = false;
    label = false
    document.getElementById('desc2').textContent = "Click to add LED Output.";
});
document.getElementById("positive-input").addEventListener("click", function () {
    tmp_gate = new CircuitNode(new PositiveIn());
    gate_btn_id = "positive-input"
    deleting = false;
    moving = false;
    isWire = false;
    label = false
    document.getElementById('desc2').textContent = "Click to add Positive Input.";
});
document.getElementById("zero-input").addEventListener("click", function () {
    tmp_gate = new CircuitNode(new NegativeIn());
    gate_btn_id = "zero-input"
    deleting = false;
    moving = false;
    isWire = false;
    label = false
    document.getElementById('desc2').textContent = "Click to add Zero Input.";
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
        var name = prompt("input table"); //将输入的内容赋给变量 name ， 
        if (name) {
            tmp_gate = new CircuitNodeView(new Labels(name));
            document.getElementById(gate_btn_id).click(); //used to make new gate instance
            tmp_gate.piece.setLocation(x, y);
            nodes.add(tmp_gate);
            if (play_pressed) {
                play();
            }
        }
    } else {
        if (deleting) {
            tmp_gate = checkClick(x, y)
            if (tmp_gate != null) {
                nodes.delete(tmp_gate)
                wires.delete(tmp_gate)
                tmp_gate = null
            }
            if (play_pressed) {
                play();
            }
        } else if (moving) {

            tmp_gate = checkClick(x, y)
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
                            }
                            drawGates();
                        }
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
                            connectionCheck();
                            if (play_pressed) {
                                play();
                            }
                            drawGates();
                        }
                    }

                } else {
                    //fucntion to be used by listeners
                    moveTo = function (e) {
                        x = (e.offsetX) - (e.offsetX % 10);
                        y = (e.offsetY) - (e.offsetY % 10);
                        tmp_gate.piece.setLocation(x, y);
                        connectionCheck();
                        if (play_pressed) {
                            play();
                        }
                        drawGates();
                    }
                }

                document.getElementById("gates").addEventListener("mousemove", moveTo);
                document.getElementById("gates").addEventListener("mouseup", function () {
                    console.log(99999)
                    console.log(tmp_gate)
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
                document.getElementById("gates").removeEventListener("mousemove", moveTo);
            });

            wires.add(tmp_wire);
        }

    }

    connectionCheck();
    drawGates();
});
