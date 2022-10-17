import { ethers } from "./ethers-5.6.esm.min.js"
import { contractAddress, abi } from "./constants.js"

const connectButton = document.getElementById("connectButton")
const fundButton = document.getElementById("fundButton")
const balanceButton = document.getElementById("balanceButton")
const withdrawButton = document.getElementById("withdrawButton")
connectButton.onclick = connect
fundButton.onclick = fund
balanceButton.onclick = getBalance
withdrawButton.onclick = withdraw

async function connect() {
	if (typeof window.ethereum != "undefined") {
		await window.ethereum.request({ method: "eth_requestAccounts" })
		connectButton.innerHTML = "Connected!!"
	} else {
		connectButton.innerHTML = "Please install metamask."
	}
}

async function fund() {
	const ethAmount = document.getElementById("ethAmount").value
	console.log(`Funding with ${ethAmount}...`)
	if (typeof window.ethereum != "undefined") {
		// how to send tx
		// need provider / connection to blockchain
		// signer / wallet for gas
		// contract so ABI and Address
		const provider = new ethers.providers.Web3Provider(window.ethereum)
		const signer = provider.getSigner()
		const contract = new ethers.Contract(contractAddress, abi, signer)

		try {
			const txResponse = await contract.fund({
				value: ethers.utils.parseEther(ethAmount),
			})
			await listenForTransactionMine(txResponse, provider)
			console.log("Done!")
		} catch (error) {
			console.log(error)
		}
	}
}

function listenForTransactionMine(txResponse, provider) {
	console.log(`Mining ${txResponse.hash}...`)
	return new Promise((resolve, reject) => {
		provider.once(txResponse.hash, (txReceipt) => {
			console.log(
				`Completed with ${txReceipt.confirmations} confirmations`
			)
			resolve()
		})
	})
}

async function getBalance() {
	if (typeof window.ethereum != "undefined") {
		const provider = new ethers.providers.Web3Provider(window.ethereum)
		const balance = await provider.getBalance(contractAddress)
		console.log(ethers.utils.formatEther(balance))
	}
}

async function withdraw() {
	if (typeof window.ethereum != "undefined") {
		console.log("Withdrawing...")
		const provider = new ethers.providers.Web3Provider(window.ethereum)
		const signer = provider.getSigner()
		const contract = new ethers.Contract(contractAddress, abi, signer)

		try {
			const checker = await contract.getOwner()
			console.log(checker)
			const txResponse = await contract.withdraw()
			await listenForTransactionMine(txResponse, provider)
			console.log("Done!")
		} catch (error) {
			console.log(error)
		}
	}
}
