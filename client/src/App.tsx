import './App.css';
import { w3cwebsocket as W3CWebSocket } from "websocket";
import { useState, useEffect } from 'react';
import { TransactionData } from './types/TransactionData';
import Transaction from './components/Transaction';

let client: any;

try {
    client = new W3CWebSocket('ws://127.0.0.1:5000');
} catch (e) {
    console.log(e);
}

function App() {

    const [transactions, setTransactions] = useState([] as TransactionData[]);

    const appendTransaction = (transactionData: TransactionData) => {
        setTransactions([...transactions, transactionData]);
    }

    useEffect(() => {
        if (client) {
            client.onopen = () => {
                console.log('WebSocket Client Connected');
            };

            client.onmessage = (message: { data: string }) => {
                const dataFromServer: {
                    data: TransactionData;
                    type: string;
                } = JSON.parse(message.data);
                appendTransaction(dataFromServer.data);
            };
        }
    }, [transactions]);

    return (
        <div className="App">
            <div className='container'>
                <h1>Transactions</h1>
                <br />
                <div>
                    {
                        transactions.map((transactionData) => {
                            return <Transaction 
                                        key={transactionData.hash} 
                                        transactionData={transactionData} />
                        })
                    }
                </div>
            </div>
        </div>
    );
}

export default App;
