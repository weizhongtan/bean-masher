//--------------- HELPER FUNCTIONS --------------//
function load(str) {
	if (localStorage.getItem(str)) {
		return Number(localStorage.getItem(str));
	} else {
		return 0;
	}
}

function save(str, val) {
	localStorage.setItem(str, val);
}

function $id(id) {
	return document.getElementById(id);
}

// converts a number to a comma-separated number ie 1000 = 1,000
function cn(number) {
	temp = number.toString();
	var str = "";
	while (temp.length > 3) {
		str = "," + temp.substring(temp.length - 3) + str;
		temp = temp.substring(0, temp.length - 3)
	}
	str = temp + str;
	return str;
}

//--------------- Game variables --------------//
var beans, bps;
var UpgradesBought = {};

////////////////// manual reset
// save("_fingers", 10)
// save("_spoons", 10)
// save("_beans", 4561)
// save("_hammers", 10)

//--------------- Upgrades --------------//
var Finger = new Upgrade("_fingers", "Finger", "fingers", "A finger will poke quite slowly.", 0.1, 10, 0.6);
var Spoon = new Upgrade("_spoons", "Spoon", "spoons", "A flat spoon is dece.", 1, 150, 0.6);
var Hammer = new Upgrade("_hammers", "Hammer", "hammers", "These can do some serious damage.", 5, 800, 0.6);
var Chainsaw = new Upgrade("_chainsaws", "Chainsaw", "chainsaws", "This is beyond mashing.", 20, 2000, 0.6);

var possibleUpgrades = [Finger, Spoon, Hammer, Chainsaw];

function Upgrade(localStorageId, name, plural, description, bps, basePrice, priceMultiplier) {
	this.localStorageId = localStorageId;
	this.name = name;
	this.plural = plural
	this.description = description;
	this.bps = bps;
	this.basePrice = basePrice;
	this.priceMultiplier = priceMultiplier;
	this.animationTime = Math.floor(1000 / this.bps);
}

//--------------- Button Event Listener Functions --------------//
function BuyUpgrade(upgrade, buyThisMany) {
	var name = upgrade.plural;
	// if the upgrade hasnt been bought before,
	if (!UpgradesBought.hasOwnProperty(name)) UpgradesBought[name] = {number: 0, bps: upgrade.bps, animationTime: upgrade.animationTime};
	var currentPrice = Math.floor(upgrade.basePrice * upgrade.priceMultiplier * (UpgradesBought[name].number+1));
	if (beans >= currentPrice) {
		beans -= currentPrice;
		UpgradesBought[name].number += buyThisMany;
		$id("animation-holder").innerHTML = "";
		LoadAnimations();
	} else {
		console.log("not enough money")
	}
	UpdateShop();
}

function ClickBean(beanClickRate) {
	beans += Number(beanClickRate);
	var el = document.createElement("div");
	el.className = "bean-animate";
	el.style.position = "absolute";
	el.style.left = event.clientX - 190 + 'px';
	el.style.top = event.clientY - 150 + 'px';
	$id("bean-animation-holder").appendChild(el);
	setTimeout(function() {
		$id("bean-animation-holder").removeChild(el);
	}, 400)
}

//--------------- Mashing Beans --------------//
function CalculateBps() {
	bps = 0;
	for (var upgrade in UpgradesBought) {
		bps += (UpgradesBought[upgrade].bps * UpgradesBought[upgrade].number);
	}
}

T = 60000;
function Main() {
	// calculate new bps based on bought stuff
	CalculateBps();
	beans += bps/30;
	$id("beans-mashed").innerHTML = cn(Math.floor(Number(beans)));
	$id("bps").innerHTML = (Number(bps) > 1000) ? cn(Math.floor(Number(bps))) : Math.floor(Number(bps)*10)/10;
	
	UpdateShop();
	
	// save the game every minute
	T--;
	if (T == 0) {
		save("_beans", beans);
		possibleUpgrades.forEach(function(upgrade) {
			save(upgrade.localStorageId, UpgradesBought[upgrade.plural].number)
		})
		T = 60000;
		console.log("game saved")
	}

	setTimeout(Main, 1000/30);
}

//--------------- HTML render and update --------------//
function RenderUpgrade(upgrade) {
	var view = {
		name: upgrade.name,
		name_plural: upgrade.plural,
		desc: upgrade.description,
		price: Math.floor(upgrade.basePrice * upgrade.priceMultiplier * (UpgradesBought[upgrade.plural].number+1)),
		cnprice: function() {
			return cn(this.price)
		},
		bps: upgrade.bps,
		number: UpgradesBought[upgrade.plural].number,
		classes: function() {
			return (this.price < beans) ? "btn-upgrade" : "btn-upgrade cant-afford";
		},
		s: function() {
			return (this.bps != 1) ? "s" : "";
		}
	};
	return Mustache.render($id("upgrade-template").innerHTML, view);
}

function UpdateShop() {
	var str = "";
	possibleUpgrades.forEach(function(element) {
		var temp = RenderUpgrade(element);
		str = str + temp;
	});
	$id("upgrades-list").innerHTML = str;
}

//--------------- Load saved data --------------//
function LoadPreviousGame() {
	beans = load("_beans");
	possibleUpgrades.forEach(function(element) {
		UpgradesBought[element.plural] = {number: Number(load(element.localStorageId)), bps: element.bps, animationTime: element.animationTime}
	});
}

LoadPreviousGame();

//--------------- Load animations --------------//
function LoadAnimations() {
	for (let thing in UpgradesBought) {
		let num = UpgradesBought[thing].number;
		let count = 0;
		for (let i = 0; i < num; i++) {
			let el = document.createElement("div");
			el.className = thing;
			el.style.animationDelay = - count/num * UpgradesBought[thing].animationTime + "ms";
			var random_angle = Math.random() * 2 * Math.PI;
			el.style.top = 300 + (300 * Math.sin(random_angle)) + "px";
			el.style.left = 300 + (300 * Math.cos(random_angle)) + "px";
			el.style.transform = "rotate(" + (random_angle + Math.PI) + "rad)";
			count++;
			$id("animation-holder").appendChild(el);
		}
	}
}

LoadAnimations()

//--------------- Start the game --------------//
Main();