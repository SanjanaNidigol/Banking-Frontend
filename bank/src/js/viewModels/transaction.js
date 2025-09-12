define([
  'knockout',
  'ojs/ojinputtext',
  'oj-c/input-sensitive-text',
  'ojs/ojformlayout',
  'ojs/ojbutton'
],
   function (ko) {
  function TransactionsViewModel() {
    var self = this;
    self.fromAccountId = ko.observable('');
    self.toAccountId = ko.observable('');
    self.amount = ko.observable(0);
    self.enteredMpin = ko.observable('');
    self.channel = ko.observable('');
    self.description = ko.observable('');
    self.submitTransaction = function () {
      if (!self.fromAccountId() || !self.toAccountId() || !self.amount() || !self.enteredMpin()) {
        alert(":warning: Please fill in all fields before submitting.");
        return;
      }
      // Prepare JSON body to match backend
      var transactionData = {
        fromAccountId: parseInt(self.fromAccountId()),
        toAccountId: parseInt(self.toAccountId()),
        amount: parseFloat(self.amount()),
        enteredMpin: self.enteredMpin(),
        channel: self.channel(),
        description: self.description(),
        txnType: "UPI"
      };
      console.log("Transaction JSON:", transactionData);
      // Call backend API
      fetch('http://localhost:8093/api/transactions/transfer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(transactionData)
      })
      .then(response => {
        if (!response.ok) {
          return response.json().then(err => { throw err; });
        }
        return response.json();
      })
      .then(data => {
        console.log("Response from backend:", data);
        alert(":white_check_mark: Transaction submitted successfully!");
        // Reset form fields
        self.fromAccountId('');
        self.toAccountId('');
        self.amount(0);
        self.enteredMpin('');
        self.channel('');
        self.description('');
      })
      .catch(error => {
        console.error("Error:", error);
        alert(":x: Transaction failed: " + (error.message || "Unknown error"));
      });
    };
  }
  return TransactionsViewModel;
});