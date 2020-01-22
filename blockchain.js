/**
 * Node app
 * Blockchain with node-js
 * *******************************************
 * Author   : Loris Levêque
 * Date     : 17.01.2020
 * *******************************************
 * Description : Simple blockchain with nodejs
 * *******************************************
 */
var express 	= require('express');
var bodyParse	= require('body-parser');
var fs 			= require('fs');
var cron 		= require('node-cron');
var os          = require('os');


var Block = /** class */ (function() {
	var _this = this;
	function Block(id, data, timestamp, hash, previousHash) {
		_this.id = id;
		_this.data = data;
		_this.timeStamp = timeStamp;
		_this.hash = hash;
		_this.previousHash = previousHash;
	}
	return Block;
}());
var Hasher = /** @class */ (function () {
    function Hasher() {
        var _this = this;
        this.NBCHAR = 20;
        this.STARTUP = "$21%";
        this.isLastIndex = function (index, array) {
            if (index == array.length - 1)
                return true;
            else
                return false;
        };
        this.addSecondPart = function (firstPart, secondPart) {
            var output = "";
            var valueToAdd = 0;
            for (var index = 0; index < secondPart.length; index++) {
                valueToAdd += (secondPart).charCodeAt(index);
            }
            for (var index = 0; index < _this.NBCHAR; index++) {
                var charcode = (firstPart.charCodeAt(index) + (valueToAdd % index));
                if (charcode > 126)
                    output += String.fromCharCode((charcode % 30) + 33);
                else
                    output += String.fromCharCode(charcode);
            }
            return output;
        };
        this.isNull = function (input) {
            if (input == null)
                return true;
            else
                return false;
        };
        this.isUndefined = function(input) {
        	if (input == "undefined")
        		return true;
        	else
        		return false;
        };
        this.createHash = function (input, buffer) {
            var output;
            var arrayToInt = _this.convertArrayToInt(input);
            var arrayCrypted = _this.NlogNOne(arrayToInt);
            output = _this.convertArrayToInt(_this.STARTUP + _this["finally"](_this.convertArrayToString(arrayCrypted)));
            if (!this.isUndefined(buffer))
            	buffer.set(output);
            return _this.convertArrayToString(output);
        };
        this.convertArrayToInt = function (array) {
            var output = [];
            for (var index = 0; index < array.length; index++) {
                output[index] = (array).charCodeAt(index);
            }
            return output;
        };
        this.convertArrayToString = function (array) {
            var output = "";
            array.map(function (cell) {
                while (cell < 32) {
                    cell *= 2;
                }
                output += String.fromCharCode(cell);
            });
            return output;
        };
        this.convertArrayStringToString = function (array) {
            var output;
            array.forEach(function (cell) {
                output += cell;
            });
            return output;
        };
        /**
         * Basically a function that return an array of N log N+1
         * @type {function}
         * @param {array :number[]}
         */
        this.NlogNOne = function (array) {
            var output = [];
            for (var index = 0; index < array.length; index++) {
                if (!_this.isLastIndex(index, array)) {
                    output[index] = array[index] % array[index + 1];
                }
                else {
                    output[index] = array[index];
                }
            }
            return output;
        };
        this["finally"] = function (input) {
            var output = "";
            while (output.length < (_this.NBCHAR + 1)) {
                output += input;
            }
            var firstPart = output.substr(0, _this.NBCHAR);
            var secondPart = output.substr(_this.NBCHAR, output.length);
            return _this.addSecondPart(firstPart, secondPart);
        };
        this.clone = function () {
            return new Hasher();
        };
    }
    return Hasher;
}());
var BufferData = (function() {
	function BufferData() {
		this.data = null;
	}
	BufferData.prototype.set = (value) => {
		this.data = value;
	}
	BufferData.prototype.get = () => {
		return this.data;
	}
	return BufferData;
}()):
var BufferBlock = (function() {
	function BufferBlock() {
		this.block = null;
	}
	BufferData.prototype.set = (value) => {
		this.block = value;
		return appendBlock(this.block);
	}
	return BufferBlock;
}());

function generateGenesis() {
	var timestamp = new Date().getTime() / 1000;
	var hash = hasher.calculateHash("genesisblock");
	return new Block(0, "GENESIS BLOCK!", timestamp, hash, "0");
}
function generateNextBlock(id, data, timestamp, hash, previousHash) {
	// id - data - timestamp - hash - previous hash
	return new Block(id, data, timestamp, hash, previousHash);
}
function createBlock(data) {
	const LASTBLOCK = getLastBlock();
	var timestamp = new Date().getTime() / 1000;
	var nextId = LASTBLOCK.id + 1;
	hasher.calculateHash(`${nextId}-${LASTBLOCK.hash}-${timestamp}-${data}`, bufferData);
	generateNextBlock(nextId, data, timestamp, bufferData.get(), LASTBLOCK.hash);
}
function getLastBlock() {
	return blockchain[blockchain.length - 1];
}
function getGenesisBlock() {
	return blockchain[0];
}
function appendBlock(block) {
	blockchain.push(block);
}

var bufferData = new BufferData();
var hasher = new Hasher();

var blockchain = [generateGenesis()];

function isBlockValid(block, previousBlock) {
	if (block.id != previousBlock.id - 1) {
		console.log("id incorrect");
		return false;
	} else if (block.previousHash != previousBlock.hash) {
		console.log("previous hash incorrect");
		return false;
	} else {
		console.log("block correct");
		return true;
	}
}
function isHashCorrect(block, hash) {
	if (hasher.createHash(`${block.id}-${block.previousHash}-${block.timestamp}-${block.data}`) !== hash) {
		return true;
	} else {
		return false;
	}
}
function isChainValid(chain) {
	foreach(block in chain) {
		if (!isBlockValid(block) || !isHashCorrect(block, block.hash))
			return false;
	}
	return true;
}
function replaceChain(newChain) {
	if (isChainValid(newChain) && newChain.length > blockchain.length) {
		blockchain = newChain;
		// broadcast informations
		// idk why, but i have to do it
	} else {
		return;
	}  
}
function save() {
	const obj = {
		timestamp: new Date().getTime() / 1000,
		chain: blockchain
	}
	fs.writeFile("save.json", JSON.stringify(obj), (err) => {
		if (err)
			throw(err)
	})
}
function getLocalIp() {
    var interfaces  = os.networkInterfaces();
    Object.keys(interfaces).forEach((interface_name) => {
        interfaces[interface_name].forEach((iface) => {
            // use only IPv4
            if (iface.family === "IPv4") {
                // use wi-fi before eth
                if (interface_name === "wlp3s0") {
                    return iface.address;
                } else {
                    return iface.address;
                }
            }
        })
    }
}

// save every hour
cron.schedule("0 * * * *", () => {
	save();
});

var app = express();
// draw chain with a webpage
var router = express.Router();
express.use(router);
router.use((request, response, next) => {
	// middleware
	next();
});
router.get('/', (request, response) => {
	response.writeHead(200, {'Content-Type': 'text/plain'});
	response.write(blockchain.toString());
	response.end();
});
app.listen("8080", getLocalIp(), (err) => {
    if (err)
        throw(err)
});