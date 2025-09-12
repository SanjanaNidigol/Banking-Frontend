define([
  'knockout',
  'ojs/ojarraydataprovider'
], function (ko, ArrayDataProvider) {
  function TransactionHistoryViewModel() {
    var self = this;

    // Dummy data (replace with API later)
    self.transactions = ko.observableArray([
      { date: "2025-09-01", type: "Deposit", amount: 5000, balance: 15000 },
      { date: "2025-09-05", type: "Withdrawal", amount: 2000, balance: 13000 },
      { date: "2025-09-07", type: "Transfer", amount: 3000, balance: 10000 }
    ]);

    // DataProvider for oj-table
    self.transactionsDataProvider = new ArrayDataProvider(self.transactions, {
      keyAttributes: 'date'
    });
  }
  return TransactionHistoryViewModel;
});
