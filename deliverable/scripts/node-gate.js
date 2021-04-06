/*
	This file holds classes for the componenets of the circuit
	and the Node class for storing them in a set
*/

/*
	Node class:
		parent - list of parent nodes and which of the child's inputs they are in
		img - the HTML image element to draw on the canvas
		piece - type of circuit piece (and gate, or gate, positive input, led, etc)
		img.src = the file name of the img to be drawn. 
			Probably redundant

		getInput()
			sets inputs where parents are attached

*/

class CircuitNode {
	constructor(piece) {
		this.parent = []; //each element holds [ parent_Node, input_index of child]
		this.img = new Image();
		this.piece = piece;
		this.img.src = piece.img_path;
	}

	getInput() {
		for (let i = 0; i < this.parent.length; i++) {
			this.piece.input[this.parent[i][1]] = this.parent[i][0].piece.output;
		}
	}
}

class CircuitNodeView {
	constructor(piece) {
		this.parent = []; //each element holds [ parent_Node, input_index of child]
		this.piece = piece;
		this.img = new Image();
		this.img.width = piece.label.length * 30
		this.img.height = 70
	}

	getInput() {
		for (let i = 0; i < this.parent.length; i++) {
			this.piece.input[this.parent[i][1]] = this.parent[i][0].piece.output;
		}
	}
}
/*
	(Looking at it now, an abstract class may not be the way to go)

	Abstract class for circuit pieces (gates, inputs, led, buttons, switches)

	This is mainly set up for gates with 2 inputs and 1 output

	all gates have:
		x, y position
		name: maybe if you get it working with save load

	Other pieces have:
		more or less than 2 input locations (5 input and, positive input)
		more or less than 1 output location (2 pole switch, output led)

		These pieces need thier own 

	Each subclass has its own constructor to set:
		specific input, output locations
		img_path - image specific to that piece


	setLocaion() - CircuitPiece version
		This is set up for [and, or, not] gates
		all other pieces use thier own version

	giveName()
		sets name of the piece- should be used to simulate 'lables' on the real site

*/
class CircuitPiece {
	constructor() {
		this.xpos = 0;
		this.ypos = 0;
		this.name = null;
		this.inputLocations = [[0, 0, false], [0, 0, false]];
		this.ouputLocations = [0, 0];
	}
	setLocation(x, y) {
		this.xpos = x;
		this.ypos = y;
		this.inputLocations[0][0] = x + 10
		this.inputLocations[0][1] = y + 20
		this.inputLocations[1][0] = x + 10
		this.inputLocations[1][1] = y + 40
		this.outputLocations = [x + 90, y + 30];
	}
	giveName(newName) {
		this.name = newName
	}
}

/*
	Subclasses / piece specific classes

	getOutput()
		sets ouput for each piece with its specific logic

	reset()
		sets input and output to default values
		Used in 'play()' function in main.js
		Used in 'saveFile' function in main.js
			You don't want to save the circuit with current in it. 
		
	setLocation()
		sets location of input and output spots specific to each image
		and how they line up on the grid
*/


//AND GATE CLASS
class AndGate extends CircuitPiece {
	constructor() {
		super();
		this.input = [0, 0];
		this.output = 0;
		this.img_path = "images/10x6_and.png";
	}
	getOutput() {
		if (this.input[0] == 1 && this.input[1] == 1) {
			this.output = 1;
		}
		else {
			this.output = 0;
		}
	}
	reset() {
		this.input = [0, 0];
		this.output = 0;
	}
}
//NOR CLASS
class Labels extends CircuitPiece {
	constructor(props) {
		super(props);
		this.input = [0, 0];
		this.output = 1;
		this.label = props
		// this.props = props
	}
	setLocation(x, y) {
		this.xpos = x;
		this.ypos = y;
		this.inputLocations[0][0] = x + 10
		this.inputLocations[0][1] = y + 20
		this.inputLocations[1][0] = x + 10
		this.inputLocations[1][1] = y + 40
		this.outputLocations = [x + 100, y + 30];
		this.width = this.label.length * 30
		this.height = 70
	}
	getOutput() {
		if (this.input[0] == 0 && this.input[1] == 0) {
			this.output = 1;
		}
		else {
			this.output = 0;
		}
	}
	reset() {
		this.input = [0, 0];
		this.output = 1;
	}
}
//NAND GATE CLASS
class NandGate extends CircuitPiece {
	constructor() {
		super();
		this.input = [0, 0];
		this.output = 1;
		this.img_path = "images/11x6_nand.png";
	}

