const MongoClient = require('mongodb').MongoClient

MongoClient.connect('mongodb+srv://admin:admin@fruitsalad.8eeyqzf.mongodb.net/?retryWrites=true&w=majority&appName=FruitSalad')
.then((client) => {
db = client.db('FruitSalad')
coll = db.collection('gamedetails')
})
.catch((error) => {
console.log(error.message)
})



var joinGame = function(gameData){
    return new Promise((resolve,reject) =>{
    
        // Inserts item into collection 
        coll.insertOne(gameData)
        .then((documents) => {
            // Resolve promise
            resolve(documents)
        })
        // Reject promise if error
        .catch((error) => {
            reject(error)
        })
    })
}

module.exports = {joinGame}