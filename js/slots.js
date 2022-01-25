var app = new PIXI.Application(860, 730, {backgroundColor : 0x32CD32});
document.body.appendChild(app.view);

var REEL_WIDTH = 160; // width of every reels (columns)
var SYMBOL_SIZE = 140;

var reelstops0 = [2,8,16,1,22];
var reelstops1 = [5,7,15,17,20];
var reelstops2 = [23,0,10,18,5];
var reelstops3 = [13,9,19,3,11];
var reelstops4 = [6,12,18,24,7];

var reelStopSound = "reelStop";
var reelSpinSound = "reelSpin";

var reelSpinInstance;

function registerSounds()
{
	createjs.Sound.registerSound("sounds/Landing_1.mp3", reelStopSound);
	createjs.Sound.registerSound("sounds/Reel_Spin.mp3", reelSpinSound);
}

PIXI.loader
    .add("icon01","images/icon01.png")
	.add("icon02","images/icon02.png")
	.add("icon03","images/icon03.png")
	.add("icon04","images/icon04.png")
	.add("icon05","images/icon05.png")
	.add("icon06","images/icon06.png")
	.add("icon07","images/icon07.png")
	.add("icon08","images/icon08.png")
	.add("icon09","images/icon09.png")
	.add("icon10","images/icon10.png")
	.add("icon11","images/icon11.png")
	.add("icon12","images/icon12.png")
	.add("icon13","images/icon13.png")
	.add("reelFrame", "images/reelFrame.png")
	.add("symbolBackground", "images/symbolBackground.png")
	.add("btnSpinNormalState", "images/btn_spin_normal.png")
	.add("btnSpinHoverState", "images/btn_spin_hover.png")
	.add("btnSpinPressState", "images/btn_spin_pressed.png")
	.add("btnSpinDisableState", "images/btn_spin_disabled.png")
    .load(onAssetsLoaded);

