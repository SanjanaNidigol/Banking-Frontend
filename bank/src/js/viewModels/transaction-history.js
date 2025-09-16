
define([
  'ojs/ojcore',
  'knockout',
  'ojs/ojarraydataprovider',
  'ojs/ojtable'
], function (oj, ko, ArrayDataProvider) {
  function TransactionHistoryViewModel() {
    var self = this;

    // Observables
    self.userId = ko.observable(sessionStorage.getItem("userId")); 
    self.fromAccountId = ko.observable();
    self.transactions = ko.observableArray([]);

    // DataProvider for oj-table
    self.dataProvider = new ArrayDataProvider(self.transactions, { keyAttributes: 'transactionId' });

    // Fetch user accounts
    self.fetchUserAccounts = function () {
      console.log("🔍 Fetching accounts for userId:", self.userId());
      fetch(`http://localhost:8089/account-service/accounts/user/${self.userId()}`)
        .then(res => res.json())
        .then(accounts => {
          console.log("📌 Accounts API response:", accounts);
          if (accounts && accounts.length > 0) {
            self.fromAccountId(accounts[0].accountId);
            console.log("📌 fromAccountId set to:", self.fromAccountId());
            self.fetchTransactions();
          }
        })
        .catch(err => console.error("❌ Error fetching accounts:", err));
    };

    // Format ISO timestamp to DD-MMM-YYYY HH:mm
    function formatDate(isoString) {
      let date = new Date(isoString);
      let options = {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      };
      return date.toLocaleString('en-GB', options).replace(',', '');
    }

    // Fetch transactions for account
    self.fetchTransactions = function () {
      let accountId = self.fromAccountId();
      if (!accountId) return;

      console.log("🔍 Fetching transactions for accountId:", accountId);
      fetch(`http://localhost:8089/transaction-service/transactions/account/${accountId}`)
        .then(res => res.json())
        .then(data => {
          console.log("📌 Transactions API response:", data);

          // Resolve account numbers for each transaction
          Promise.all(data.map(txn => {
            let isDebit = txn.fromAccountId === self.fromAccountId();
            let amountDisplay = isDebit ? `- ₹${txn.amount.toFixed(2)}` : `+ ₹${txn.amount.toFixed(2)}`;

            // Call API to get account number
            return fetch(`http://localhost:8089/account-service/accounts/${txn.toAccountId}/number`)
              .then(res => res.text())
              .then(accountNumber => ({
                transactionId: txn.transactionId,
                formattedDate: formatDate(txn.timestamp),
                toAccountNumber: accountNumber, // resolved account number
                type: txn.type,
                amount: amountDisplay,
                status: txn.status,
                amountClass: isDebit ? "debit" : "credit"
              }))
              .catch(err => {
                console.error("❌ Error fetching account number:", err);
                return {
                  transactionId: txn.transactionId,
                  formattedDate: formatDate(txn.timestamp),
                  toAccountNumber: txn.toAccountId, // fallback to ID
                  type: txn.type,
                  amount: amountDisplay,
                  status: txn.status,
                  amountClass: isDebit ? "debit" : "credit"
                };
              });
          }))
          .then(formattedData => {
            self.transactions(formattedData);
          });
        })
        .catch(err => console.error("❌ Error fetching transactions:", err));
    };

    // Init
    self.fetchUserAccounts();
  }

  return new TransactionHistoryViewModel();
});

// define([
//   'ojs/ojcore',
//   'knockout',
//   'ojs/ojarraydataprovider',
//   'ojs/ojtable'
// ], function (oj, ko, ArrayDataProvider) {
//   function TransactionHistoryViewModel() {
//     var self = this;

//     // Observables
//     self.userId = ko.observable(sessionStorage.getItem("userId")); // stored session userId
//     self.fromAccountId = ko.observable();
//     self.transactions = ko.observableArray([]);

//     // DataProvider for oj-table
//     self.dataProvider = new ArrayDataProvider(self.transactions, { keyAttributes: 'transactionId' });

//     // Fetch user accounts
//     self.fetchUserAccounts = function () {
//       console.log("🔍 Fetching accounts for userId:", self.userId());
//       fetch(`http://localhost:8089/account-service/accounts/user/${self.userId()}`)
//         .then(res => res.json())
//         .then(accounts => {
//           console.log("📌 Accounts API response:", accounts);
//           if (accounts && accounts.length > 0) {
//             self.fromAccountId(accounts[0].accountId);
//             console.log("📌 fromAccountId set to:", self.fromAccountId());
//             self.fetchTransactions();
//           }
//         })
//         .catch(err => console.error("❌ Error fetching accounts:", err));
//     };

//     // Format ISO timestamp to DD-MMM-YYYY HH:mm
//     function formatDate(isoString) {
//       let date = new Date(isoString);
//       let options = { day: '2-digit', month: 'short', year: 'numeric', 
//                       hour: '2-digit', minute: '2-digit' };
//       return date.toLocaleString('en-GB', options).replace(',', '');
//     }

//     // Fetch transactions for account
//     self.fetchTransactions = function () {
//       let accountId = self.fromAccountId();
//       if (!accountId) return;

//       console.log("🔍 Fetching transactions for accountId:", accountId);
//       fetch(`http://localhost:8089/transaction-service/transactions/account/${accountId}`)
//         .then(res => res.json())
//         .then(data => {
//           console.log("📌 Transactions API response:", data);
//           let formattedData = data.map(txn => {
//   let isDebit = txn.fromAccountId === self.fromAccountId();
//   let amountDisplay = isDebit ? `- ₹${txn.amount.toFixed(2)}` : `+ ₹${txn.amount.toFixed(2)}`;

//   return {
//     transactionId: txn.transactionId,
//     formattedDate: formatDate(txn.timestamp),
//     toAccountId: txn.toAccountId,
//     type: txn.type,
//     amount: amountDisplay,
//     status: txn.status,
//     amountClass: isDebit ? "debit" : "credit"  // NEW property for CSS
//   };
// });

// self.transactions(formattedData);
//         })
//         .catch(err => console.error("❌ Error fetching transactions:", err));
//     };

//     // Init
//     self.fetchUserAccounts();
//   }

//   return new TransactionHistoryViewModel();
// });
