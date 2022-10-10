import express from 'express';
import http from 'http';
import { server as webSocketServer } from 'websocket';
import Web3 from 'web3';

interface TransactionData { 
    to: string; 
    from: string; 
    amount: string;
    hash: string;
    timestamp: number;
    type: string;
}

const app = express();

const server = http.createServer(app);

const wsClients: any = {};

server.listen(5000);

const wss = new webSocketServer({
    httpServer: server
});

const addressOfConcern = '0xf322487D9b30aCaC92c911126cc538818e3BCA28';

const web3 = new Web3(new Web3.providers.WebsocketProvider('wss://goerli.infura.io/ws/v3/28dbd792fbc145c9bce158a8cc8bfc92'));

wss.on('request', (request) => {
    var userID = getUniqueID();
    console.log((new Date()) + ' Recieved a new connection from origin ' + request.origin + '.');

    const connection = request.accept(null, request.origin);
    wsClients[userID] = connection;
    console.log('Connected: ' + userID + ' in ' + Object.getOwnPropertyNames(wsClients));
});

web3.eth.subscribe('newBlockHeaders', function(error, result){
    if (error) {
        console.log('Subscription Failed: ', error);
    }
}).on("connected", (result) => {
    console.log('Subscription connected: ', result);
})
.on("data", async (blockHeader) => {
    const blockNumber = blockHeader.number;
    const { transactions, timestamp } = await web3.eth.getBlock(blockNumber);

    transactions.forEach(async (transactionHash) => {
        const { from, to, value } = await web3.eth.getTransaction(transactionHash);
        const txnAmount = web3.utils.fromWei(value, 'ether');

        if(from && to && from === addressOfConcern || to === addressOfConcern) {
            console.log('Transaction Made: ', txnAmount);
            broadcastTransaction({
                from: from,
                to: to,
                amount: txnAmount,
                hash: transactionHash,
                timestamp: parseInt(timestamp.toString()),
                type: (from === addressOfConcern) ? 'send' : 'receive'
            })
        }
    });
});


const getUniqueID = () => {
    const s4 = () => Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    return s4() + s4() + '-' + s4();
};

const broadcastTransaction = (txnData: TransactionData) => {
    for(let key in wsClients) {
        wsClients[key].sendUTF(JSON.stringify({
            type: 'TRANSACTION_NOTIFICATION',
            data: txnData
        }));
    }
}

console.log('Server Started');