	setLocation(x, y) {
		this.xpos = x;
		this.ypos = y;
		this.inputLocations[0][0] = x + 10
		this.inputLocations[0][1] = y + 20
		this.inputLocations[1][0] = x + 10
		this.inputLocations[1][1] = y + 40
		this.outputLocations = [x + 100, y + 30];
	}
	getOutput() {
		if (this.input[0] == 1 && this.input[1] == 1) {
			this.output = 0;
		}
		else {
			this.output = 1;
		}
	}
	reset() {
		this.input = [0, 0];
		this.output = 1;
	}
}
//OR GATE CLASS
class OrGate extends CircuitPiece {
	constructor() {
		super();
		this.input = [0, 0];
		this.output = 0;
		this.img_path = "images/10x6_or.png";
	}
	getOutput() {
		if (this.input[0] == 1 || this.input[1] == 1) {
			this.output = 1;
		}
		else {
			this.output = 0;
		}
	}
	reset() {
		this.input = [0, 0];
		this.output = 0;
	}
}
//XOR CLASS
class XorGate extends CircuitPiece {
	constructor() {
		super();
		this.input = [0, 0];
		this.output = 0;
		this.img_path = "images/10x6_xor.png";
	}
	getOutput() {
		if (this.input[0] != this.input[1]) {
			this.output = 1;
		}
		else {
			this.output = 0;
		}
	}
	reset() {
		this.input = [0, 0];
		this.output = 0;
	}
}
//NOR CLASS
class NorGate extends CircuitPiece {
	constructor() {
		super();
		this.input = [0, 0];
		this.output = 1;
		this.img_path = "images/11x6_nor.png";
	}
	setLocation(x, y) {
		this.xpos = x;
		this.ypos = y;
		this.inputLocations[0][0] = x + 10
		this.inputLocations[0][1] = y + 20
		this.inputLocations[1][0] = x + 10
		this.inputLocations[1][1] = y + 40
		this.outputLocations = [x + 100, y + 30];
	}
	getOutput() {
		if (this.input[0] == 0 && this.input[1] == 0) {
			this.output = 1;
		}
		else {
			this.output = 0;
		}
	}
	reset() {
		this.input = [0, 0];
		this.output = 1;
	}
}
//XNOR CLASS
class XnorGate extends CircuitPiece {
	constructor() {
		super();
		this.input = [0, 0];
		this.output = 1;
		this.img_path = "images/11x6_xnor.png";
	}
	setLocation(x, y) {
		this.xpos = x;
		this.ypos = y;
		this.inputLocations[0][0] = x + 10
		this.inputLocations[0][1] = y + 20
		this.inputLocations[1][0] = x + 10
		this.inputLocations[1][1] = y + 40
		this.outputLocations = [x + 100, y + 30];
	}
	getOutput() {
		if (this.input[0] == this.input[1]) {
			this.output = 1;
		}
		else {
			this.output = 0;
		}
	}
	reset() {
		this.input = [0, 0];
		this.output = 1;
	}
}
//NOT CLASS
class NotGate extends CircuitPiece {
	constructor() {
		super();
		this.input = [0];
		this.output = 1;
		this.img_path = "images/10x6_not.png";
	}
	setLocation(x, y) {
		this.xpos = x;
		this.ypos = y;
		this.inputLocations[0][0] = x + 10
		this.inputLocations[0][1] = y + 30
		this.outputLocations = [x + 90, y + 30];
	}
	getOutput() {
		if (this.input[0] == 0) {
			this.output = 1;
		}
		else {
			this.output = 0;
		}
	}
	reset() {
		this.input = [0];
		this.output = 1
	}
}
//FIVE AND GATE CLASS
class FiveAndGate extends CircuitPiece {
	constructor() {
		super();
		this.input = [0, 0, 0, 0, 0];
		this.output = 0;
		this.img_path = "images/10x6_5-input-and.png";
		this.inputLocations = [[0, 0, false], [0, 0, false], [0, 0, false], [0, 0, false], [0, 0, false]];
	}
	setLocation(x, y) {
		this.xpos = x;
		this.ypos = y;
		this.inputLocations[0][0] = x + 10
		this.inputLocations[0][1] = y + 10
		this.inputLocations[1][0] = x + 10
		this.inputLocations[1][1] = y + 20
		this.inputLocations[2][0] = x + 10
		this.inputLocations[2][1] = y + 30
		this.inputLocations[3][0] = x + 10
		this.inputLocations[3][1] = y + 40
		this.inputLocations[4][0] = x + 10
		this.inputLocations[4][1] = y + 50
		this.outputLocations = [x + 90, y + 30];
	}
	getOutput() {
		this.output = 1
		for (let i = 0; i < this.input.length; i++) {
			if (this.input[i] == 0) {
				this.output = 0;
				break;
			}
		}
	}
	reset() {
		this.input = [0, 0, 0, 0, 0];
		this.output = 0;
	}
}
//FIVE OR GATE CLASS
class FiveOrGate extends CircuitPiece {
	constructor() {
		super();
		this.input = [0, 0, 0, 0, 0];
		this.output = 0;
		this.img_path = "images/10x6_5-input-or.png";
		this.inputLocations = [[0, 0, false], [0, 0, false], [0, 0, false], [0, 0, false], [0, 0, false]]
	}
	setLocation(x, y) {
		this.xpos = x;
		this.ypos = y;
		this.inputLocations[0][0] = x + 10
		this.inputLocations[0][1] = y + 10
		this.inputLocations[1][0] = x + 10
		this.inputLocations[1][1] = y + 20
		this.inputLocations[2][0] = x + 10
		this.inputLocations[2][1] = y + 30
		this.inputLocations[3][0] = x + 10
		this.inputLocations[3][1] = y + 40
		this.inputLocations[4][0] = x + 10
		this.inputLocations[4][1] = y + 50
		this.outputLocations = [x + 90, y + 30];
	}
	getOutput() {
		this.output = 0
		for (let i = 0; i < this.input.length; i++) {
			if (this.input[i] == 1) {
				this.output = 1;
				break;
			}
		}
	}
	reset() {
		this.input = [0, 0, 0, 0, 0];
		this.output = 0;
	}
}
//POSITIVE INPUT CLASS
class PositiveIn extends CircuitPiece {
	constructor() {
		super();
		this.input = null;
		this.output = 1;
		this.img_path = "images/7x6_positive.png";
		this.inputLocations = []
	}
	setLocation(x, y) {
		this.xpos = x;
		this.ypos = y;
		this.outputLocations = [x + 60, y + 30];
	}
	//unused but called in main when saving
	getOutput() { }
	reset() { }
}
//NEGATIVE INPUT CLASS
class NegativeIn extends CircuitPiece {
	constructor() {
		super();
		this.input = null;
		this.output = 0;
		this.img_path = "images/7x6_zero.png";
		this.inputLocations = []
	}
	setLocation(x, y) {
		this.xpos = x;
		this.ypos = y;
		this.outputLocations = [x + 60, y + 30];
	}
	//unused but called in main when saving
	getOutput() { }
	reset() { }
}
//LED OUTPUT CLASS
class LEDout extends CircuitPiece {
	constructor() {
		super();
		this.input = [0];
		this.output = 0;
		this.img_path = "images/7x6_LED.png";
		this.inputLocations = [[0, 0, false]];
	}
	setLocation(x, y) {
		this.xpos = x;
		this.ypos = y;
		this.inputLocations = [[x + 10, y + 30, this.inputLocations[0][2]]];
	}
	getOutput() {
		this.output = this.input[0];
	}
	reset() {
		this.input = [0];
		this.output = 0;
	}
}

