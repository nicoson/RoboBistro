var config = [
	{
		content: ["启动"],
		node: 0,
		childNode: 1
	},
	{
		content: ["选择口味", "网络订单"],
		node: 1,
		childNode: 2
	},
	{
		content: ["香甜", "酥盐", "奶酪", "原味", "经典"],
		node: 2,
		childNode: 3
	},
	{
		content: ["x1", "x2", "x3", "x4", "x5"],
		node: 3,
		childNode: 4
	},
	{
		content: ["下单"],
		node: 4,
		childNode: null
	}
];

$(document).ready(function(){
	//	controler for products choice page
	var centerOrigin = {x: document.body.clientWidth/2, y: document.body.clientHeight/2};

	var svg = d3.select("section").append("svg").attr("width", document.body.clientWidth - 10).attr("height", document.body.clientHeight - 10);//.append("g");

	var originObj = {
		svg			: svg, 
		r 			: 70, 
		contents	: config, 
		parentObj	: null
	};

	var hex = new hexagon(originObj, centerOrigin, 0, 0);
	hex.init();



	//	binding events for order pay page
	var jumpTrigger = false;

	$("#get_back").on("mouseover", function(){
		jumpTrigger = true;
		setTimeout(function(){
			if(jumpTrigger) {
				location.reload();
			}
		}, 600);
	});

	$("#get_back").on("mouseout", function(){
		jumpTrigger = false;
	});



	//==============================\\
	// leap motion controller
	//==============================\\
	var mousePoint = $("#mouse");
	var screenX = document.body.clientWidth - mousePoint.width();
	var	screenY = document.body.clientHeight - mousePoint.height();
	//var displayArea = canvasElement.getContext("2d");

	var controller = new Leap.Controller();
	controller.on("frame", function(frame){
	    if(frame.pointables.length > 0)
	    {
	        // canvasElement.width = screenX; //clear
	        // canvasElement.height = screenY; //clear
	        
	        //Get a pointable and normalize the tip position
	        var pointable = frame.pointables[0];
	        var interactionBox = frame.interactionBox;
	        var normalizedPosition = interactionBox.normalizePoint(pointable.tipPosition, true);
	        
	        // Convert the normalized coordinates to span the canvas
	        var posX = screenX * normalizedPosition[0];
	        var posY = screenY * normalizedPosition[2];
	        //var posY = screenY * (1 - normalizedPosition[1]);
	        //we can ignore z for a 2D context

	        mousePoint.offset({top: posY, left: posX});
	        
	        //displayArea.strokeText("(" + canvasX.toFixed(1) + ", " + canvasY.toFixed(1) + ")", canvasX, canvasY);
	    }
	});
	controller.connect();
});

