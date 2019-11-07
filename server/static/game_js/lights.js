module.exports = class Lights {
	constructor(){
		this.lights = [];
	}
	addLight(light){
		this.lights.push(light);
	}
	reInitLights(){
		this.lights = [];
	}
	getLights(){
		return this.lights;
	}

}