function onAssetsLoaded()
{
	var symbolBackground = PIXI.Texture.fromImage("symbolBackground");

	//Create different icon symbols.
	var icons = [
		PIXI.Texture.fromImage("icon01"), //10
		PIXI.Texture.fromImage("icon02"), //jack
		PIXI.Texture.fromImage("icon03"), //queen
		PIXI.Texture.fromImage("icon04"), //king
		PIXI.Texture.fromImage("icon05"), //ace
		PIXI.Texture.fromImage("icon06"), //coco
		PIXI.Texture.fromImage("icon07"), //snake
		PIXI.Texture.fromImage("icon08"), //frog
		PIXI.Texture.fromImage("icon09"), //bird
		PIXI.Texture.fromImage("icon10"), //banana round
		PIXI.Texture.fromImage("icon11"), //banana rectangle
		PIXI.Texture.fromImage("icon12"), //wild
		PIXI.Texture.fromImage("icon13")  //mr monkey
	];

	var reelMapping = [
		[ //reel 1 or column 1
			icons[0],icons[1],icons[2],icons[3],icons[4],icons[5],icons[6],icons[7],icons[8],icons[9],
			icons[0],icons[1],icons[2],icons[3],icons[4],icons[5],icons[6],icons[7],icons[8],icons[10],
			icons[0],icons[1],icons[2],icons[3],icons[4],icons[5],icons[6],icons[7],icons[8],icons[11]
		],
		[ //reel 2 or column 2
			icons[0],icons[1],icons[2],icons[3],icons[4],icons[5],icons[6],icons[7],icons[8],icons[9],
			icons[0],icons[1],icons[2],icons[3],icons[4],icons[5],icons[6],icons[7],icons[8],icons[9],
			icons[0],icons[1],icons[2],icons[3],icons[4],icons[5],icons[6],icons[7],icons[8],icons[12]
		],
		[ //reel 3 or column 3
			icons[0],icons[1],icons[2],icons[3],icons[4],icons[5],icons[6],icons[7],icons[8],icons[9],
			icons[0],icons[1],icons[2],icons[3],icons[4],icons[5],icons[6],icons[7],icons[8],icons[9],
			icons[0],icons[1],icons[2],icons[3],icons[4],icons[5],icons[6],icons[7],icons[8],icons[9]
		],
		[ //reel 4 or column 4
			icons[0],icons[1],icons[2],icons[3],icons[4],icons[5],icons[6],icons[7],icons[8],icons[9],
			icons[0],icons[1],icons[2],icons[3],icons[4],icons[5],icons[6],icons[7],icons[8],icons[9],
			icons[0],icons[1],icons[2],icons[3],icons[4],icons[5],icons[6],icons[7],icons[8],icons[10],
		],
		[ //reel 5 or column 5
			icons[0],icons[1],icons[2],icons[3],icons[4],icons[5],icons[6],icons[7],icons[8],icons[9],
			icons[0],icons[1],icons[2],icons[3],icons[4],icons[5],icons[6],icons[7],icons[8],icons[9],
			icons[0],icons[1],icons[2],icons[3],icons[4],icons[5],icons[6],icons[7],icons[8],icons[9]
		]
	];

	var reelMappingToUse = reelMappingToUse();
	function reelMappingToUse()
	{
		var reelStopsToUse = Math.floor(Math.random()*5);
		var returnedReelMap;

		switch (reelStopsToUse){
			case 0: returnedReelMap = reelstops0; break;
			case 1: returnedReelMap = reelstops1; break;
			case 2: returnedReelMap = reelstops2; break;
			case 3: returnedReelMap = reelstops3; break;
			default: returnedReelMap = reelstops4; break; // 4 or other number
		}

		return returnedReelMap;
	}

	//Build the reels
	var reels = [];
	var reelContainer = new PIXI.Container();
	for( var i = 0; i < 5; i++)
	{
		var rcBackground = new PIXI.Container();
		rcBackground.x = i*REEL_WIDTH;
		reelContainer.addChild(rcBackground);

		var rc = new PIXI.Container();
		rc.x = i*REEL_WIDTH;
		reelContainer.addChild(rc);
		
		var reel = {
			container: rc,
			symbols:[],
			position:0,
			previousPosition:0,
			blur: new PIXI.filters.BlurFilter()
		};
		reel.blur.blurX = 0;
		reel.blur.blurY = 0;
		rc.filters = [reel.blur];
		
		//Build the icon symbols
		for(var j = 0; j < 5; j++)
		{
			var symbol = new PIXI.Sprite(reelMapping[i][reelMappingToUse[i]+(j)]);
			//Scale the symbol to fit symbol area.
			symbol.y = j*SYMBOL_SIZE;
			symbol.scale.x = symbol.scale.y = Math.min( SYMBOL_SIZE / symbol.width, SYMBOL_SIZE/symbol.height);
			symbol.x = Math.round((SYMBOL_SIZE - symbol.width)/2);
			reel.symbols.push( symbol );
			rc.addChild(symbol);

			var symbolBG = new PIXI.Sprite(symbolBackground);
			symbolBG.y = j*SYMBOL_SIZE;
			symbolBG.scale.set(0.85, 1.1);
			symbolBG.x = Math.round((SYMBOL_SIZE - symbolBG.width)/2) - 2.5;
			rcBackground.addChild(symbolBG);
		}
		reels.push(reel);
	}
	app.stage.addChild(reelContainer);
	
	//Build all elements and position reelContainer
	var margin = (app.screen.height - SYMBOL_SIZE*4)/2;
	reelContainer.y = 30;
	reelContainer.x = 35;

	var reelFrameImage = PIXI.Texture.fromImage("reelFrame");
	var reelFrameSprite = new PIXI.Sprite(reelFrameImage);
	reelFrameSprite.y = 0; //margin/2;
	reelFrameSprite.width = app.screen.width+5;
	reelFrameSprite.height = 600;

	var reelMask = new PIXI.Graphics();
	reelMask.beginFill(0,1);
	reelMask.drawRect(0, 30, app.screen.width, reelFrameSprite.height - 45);
	reelContainer.mask = reelMask;
	
	//Create styles
	var styleNormal = new PIXI.TextStyle({
		fontFamily: 'Arial',
		fontSize: 36,
		fontStyle: 'normal',
		fontWeight: 'bold',
		fill: ['yellow', 'white'], // gradient
		stroke: 'black',
		strokeThickness: 5,
		dropShadow: true,
		dropShadowColor: 'brown',
		dropShadowBlur: 4,
		dropShadowAngle: Math.PI / 2,
		dropShadowDistance: 4,
		wordWrap: true,
		wordWrapWidth: 440
	});

	var styleDisabled = new PIXI.TextStyle({
		fontFamily: 'Arial',
		fontSize: 36,
		fontStyle: 'normal',
		fontWeight: 'bold',
		fill: ['gray', 'gray'], // gradient
		stroke: 'black',
		strokeThickness: 5,
		wordWrap: true,
		wordWrapWidth: 440
	});

	var styleLogo = new PIXI.TextStyle({
	    dropShadow: true,
	    dropShadowAlpha: 0.7,
	    dropShadowAngle: 0.9,
	    dropShadowColor: "#400000",
	    dropShadowDistance: 3,
	    fill: "#eadf0f",
	    fontFamily: "Arial Black",
	    fontSize: 36,
	    fontWeight: "bold",
	    lineJoin: "bevel",
	    strokeThickness: 5
	});
	
	var buttonContainer = new PIXI.Container();
	var btnNormal = new PIXI.Sprite(PIXI.Texture.fromImage("btnSpinNormalState"));
	var btnHover = new PIXI.Sprite(PIXI.Texture.fromImage("btnSpinHoverState"));
	var btnPressed = new PIXI.Sprite(PIXI.Texture.fromImage("btnSpinPressState"));
	var btnDisabled = new PIXI.Sprite(PIXI.Texture.fromImage("btnSpinDisableState"));

	btnNormal.scale.set(0.8, 0.8);
	btnHover.scale.set(0.8, 0.8);
	btnPressed.scale.set(0.8, 0.8);
	btnDisabled.scale.set(0.8, 0.8);

	buttonContainer.addChild(btnNormal);
	buttonContainer.addChild(btnHover);
	buttonContainer.addChild(btnPressed);
	buttonContainer.addChild(btnDisabled);

	setButtonState("normal");

	buttonContainer.x = app.screen.width - buttonContainer.width;
	buttonContainer.y = app.screen.height - buttonContainer.height - 5;

	var gameLogo = new PIXI.Text("Mr.MONKEY", styleLogo);
	gameLogo.x = Math.round((app.screen.width - gameLogo.width)/2);
	gameLogo.y = 0;
	gameLogo.alpha = 0.9;

	var spinText = new PIXI.Text('SPIN', styleNormal);
	spinText.x = Math.round((buttonContainer.width - spinText.width)/2);
	spinText.y = Math.round((buttonContainer.height - spinText.height)/2);
	buttonContainer.addChild(spinText);
	
	app.stage.addChild(reelFrameSprite);
	app.stage.addChild(gameLogo);
	app.stage.addChild(buttonContainer);
	
	//Set the interactivity to true.
	buttonContainer.interactive = true;
	buttonContainer.buttonMode = true;
	
	buttonContainer.addListener("pointerdown", function(){
		setButtonState("pressed");
		startSpin();
		reelSpinInstance = createjs.Sound.play(reelSpinSound);
	});

	buttonContainer.addListener("pointerup", function(){
		setButtonState("normal");
	});

	buttonContainer.addListener("pointerover", function(){
		setButtonState("hover");
	});

	buttonContainer.addListener("pointerout", function(){
		setButtonState("normal");
	});

	function setButtonState(state){
		switch (state) {
			case "normal":
				btnNormal.visible = true;
				btnHover.visible = btnPressed.visible = btnDisabled.visible = false;
				break;
			case "hover":
				btnHover.visible = true;
				btnNormal.visible = btnPressed.visible = btnDisabled.visible = false;
				break;
			case "pressed":
				btnPressed.visible = true;
				btnNormal.visible = btnHover.visible = btnDisabled.visible = false;
				break;
			case "disabled":
				btnDisabled.visible = true;
				btnNormal.visible = btnHover.visible = btnPressed.visible = false;
				break;
		}
	}
	
	var running = false;
	
	//Function to start spinning.
	function startSpin(){
		if(running) return;
		running = true;

		setTimeout(function(){ 
			buttonContainer.interactive = false;
			buttonContainer.buttonMode = false;
			setButtonState("disabled"); 

			spinText.alpha = .6;
			spinText.setStyle(styleDisabled);
		}, 200);
		
		for(var i = 0; i < reels.length; i++)
		{
			var r = reels[i];
			var extra = 0;
			tweenTo(r, "position", r.position + 10+i*5+extra, 1000+i*400+extra*1, backout(0.6), null, i == reels.length-1 ? reelsComplete : null);
		}
	}
	
	//Reels done handler.
	function reelsComplete(){
		reelSpinInstance.muted = true;
		running = false;
		buttonContainer.interactive = true;
		buttonContainer.buttonMode = true;
		setButtonState("normal"); 

		spinText.alpha = 1;
		spinText.setStyle(styleNormal);

		for (var i = 0; i < reelMappingToUse.length; i++)
		{
			reelMappingToUse[i] += 4;

			if (reelMappingToUse[i] + 4 > 29){
				reelMappingToUse[i] = ((reelMappingToUse[i] + 4) - 29)-1;
			}
		}
	}
	
	// Listen for animate update.
	app.ticker.add(function(delta) {
		//Update the slots.
		for( var i = 0; i < reels.length; i++)
		{
			var r = reels[i];
			//Update blur filter y amount based on speed.
			//This would be better if calculated with time in mind also. Now blur depends on frame rate.
			r.blur.blurY = (r.position-r.previousPosition)*20;
			r.previousPosition = r.position;
			
			//Update symbol positions on reel.
			for( var j = 0; j < r.symbols.length; j++)
			{
				var s = r.symbols[j];
				var prevy = s.y;
				s.y = (r.position + j)%r.symbols.length*SYMBOL_SIZE-SYMBOL_SIZE;

				if(s.y < 0 && prevy > SYMBOL_SIZE){
					//Detect going over and swap a texture. 
					//This should in proper product be determined from some logical reel.
					s.texture = reelMapping[i][reelMappingToUse[i]+(j)];
					s.scale.x = s.scale.y = Math.min( SYMBOL_SIZE / s.texture.width, SYMBOL_SIZE/s.texture.height);
					s.x = Math.round((SYMBOL_SIZE - s.width)/2);
				}
			}
		}
	});
}