function hexagon(parentObj, center, nodeNum, item) {
	//	use global variable to set a singleton, will change to use closure later
	if(window.globalControl == undefined) {
		window.globalControl	= false;	//	mouse does not hover in any hexagon
		window.popcornFavor		= "";
		window.popcornNum		= 0;
	}

	var sqrt3 = Math.sqrt(3);
	var that = this;

	this.svg			= parentObj.svg;
	this.r				= parentObj.r;
	this.contents		= parentObj.contents;
	this.parentObj		= parentObj;

	this.center 		= center;

	this.hexagonEle		= "";
	this.subHexagonEle	= [];
	this.visible		= true;
	this.nodeNum		= nodeNum;
	this.item			= item;

	this.init = function() {
		this.hexagonEle = this.drawHexagon();
		var newCenter = {
			x: this.center.x - sqrt3*this.r - 5,
			y: this.center.y
		}

		this.hexagonEle.on("mouseover", function(e) {
			//	one of hexagon is hovered by mouse
			globalControl = true;

			//	settle the focused hexagon and its parent as visible
			that.visible = true;
			if(that.parentObj) {
				that.parentObj.visible = true;
			}
			
			//	remove all the child generation nodes from svg
			for(var i=0; i<that.subHexagonEle.length; i++) that.subHexagonEle[i].removeGenerations();
			//	reset the childNodes list table
			that.subHexagonEle = [];

			//	draw the current children nodes
			if(that.contents[that.nodeNum].childNode) {
				//	create new child hexagon
				var centers = that.getSubHexCenter();
				var dir = that.getDirection();

				for(var i = 0; i < that.contents[that.contents[that.nodeNum].childNode].content.length; i++) {
					var childHexagon = new hexagon(that, centers[dir[i]], that.contents[that.nodeNum].childNode, i);
					childHexagon.init();
					that.subHexagonEle.push(childHexagon);
				}
			}

			//	record the choice
			if(that.nodeNum == 2) {
				popcornFavor = that.contents[2].content[that.item];
			}else if(that.nodeNum == 3) {
				popcornNum = that.contents[3].content[that.item];
			}
			console.log("item = " + popcornFavor + "; number = " + popcornNum);

			//	make order
			if(that.nodeNum == 4) {
				that.submitOrder();
			}
		});

		this.hexagonEle.on("mouseleave", function(e) {
			//	when blur, set gobal control as false
			globalControl = false;
			//	when blur, set all current related hexagon as invisible
			this.visible = false;

			for(var i = 0; i < that.subHexagonEle.length; i++){
				that.subHexagonEle[i].visible = false;
			}

			//	waiting for the next step, and destroy the non-related hexagons
			setTimeout(function(){
				//	when blur the all of the hexagon, all related hexagons will be destroied
				if(!globalControl) {
					for(var i = that.svg.selectAll("g")[0].length - 1; i>0; i--){
						that.svg.selectAll("g")[0][i].remove();
					}
				}

				for(var i = 0; i < that.subHexagonEle.length; i++){
					if(!that.subHexagonEle[i].visible) {
						that.subHexagonEle[i].destroy();
					}
				}
			}, 200);

		});
	}

	this.getHexPoints = function() {
		points = [
			[this.center.x,						this.center.y - this.r],   // top point
			[this.center.x + sqrt3*this.r/2,	this.center.y - this.r/2], // top right point
			[this.center.x + sqrt3*this.r/2,	this.center.y + this.r/2], // bottom right point
			[this.center.x,						this.center.y + this.r],   // bottom point
			[this.center.x - sqrt3*this.r/2,	this.center.y + this.r/2], // bottom left point
			[this.center.x - sqrt3*this.r/2,	this.center.y - this.r/2], // top left point
			[this.center.x,						this.center.y - this.r],   // top point
		]

		return points.map(function(str){return str.join(",")}).join(" ");
	}

	//	get the geolocation of the current Hexagon related to the parent hexagon
	this.getDirection = function() {
		var direction = 1;
		var childCenter = [4, 3, 5, 2, 6];
		if(this.parentObj.parentObj) {
			var xvar = this.center.x - this.parentObj.center.x,
				yvar = this.center.y - this.parentObj.center.y;
			if(xvar < -this.r) {
				direction = 1;			//	left
			}else if(xvar < 0){
				if(yvar > 0) {
					direction = 6;		//	left top
				}else{
					direction = 2;		//	left bottom
				}
			}else if(xvar > this.r) {
				direction = 4;			//	right
			}else{
				if(yvar > 0) {
					direction = 5;		//	right top
				}else{
					direction = 3;		//	right bottom
				}
			}
		}else{
			childCenter = [4,1];
			direction = 1;
		}
		
		return childCenter.map(function(num){
			return (direction -1 + 3 + num - 1)%6;
		});
	}

	this.drawHexagon = function() {
		// return this.svg.append("polygon").attr("class", "hexagon").attr("points", this.getHexPoints(this.center, this.r));
		var ele = this.svg.append("g");
		ele.append("text").text(this.contents[this.nodeNum].content[this.item]).attr("x", this.center.x).attr("y", this.center.y).attr("text-anchor", "middle").attr("style", "font-size:20px; fill: white");
		ele.append("polygon").attr("class", "hexagon").attr("points", this.getHexPoints(this.center, this.r));
		return ele;
	}

	this.hexagonHover = function() {

	}

	this.getSubHexCenter = function() {
		var gap = 6;
		var leftCenter			= {x: this.center.x - sqrt3*this.r - gap,		y: this.center.y}
			leftTopCenter		= {x: this.center.x - sqrt3*this.r/2 - gap/2,	y: this.center.y - this.r*3/2 - gap*2/sqrt3},
			rightTopCenter		= {x: this.center.x + sqrt3*this.r/2 + gap/2,	y: this.center.y - this.r*3/2 - gap*2/sqrt3},
			rightCenter			= {x: this.center.x + sqrt3*this.r + gap,		y: this.center.y},
			rightBottomCenter	= {x: this.center.x + sqrt3*this.r/2 + gap/2,	y: this.center.y + this.r*3/2 + gap*2/sqrt3},
			leftBottomCenter	= {x: this.center.x - sqrt3*this.r/2 - gap/2,	y: this.center.y + this.r*3/2 + gap*2/sqrt3};
		return [leftCenter, leftTopCenter, rightTopCenter, rightCenter, rightBottomCenter, leftBottomCenter];
	}

	this.destroy = function() {
		this.hexagonEle.remove();
	}

	this.removeGenerations = function() {
		if(this.subHexagonEle.length != 0) {
			for(var i=0; i<this.subHexagonEle.length; i++) {
				this.subHexagonEle[i].removeGenerations();
			}
		}

		this.destroy();
	}

	this.submitOrder = function() {
		$("svg").remove();

		$.ajax({
			url: "/alipayOrderCreate",
			method: "POST",
			data: {
				amount: Number(30*Number(popcornNum.slice(1)))*100
			}
		}).done(function(data){
			console.log(data);
			$(".rb_qrCode").qrcode({width: 200,height: 200, text: data.credential.alipay_qr});
			$("#pay_page").slideDown(1500);
			setTimeout(function(){alipayOrderQuery(data.id)}, 3000);
		});
	}
}

function alipayOrderQuery(id){
	$.ajax({
		url: "/alipayOrderQuery",
		method: "POST",
		data: {
			id: id
		}
	}).done(function(data){
		console.log(data);
		if(data.paid){
			location.href = "payfinish";
		}else{
			setTimeout(function(){return alipayOrderQuery(id);}, 1000);
		}
	});
}

