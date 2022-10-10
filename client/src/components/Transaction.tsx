import { TransactionData } from "../types/TransactionData";

const Transaction = (props: { transactionData: TransactionData }) => {
    const { transactionData } = props;
    const { to, from, amount, hash, timestamp, type } = transactionData;

    const explorerUrl = `https://goerli.etherscan.io/tx/${hash}`;

    const cardStyle = `card card-${type}`;

    return (
        <div className={cardStyle}>
            <div className="card-body">
                <h5 className="card-title">
                    <a href={explorerUrl}>{hash}</a>
                </h5>
                <h6 className="card-subtitle mb-2 text-muted">
                    {(new Date(timestamp*1000)).toDateString()}
                </h6>
                <div>From: {from}</div>
                <div>To: {to}</div>
                <br />
                <div>
                    <h6 className={type}>
                        { type === 'send' ? '-' : '+' }
                        {amount} ETH
                    </h6>
                </div>
            </div>
        </div>
    )
}

export default Transaction;