//NON GATE CLASSES

/*
	These classes / pieces are not implemented.

	So far we have only implementd what you see on the website.

	These classes require a button to be created which changes the
	piece's behavior when pressed.

	We don't have images for these. They usually require 2 images,
		one for when the button is pressed and one for when it's not
	Looking at the real site, the button automatically unpresses with the 
		switch for instance, so there is a need for some kind of timer

	The 2 Pole Switch- is the only thing with 2 output locations. 
*/

//BUTTON CLASS
class Button extends CircuitPiece {
	constructor() {
		super();
		this.pressed = false;
		this.input = [0];
		this.output = 0;
		//still need image
		this.img_path = ""
	}
	getOutput() {
		if (this.pressed && this.input[0] == 1) {
			this.output = 1;
		}
		else {
			this.output = 0;
		}
	}
	reset() {
		this.pressed = false;
		this.input = [0];
		this.output = 0;
	}
}

//NOT IMPLEMENTED
//SWITCH CLASS
class Switch extends CircuitPiece {
	constructor() {
		super();
		this.closed = false;
		this.input = [0];
		this.output = 0;
		//still need image
		this.img_path = ""
	}
	getOutput() {
		if (this.closed && this.input[0] == 1) {
			this.output = 1;
		}
		else {
			this.output = 0;
		}
	}
	reset() {
		this.closed = false;
		this.input = [0];
		this.output = 0;
	}
}

//NOT IMPLEMENTED
//2 POLE SWITCH CLASS
class TwoPoleSwitch extends CircuitPiece {
	constructor() {
		super();
		this.input = [0];
		this.output = 0;
		this.output2 = 0;
		this.pole_up = true;//starts up
		//still need image
		this.img_path = ""
	}
	getOutput() {
		if (this.pole_up) {
			this.output = this.input[0];
			this.output2 = 0;
		}
		else {
			this.output = 0;
			this.output2 = this.input[0];
		}
	}
	reset() {
		this.input = [0];
		this.output = 0;
		this.output2 = 0;
		this.pole_up = true;
	}
}


/*
	Wire class

	Since wires are not fully implemented, this may not be the best structure for wires

	Very simple:
		left point
		right point
		setter functions

*/

//WIRE CLASS
class Wire {
	constructor() {
		this.left = null;
		this.right = null;
	}

	setLeft(x, y) {
		this.left = [x, y]
	}
	setRight(x, y) {
		this.right = [x, y]
	}
}