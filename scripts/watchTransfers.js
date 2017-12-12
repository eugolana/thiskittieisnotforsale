let cryptoCatCore = web3.eth.contract(abi);
const cryptoCoreAddress = '0x06012c8cf97BEaD5deAe237070F9587f8E7A266d';
let catInstance = cryptoCatCore.at(cryptoCoreAddress);
const imageBaseUrl = "https://storage.googleapis.com/ck-kitty-image/0x06012c8cf97bead5deae237070f9587f8e7a266d/";

let catStack = []

function watchLatestForTransfers() {
	catInstance.Transfer({'fromBlock': 'latest'}, function(err, res) {
		if (!err){
			let catId = res.args.tokenId.c[0].toFixed()
			catInstance.getKitty(catId, function(err, cat) {
				if (!err) {
					cat.push(catId);
					catStack.push(cat);
				}
			})
		}
	})
}

window.onload = function() {
	if (web3 === 'undefined' || web3.version.network != 1) {
		let warning = document.createElement('div');
		warning.id = 'warning'
		let p = document.createElement('p');
		p.innerText = 'You need to have metamask installed and running on the Ethereum mainnet to get real time cat trade data.'
		warning.appendChild(p)
		document.getElementsByTagName('main')[0].appendChild(warning)

	} else {
		watchLatestForTransfers();

		web3.eth.filter('latest', function(err, res) {
			console.log('got block')
			if (!err) {
				watchLatestForTransfers()
			}
		})
	}
}
