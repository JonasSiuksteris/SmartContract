const Marketplace = artifacts.require('./Marketplace.sol')

require('chai')
	.use(require('chai-as-promised'))
	.should()

contract('Marketplace', ([deployer, seller, buyer]) => {
  let marketplace

  before(async () => {
    marketplace = await Marketplace.deployed()
  })

  describe('deployment', async () => {
    it('deploys successfully', async () => {
      const address = await marketplace.address
      assert.notEqual(address, 0x0)
      assert.notEqual(address, '')
      assert.notEqual(address, null)
      assert.notEqual(address, undefined)
    })

    it('has a name', async () => {
      const name = await marketplace.name()
      assert.equal(name, 'ECorp Marketplace')
    })
  })
  
  
   describe('products', async () => {
	   let result,productCount
	   
	   before(async () => {
		  result = await marketplace.createProduct('Iphone 3310', web3.utils.toWei('1', 'Ether'), { from: seller })
		  productCount = await marketplace.productCount()
	   })

    it('creates products', async () => {
	  //Success
      assert.equal(productCount, 1)
	  const event = result.logs[0].args
	  assert.equal(event.id.toNumber(), productCount.toNumber(), 'id is correct')
	  assert.equal(event.name, 'Iphone 3310' , 'name is correct')
	  assert.equal(event.price , '1000000000000000000' , 'price is correct')
	  assert.equal(event.owner, seller , 'is correct')
	  assert.equal(event.purchased, false , 'purchase is correct')
	  
	  //Failure
	  await await marketplace.createProduct('', web3.utils.toWei('1', 'Ether'), { from: seller }).should.be.rejected;

	  await await marketplace.createProduct('Iphone 3310', 0 , { from: seller }).should.be.rejected;
    })
	it('lists products', async () => {
	  const product = await marketplace.products(productCount)
	  assert.equal(product.id.toNumber(), productCount.toNumber(), 'id is correct')
	  assert.equal(product.name, 'Iphone 3310' , 'name is correct')
	  assert.equal(product.price , '1000000000000000000' , 'price is correct')
	  assert.equal(product.owner, seller , 'is correct')
	  assert.equal(product.purchased, false , 'purchase is correct')
	})
	
	it('sells products', async () => {
	  //Track seller balance before purchase
	  let oldSellerBalance
	  oldSellerBalance = await web3.eth.getBalance(seller)
	  oldSellerBalance = new web3.utils.BN(oldSellerBalance)

		
	  // Success - buys products
	  result = await marketplace.purchaseProduct(productCount, { from: buyer, value: web3.utils.toWei('1', 'Ether')})
	
	  //Check logs
	  const event = result.logs[0].args
	  assert.equal(event.id.toNumber(), productCount.toNumber(), 'id is correct')
	  assert.equal(event.name, 'Iphone 3310' , 'name is correct')
	  assert.equal(event.price , '1000000000000000000' , 'price is correct')
	  assert.equal(event.owner, buyer , 'is correct')
	  assert.equal(event.purchased, true , 'purchase is correct')
	  
	  //Seller received funds
	  let newSellerBalance
	  newSellerBalance = await web3.eth.getBalance(seller)
	  newSellerBalance = new web3.utils.BN(newSellerBalance)
	  
	  let price
	  price = web3.utils.toWei('1', 'Ether')
	  price = new web3.utils.BN(price)
	
	  const expectedBalance = oldSellerBalance.add(price)
	  
	  assert.equal(newSellerBalance.toString(), expectedBalance.toString())
	  
	  // FAILURE:
	  //Buyin non-existant product(valid id)
	  await marketplace.purchaseProduct(99, { from: buyer, value: web3.utils.toWei('0.5', 'Ether')}).should.be.rejected;

	  //Not enough ether
	  await marketplace.purchaseProduct(productCount, { from: buyer, value: web3.utils.toWei('1', 'Ether')}).should.be.rejected;
	  
	  //Tries to purchase same product twice
	  await marketplace.purchaseProduct(productCount, { from: deployer, value: web3.utils.toWei('1', 'Ether')}).should.be.rejected;
	  
	  //Buyer tries to buy his product
	  await marketplace.purchaseProduct(productCount, { from: buyer, value: web3.utils.toWei('1', 'Ether')}).should.be.rejected;
	
	})
  }) 
})