//Very simple tweening utility function. This should be replaced with a proper tweening library in a real product.
var tweening = [];
function tweenTo(object, property, target, time, easing, onchange, oncomplete)
{
	var tween = {
		object:object,
		property:property,
		propertyBeginValue:object[property],
		target:target,
		easing:easing,
		time:time,
		change:onchange,
		complete:oncomplete,
		start:Date.now()
	};
	
	tweening.push(tween);
	return tween;
}
// Listen for animate update.
app.ticker.add(function(delta) {
	var now = Date.now();
	var remove = [];
	for(var i = 0; i < tweening.length; i++)
	{
		var t = tweening[i];
		var phase = Math.min(1,(now-t.start)/t.time);
		
		t.object[t.property] = lerp(t.propertyBeginValue, t.target, t.easing(phase));
		if(t.change) t.change(t);
		if(phase == 1)
		{
			createjs.Sound.play(reelStopSound);
			t.object[t.property] = t.target;
			if(t.complete)
				t.complete(t);
			remove.push(t);
		}
	}
	for(var i = 0; i < remove.length; i++)
	{
		tweening.splice(tweening.indexOf(remove[i]),1);
	}
});

//Basic lerp funtion.
function lerp(a1,a2,t){
	return a1*(1-t) + a2*t;
}

//Backout function from tweenjs.
//https://github.com/CreateJS/TweenJS/blob/master/src/tweenjs/Ease.js
backout = function(amount) {
		return function(t) {
			return (--t*t*((amount+1)*t + amount) + 1);
		};
};
