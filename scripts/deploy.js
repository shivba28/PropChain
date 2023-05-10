
const hre = require("hardhat");

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), 'ether')
}

async function main() {
  // Setup accounts
  const [buyer, seller, inspector, lender] = await ethers.getSigners();

  // Deploy Real Estate
  const RealEstate = await ethers.getContractFactory('RealEstate')
  const realEstate = await RealEstate.deploy()
  await realEstate.deployed()

  console.log(`Deployed Real Estate Contract at: ${realEstate.address}`)
  console.log(`Minting 6 properties...\n`)

  for (let i = 0; i < 6; i++) {
    const transaction = await realEstate.connect(seller).mint(`https://ipfs.io/ipfs/QmPLzmaN1N8KsHHCsVuzryjJobheJnEmNKU6cFdoANpcN4/${i + 1}.json`)
    await transaction.wait()
  }

  // Deploy Escrow
  const Escrow = await ethers.getContractFactory('Escrow')
  const escrow = await Escrow.deploy(
    realEstate.address,
    seller.address,
    inspector.address,
    lender.address
  )
  await escrow.deployed()

  console.log(`Deployed Escrow Contract at: ${escrow.address}`)
  console.log(`Listing 6 properties...\n`)

  for (let i = 0; i < 6; i++) {
    // Approve properties...
    let transaction = await realEstate.connect(seller).approve(escrow.address, i + 1)
    await transaction.wait()
  }

  // Listing properties...
  transaction = await escrow.connect(seller).list(1, buyer.address, tokens(20), tokens(10))
  await transaction.wait()

  transaction = await escrow.connect(seller).list(2, buyer.address, tokens(15), tokens(5))
  await transaction.wait()

  transaction = await escrow.connect(seller).list(3, buyer.address, tokens(10), tokens(5))
  await transaction.wait()
  
  transaction = await escrow.connect(seller).list(4, buyer.address, tokens(10), tokens(2))
  await transaction.wait()

  transaction = await escrow.connect(seller).list(5, buyer.address, tokens(20), tokens(4))
  await transaction.wait()

  transaction = await escrow.connect(seller).list(6, buyer.address, tokens(35), tokens(8))
  await transaction.wait()

  console.log(`Finished.`)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
