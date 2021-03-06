/*
	This file holds classes for the componenets of the circuit
	and the Node class for storing them in a set

	All circuit type pieces have a type that is used for converting a file upload to gate pieces,
	an image_path that is changed as the circuit is playing, and an img_default that should not 
	be changed and is used to store the base image name for the circuit piece.
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
		this.parent = []; //each element holds [parent_Node, input_index of child]
		this.img = new Image();
		this.piece = piece;
		this.img.src = piece.img_path;
	}

	getInput() {
        for (let i = 0; i < this.parent.length; i++) {
			if (this.parent[i][0] instanceof Wire) {
				//wire input -- parent instance of wire then
				this.piece.input[this.parent[i][1]] = this.parent[i][0].output;
			} else {
				this.piece.input[this.parent[i][1]] = this.parent[i][0].piece.output;
			}
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
class CircuitPiece{
	constructor(){
		this.xpos = 0;
		this.ypos = 0;
		this.name = null;
		this.inputLocations=[[0,0,false],[0,0,false]];
		this.outputLocations=[0,0];
	}
	setLocation(x,y){
		this.xpos = x;
		this.ypos = y;
		this.inputLocations[0][0] = x+10
		this.inputLocations[0][1] = y+20
		this.inputLocations[1][0] = x+10
		this.inputLocations[1][1] = y+40
		this.outputLocations=[x+90,y+30];
	}
	giveName(newName){
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
class AndGate extends CircuitPiece{
	constructor(){
		super();
		this.input = [0,0];
		this.output = 0;
		this.img_path = "images/10x6_and.png";
		this.img_default = "images/10x6_and.png";
		this.type = "andGate";
	}
	getOutput(){
		if(this.input[0] == 1 && this.input[1] == 1){
			this.output = 1;
			this.img_path = "images/10x6_and_on_both.png"
		}
		else if (this.input[0] == 1 && this.input[1] == 0) {
			this.output = 0;
			this.img_path = "images/10x6_and_on_top.png"
		}
		else if (this.input[0] == 0 && this.input[1] == 1) {
			this.output = 0;
			this.img_path = "images/10x6_and_on_bot.png"
		}
		else{
			this.output = 0;
			this.img_path = "images/10x6_and.png";
		}
	}
	reset(){
		this.input = [0,0];
		this.output = 0;
	}
}
//Lable CLASS
class Labels extends CircuitPiece {
	constructor(props) {
		super(props);
		this.input = [0, 0];
		this.output = 1;
		this.label = props;
		this.type = "label";
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
class NandGate extends CircuitPiece{
	constructor(){
		super();
		this.input = [0,0];
		this.output = 1;
		this.img_path = "images/11x6_nand.png";
		this.img_default = "images/11x6_nand.png";
		this.type = "nandGate";
	}
	
	setLocation(x,y){
		this.xpos = x;
		this.ypos = y;
		this.inputLocations[0][0] = x+10
		this.inputLocations[0][1] = y+20
		this.inputLocations[1][0] = x+10
		this.inputLocations[1][1] = y+40
		this.outputLocations=[x+100,y+30];
	}
	getOutput(){
		if (this.input[0] == 1 && this.input[1] == 1) {
			this.output = 0;
			this.img_path = "images/11x6_nand_on_both.png";
		}
		else if (this.input[0] == 1) {
			this.output = 1;
			this.img_path = "images/11x6_nand_on_top.png";
		}
        else if (this.input[1] == 1){
			this.output = 1;
			this.img_path = "images/11x6_nand_on_bot.png";
		}
		else {
			this.output = 1;
			this.img_path = "images/11x6_nand_off.png";
		}
	}
	reset(){
		this.input = [0,0];
		this.output = 1;
	}
}
//OR GATE CLASS
class OrGate extends CircuitPiece{
	constructor(){
		super();
		this.input = [0,0];
		this.output = 0;
		this.img_path = "images/10x6_or.png";
		this.img_default = "images/10x6_or.png";
		this.type = "orGate";
	}
	getOutput(){
		if (this.input[0] == 1 && this.input[1] == 1) {
			this.output = 1;
			this.img_path = "images/10x6_or_on_both.png";
		}
		else if (this.input[0] == 1) {
			this.output = 1;
			this.img_path = "images/10x6_or_on_top.png";
		}
        else if (this.input[1] == 1){
			this.output = 1;
			this.img_path = "images/10x6_or_on_bot.png";
		}
		else {
			this.output = 0;
			this.img_path = "images/10x6_or.png";
		}
	}
	reset(){
		this.input = [0,0];
		this.output = 0;
	}
}
//XOR CLASS
class XorGate extends CircuitPiece{
	constructor(){
		super();
		this.input = [0,0];
		this.output = 0;
		this.img_path = "images/10x6_xor.png";
		this.img_default = "images/10x6_xor.png";
		this.type = "xorGate";
	}
	getOutput(){
		if (this.input[0] == 1 && this.input[1] == 1) {
			this.output = 0;
			this.img_path = "images/10x6_xor_on_both.png";
		}
		else if (this.input[0] == 1) {
			this.output = 1;
			this.img_path = "images/10x6_xor_on_top.png";
		}
        else if (this.input[1] == 1){
			this.output = 1;
			this.img_path = "images/10x6_xor_on_bot.png";
		}
		else {
			this.output = 0;
			this.img_path = "images/10x6_xor.png";
		}
	}
	reset(){
		this.input = [0,0];
		this.output = 0;
	}
}
//NOR CLASS
class NorGate extends CircuitPiece{
	constructor(){
		super();
		this.input = [0,0];
		this.output = 1;
		this.img_path = "images/11x6_nor.png";
		this.img_default = "images/11x6_nor.png";
		this.type = "norGate";
	}
	setLocation(x,y){
		this.xpos = x;
		this.ypos = y;
		this.inputLocations[0][0] = x+10
		this.inputLocations[0][1] = y+20
		this.inputLocations[1][0] = x+10
		this.inputLocations[1][1] = y+40
		this.outputLocations=[x+100,y+30];
	}
	getOutput(){
		if (this.input[0] == 1 && this.input[1] == 1) {
			this.output = 0;
			this.img_path = "images/11x6_nor_on_both.png";
		}
		else if (this.input[0] == 1) {
			this.output = 0;
			this.img_path = "images/11x6_nor_on_top.png";
		}
        else if (this.input[1] == 1){
			this.output = 0;
			this.img_path = "images/11x6_nor_on_bot.png";
		}
		else {
			this.output = 1;
			this.img_path = "images/11x6_nor_off.png";
		}
	}
	reset(){
		this.input = [0,0];
		this.output = 1;
	}
}
//XNOR CLASS
class XnorGate extends CircuitPiece{
	constructor(){
		super();
		this.input = [0,0];
		this.output = 1;
		this.img_path = "images/11x6_xnor.png";
		this.img_default = "images/11x6_xnor.png";
		this.type = "xnorGate";
	}
	setLocation(x,y){
		this.xpos = x;
		this.ypos = y;
		this.inputLocations[0][0] = x+10
		this.inputLocations[0][1] = y+20
		this.inputLocations[1][0] = x+10
		this.inputLocations[1][1] = y+40
		this.outputLocations=[x+100,y+30];
	}
	getOutput(){
		if (this.input[0] == 1 && this.input[1] == 1) {
			this.output = 1;
			this.img_path = "images/11x6_xnor_on_both.png";
		}
		else if (this.input[0] == 1) {
			this.output = 0;
			this.img_path = "images/11x6_xnor_on_top.png";
		}
        else if (this.input[1] == 1){
			this.output = 0;
			this.img_path = "images/11x6_xnor_on_bot.png";
		}
		else {
			this.output = 1;
			this.img_path = "images/11x6_xnor_off.png";
		}
	}
	reset(){
		this.input = [0,0];
		this.output = 1;
	}
}
//NOT CLASS
class NotGate extends CircuitPiece{
	constructor(){
		super();
		this.input = [0];
		this.output = 1;
		this.img_path = "images/10x6_not.png";
		this.img_default = "images/10x6_not.png";
		this.type = "notGate";
	}
	setLocation(x,y){
		this.xpos = x;
		this.ypos = y;
		this.inputLocations[0][0] = x+10
		this.inputLocations[0][1] = y+30
		this.outputLocations=[x+90,y+30];
	}
	getOutput(){
		if(this.input[0] == 0){
			this.output = 1;
			this.img_path = "images/10x6_not_off.png"
		}
		else {
			this.output = 0;
			this.img_path = "images/10x6_not_on.png"
		}
	}
	reset(){
		this.input = [0];
		this.output = 1
	}
}
//SWITCH CLASS
class Switch extends CircuitPiece{
	constructor() {
		super();
		this.input = [0];
		this.output = 0;
		this.toggled = 0;
		this.img_path = "images/switch-open-0-0.png";
		this.img_default = "images/switch-open-0-0.png";
		this.type = "swtich";
	}
	toggle() {
		this.toggled = this.toggled+1;
		if (this.toggled == 2) {
			this.toggled = 0;
		}
		//alert (this.toggled);
	}
	setLocation(x,y){
		this.xpos = x;
		this.ypos = y;
		this.inputLocations[0][0] = x+10
		this.inputLocations[0][1] = y+30
		this.outputLocations=[x+90,y+30];
	}
	getOutput(){
		if(this.toggled == 0) { // switch is not on (not toggled)
			//alert("i'm not toggled");
			if(this.input[0] == 0 && this.output == 0) {
				this.img_path = "images/switch-open-0-0.png";
			} else if(this.input[0] == 0 && this.output == 1) {
				this.img_path = "images/switch-open-0-1.png";
			} else if(this.input[0] == 1 && this.output == 0) {
				this.img_path = "images/switch-open-1-0.png";
			} else if(this.input[0] == 1 && this.output == 1) {
				this.img_path = "images/switch-open-1-1.png";
			} else {
				alert("weird switch behaviour 1");
			}
		} else if (this.toggled == 1) { // switch is on (toggled)
			//alert("i'm toggled");
			if(this.input[0] == 0 && this.output == 0) { 
				this.img_path = "images/switch-close-0-0.png";
			} else if(this.input[0] == 0 && this.output == 1) {
				this.input[0] = 1;
				this.img_path = "images/switch-close-1-1.png";
			} else if(this.input[0] == 1 && this.output == 0) {
				this.output = 1;
				this.img_path = "images/switch-close-1-1.png";
			} else if(this.input[0] == 1 && this.output == 1) {
				this.img_path = "images/switch-close-1-1.png";
			} else {
				alert("weird switch behaviour 2");
			}
		} else {
			alert("weird switch behaviour 3");
		}
		/*
		if(this.input[0] == 0){
			this.output = 1;
			this.img_path = "images/10x6_not_off.png"
		}
		else {
			this.output = 0;
			this.img_path = "images/10x6_not_on.png"
		}*/
	}
	reset(){
		this.input = [0];
		this.output = 0;
		//this.img_path = "images/switch-open-0-0.png";
	}
}
//POSITIVE INPUT CLASS
class PositiveIn extends CircuitPiece{
	constructor(){
		super();
		this.input = null;
		this.output = 1;
		this.img_path = "images/7x6_positive.png";
		this.img_default = "images/7x6_positive.png";
		this.inputLocations = [];
		this.type = "posInput";
	}
	setLocation(x,y){
		this.xpos = x;
		this.ypos = y;
		this.outputLocations=[x+60,y+30];
	}
	//unused but called in main when saving
	getOutput(){
		if (this.output == 1) {
			this.img_path = "images/7x6_positive_on.png";
		}
		else {
			this.img_path = "images/7x6_positive.png";
		}
	}
	reset(){}
}
//NEGATIVE INPUT CLASS
class NegativeIn extends CircuitPiece{
	constructor(){
		super();
		this.input = null;
		this.output = 0;
		this.img_path = "images/7x6_zero.png";
		this.img_default = "images/7x6_zero.png";
		this.inputLocations = [];
		this.type = "negInput";
	}
	setLocation(x,y){
		this.xpos = x;
		this.ypos = y;
		this.outputLocations=[x+60,y+30];
	}
	//unused but called in main when saving
	getOutput(){}
	reset(){}
}
//LED OUTPUT CLASS
class LEDout extends CircuitPiece{
	constructor(){
		super();
		this.input = [0];
		this.output = 0;
		this.img_path = "images/7x6_LED.png";
		this.img_default = "images/7x6_LED.png";
		this.inputLocations=[[0,0,false]];
		this.type = "ledOut";
	}
	setLocation(x,y){
		this.xpos = x;
		this.ypos = y;
		this.inputLocations=[[x+10,y+30,this.inputLocations[0][2]]];
	}
	getOutput(){
		this.output = this.input[0];
		console.log("getting LED" + this.output);
		if (this.output == 1) {
			this.img_path = "images/7x6_LED_on.png";
		}
		else {
			this.img_path = "images/7x6_LED.png";
		}
	}
	reset(){
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
//NOT IMPLEMENTED
//2 POLE SWITCH CLASS
class TwoPoleSwitch extends CircuitPiece{
	constructor(){
		super();
		this.input = [0];
		this.output = 0;
		this.output2 = 0;
		this.pole_up = true;//starts up
		//still need image
		this.img_path = "" 
	}
	getOutput(){
		if(this.pole_up){
			this.output = this.input[0];
			this.output2 = 0;
		} 
		else {
			this.output = 0;
			this.output2 = this.input[0];
		}
	}
	reset(){
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
	constructor(){
		this.left = null;
		this.right = null;
		this.output = 0;
		this.playTurn = 0;
		this.connectedWires = new Set();
		this.connectedOutputs = new Set();
		this.connectedInputs = new Set(); // stored as an array [gate, input number]
	}
	setLeft(x,y){
		this.left = [x,y]
	}
	setRight(x,y){
		this.right = [x,y]
	}
	getInput() {
		if (this.playTurn == 1) {return;}
		var conducting = 0;
		for (let connOutput of this.connectedOutputs) {
			if (connOutput.piece.output == 1) {this.output = 1;conducting = 1;}
		}
		//for (let connInput of this.connectedInputs) {
		//	if (connInput[0].piece.input[connInput[1]] == 1) {this.output=1;conducting = 1;break;}
		//}
		if (this.playTurn == 0 || conducting == 0) {
			this.playTurn = 1;
			for (let connWire of this.connectedWires) {
				if (this.output ==1) {
					connWire.getInput();
				}
				if (connWire.output == 1) {
					this.output=1;
					conducting = 1;
				}
			}
		}
		if (conducting == 0) {this.output = 0;}
	}
	reset() {
		this.playTurn = 0;
		this.output = 0;
	}
}