const Blockchain = require('./blockchain')
const { validationResult } = require('express-validator/check')

class Shitcoin {
  constructor () {
    this.blockchain = new Blockchain()

    this.getChain = this.getChain.bind(this)
    this.mine = this.mine.bind(this)
    this.newTransaction = this.newTransaction.bind(this)
    
  }

  getChain (req, res, next) {
    req.responseValue = {
      message: 'Get blockchain',
      blockchain: this.blockchain.chain
    }
    return next()
  }

  mine (req, res, next) {
    const lastBlock = this.blockchain.lastBlock()
    const lastNonce = lastBlock.nonce
    const nonce = this.blockchain.proofOfWork(lastNonce)

    // Create a new transaction with from 0 (this node) to our node (NODE_NAME) of 1 shitcoin
    this.blockchain.newTransaction('0', process.env.NODE_NAME, 1)

    // Forge the new Block by adding it to the chain
    const previousHash = this.blockchain.hash(lastNonce)
    const newBlock = this.blockchain.newBlock(nonce, previousHash)

    const responseValue = Object.assign({
      message: 'New Block has been mined'
    }, newBlock)
    req.responseValue = responseValue
    return next()
  }

  newTransaction (req, res, next) {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.mapped() })
    }
    const trans = req.body
    const index = this.blockchain.newTransaction(trans['sender'], trans['recipient'], trans['amount'])
    const responseValue = {
      message: `Transaction will be added to Block ${index}`
    }
    req.responseValue = responseValue
    return next()
  }
}

module.exports = new Shitcoin()
