define(['knockout'], function (ko) {
  function CheckBalanceViewModel() {
    var self = this;

    // Step control
    self.currentStep = ko.observable('verify'); // 'verify' or 'balance'

    // MPIN observables
    self.mpin1 = ko.observable('');
    self.mpin2 = ko.observable('');
    self.mpin3 = ko.observable('');
    self.mpin4 = ko.observable('');
    self.mpin5 = ko.observable('');
    self.mpin6 = ko.observable('');
    self.errorMessage = ko.observable('');

    // Logged-in user
    self.userId = sessionStorage.getItem("userId") || null;

    // Account info
    self.accountId = ko.observable("Loading...");
    self.balance = ko.observable("Loading...");

    // Helper to move focus to next box
    self.moveNext = function (data, event) {
    const value = event.target.value;

    // Allow only digits
    if (/^\d$/.test(value)) {
        // Move to next input if exists
        if (event.target.nextElementSibling) {
            event.target.nextElementSibling.focus();
        }
    } else {
        // Clear the invalid input
        event.target.value = "";
    }
};
    
    

    // Verify MPIN
    self.verifyMpin = function () {
      let mpin = self.mpin1() + self.mpin2() + self.mpin3() + self.mpin4() + self.mpin5() + self.mpin6();
      if (mpin.length !== 6) {
        self.errorMessage("Enter all 6 digits of your PIN");
        return;
      }

      fetch(`http://localhost:8089/user-service/users/${self.userId}/validate-mpin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mpin })
      })
      .then(res => res.json())
      .then(valid => {
        if (valid === true) {
          self.errorMessage("");
          self.currentStep('balance');
          self.fetchUserAccounts(); // Load balance
        } else {
          self.errorMessage("Incorrect PIN. Try again.");
          // Clear inputs
          self.mpin1(""); self.mpin2(""); self.mpin3(""); self.mpin4(""); self.mpin5(""); self.mpin6("");
        }
      })
      .catch(err => {
        console.error("❌ Error verifying PIN:", err);
        self.errorMessage("Error verifying PIN. Try again.");
      });
    };

    // Fetch user's accounts
    self.fetchUserAccounts = function () {
      if (!self.userId) {
        self.balance("User not logged in");
        return;
      }

      fetch(`http://localhost:8089/account-service/accounts/user/${self.userId}`)
        .then(res => res.json())
        .then(accounts => {
          if (accounts && accounts.length > 0) {
            self.accountId(accounts[0].accountId);
            self.fetchBalance(accounts[0].accountId);
          } else {
            self.accountId("N/A");
            self.balance("No accounts found");
          }
        })
        .catch(err => {
          console.error("❌ Error fetching accounts:", err);
          self.balance("Error fetching accounts");
        });
    };

    // Fetch balance for account
    self.fetchBalance = function (accountId) {
      fetch(`http://localhost:8089/account-service/accounts/${accountId}/balance`)
        .then(res => res.json())
        .then(data => {
          self.balance(data.balance !== undefined ? `₹${data.balance.toFixed(2)}` : "N/A");
        })
        .catch(err => {
          console.error("❌ Error fetching balance:", err);
          self.balance("Error");
        });
    };

    // Refresh balance button
    self.refreshBalance = function () {
      if (self.accountId() && self.accountId() !== "N/A") {
        self.fetchBalance(self.accountId());
      }
    };
  }

  return CheckBalanceViewModel;
});
