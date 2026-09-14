import { BitcoinTransaction } from "../services/bitcoinFeed";

interface TransactionTableProps {
  transactions: BitcoinTransaction[];
  title?: string;
  subtitle?: string;
  showWhaleOnly?: boolean;
  onToggleWhaleOnly?: () => void;
  limit?: number;
}

export default function TransactionTable({
  transactions,
  title = "Live Transactions",
  subtitle = "Incoming Bitcoin transactions",
  showWhaleOnly = false,
  onToggleWhaleOnly,
  limit,
}: TransactionTableProps) {
  const filteredTransactions = transactions
    .filter((tx) => (showWhaleOnly ? tx.whale : true))
    .slice(0, limit || transactions.length);

  return (
    <div id="transaction-panel" className="panel">
      <div className="panel-header">
        <div>
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>

        <div className="flex items-center gap-3">
          {onToggleWhaleOnly && (
            <button
              id="filter-whale-btn"
              onClick={onToggleWhaleOnly}
              className={`text-xs px-3 py-1.5 rounded-md border transition-colors ${
                showWhaleOnly
                  ? "bg-amber-500/20 text-amber-400 border-amber-500/40"
                  : "bg-[#1c2030] text-[#94a3b8] border-[#2d3748] hover:text-white"
              }`}
            >
              🐋 Whale Filter: {showWhaleOnly ? "ON" : "OFF"}
            </button>
          )}

          <div className="live-badge">
            <span className="live-dot"></span>
            LIVE
          </div>
        </div>
      </div>

      <div className="transaction-table">
        <div className="table-row table-header">
          <span>Transaction</span>
          <span>Amount</span>
          <span>Fee</span>
          <span>Status</span>
        </div>

        {filteredTransactions.length === 0 ? (
          <div className="p-8 text-center text-[#94a3b8] text-sm">
            No transactions found matching current criteria.
          </div>
        ) : (
          filteredTransactions.map((tx, index) => (
            <TransactionRow
              key={`${tx.id}-${index}`}
              id={tx.id}
              amount={tx.amount}
              fee={tx.fee}
              whale={tx.whale}
              status={tx.status}
            />
          ))
        )}
      </div>
    </div>
  );
}

interface TransactionRowProps {
  key?: string;
  id: string;
  amount: string;
  fee: string;
  whale?: boolean;
  status?: string;
}

export function TransactionRow({
  id,
  amount,
  fee,
  whale,
  status = "Pending",
}: TransactionRowProps) {
  return (
    <div className="table-row">
      <span className="tx-id">
        {id}
        {whale && <span className="whale-tag">🐋 WHALE</span>}
      </span>

      <span className={whale ? "font-semibold text-amber-300" : ""}>
        {amount}
      </span>

      <span className="text-[#94a3b8]">{fee}</span>

      <span className="status">
        <span className="status-dot"></span>
        {status}
      </span>
    </div>
  );
}
