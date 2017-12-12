let osc = [];
let catIms = []

let audioContext = new (window.AudioContext || window.webkitAudioContext);

setInterval(function(){
	if (catIms.length > 20) {
		let id = catIms.pop();
		document.getElementById(id).remove()
		stopAll(osc.pop());

	}
	if (catStack.length > 0) {
		setTimeout( function() {
			let cat = catStack.pop();
			let catId = cat[10];
			let genes = cat[9].c;

			let imUrl = imageBaseUrl + catId + ".svg";
			let imageEl = document.createElement('img');
			imageEl.id = catId;
			imageEl.classList.add('catPic');
			imageEl.setAttribute('data-y', Math.floor(200 + Math.random() * 400));
			imageEl.src = imUrl;
			imageEl.width = "300"
			imageEl.height = "300"

			imageEl.onload = function() {
				let volume = 0.1 + parseGene(genes[0]) / 3;
				let stretch = 0.5 + parseGene(genes[1]) ;
				let pitch = 0.5 + parseGene(genes[2]);
				let shift = parseGene(genes[3]) /3
				osc.push( meow(0.3, stretch, pitch, shift));
				catIms.push(catId)
			}

			imageEl.onerror = function(el){
				el.target.remove();
			}

			document.getElementsByTagName('main')[0].appendChild(imageEl)
		}, Math.random() * 100)
	}
}, 15000/4)



// Simplify getting value frm gene. Take modulo of 99
function parseGene(geneNum){
	if (!geneNum) {
		return Math.random();
	}
	geneNum  %= 99;
	geneNum /= 100;

	return geneNum + 0.0001
}



function meow(volume, stretch, pitch, shift) {
	
	let fundamental = 800
	let now = audioContext.currentTime
	
	let filter = audioContext.createBiquadFilter()
	filter.frequency = fundamental * pitch / 1.5;
	filter.gain = 50;
	filter.Q = 12;
	filter.connect(audioContext.destination)

	let gain1 = getEnv(volume, stretch)
	gain1.connect(filter)

	let osc1 = getOsc(fundamental, 1, stretch, pitch, shift);
	osc1.connect(gain1);

	let gain2 = getEnv(volume/2, stretch)
	gain2.connect(filter)
	let osc2 = getOsc(fundamental, 2, stretch, pitch, shift);
	osc2.connect(gain2)

	let gain3 = getEnv(volume/4, stretch)
	gain3.connect(filter)
	let osc3 = getOsc(fundamental, 4, stretch, pitch, shift);
	osc3.connect(gain3)	

	osc1.start()
	osc2.start()
	// osc3.start()
	return [ osc1,  osc2, osc3]
}

function stopAll(oscList){
	for (var i = 0; i < oscList.length; i++) {
		oscList[i].stop();
	}
}

function getOsc(fundamental, octave, stretch, pitch, shift) {
	let osc = audioContext.createOscillator();
	let now = audioContext.currentTime
	osc.type = 'triangle'
	osc.frequency.value = fundamental * pitch * octave
	osc.frequency.setValueAtTime(osc.frequency.value , now)	
	osc.frequency.linearRampToValueAtTime(fundamental * (1 + shift) *octave * pitch, now + 0.1 * stretch)
	osc.frequency.exponentialRampToValueAtTime(fundamental * pitch * octave, now + 0.3 * stretch)
	osc.frequency.linearRampToValueAtTime(fundamental * (1 - shift) * octave * pitch, now + 1.0 * stretch)
	return osc
}

function getEnv(volume, stretch) {
	let gain = audioContext.createGain();
	let now = audioContext.currentTime

	gain.connect(audioContext.destination)
	gain.gain.value = 0.0
	gain.gain.setValueAtTime(gain.gain.value, now);
	gain.gain.linearRampToValueAtTime(0.5 * volume, now + (0.3 * stretch) )
	gain.gain.linearRampToValueAtTime(0.0, now + 0.8 * stretch )
	return gain
}

