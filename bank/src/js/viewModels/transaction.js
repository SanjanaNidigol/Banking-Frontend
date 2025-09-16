define([
  'knockout',
  "ojs/ojcorerouter",
  'ojs/ojinputtext',
  'ojs/ojinputnumber',
  'ojs/ojselectsingle',
  'ojs/ojbutton',
  'ojs/ojdialog',
  'ojs/ojformlayout',
  'ojs/ojlabel',
  'ojs/ojtrain',
  'ojs/ojvalidator-regexp',
  'ojs/ojarraydataprovider',
], function (ko, CoreRouter, InputText, InputNumber, SelectSingle, Button, Dialog, FormLayout, Label, Train, RegExpValidator, ArrayDataProvider) {

  function TransactionsViewModel() {
    var self = this;

    // Observables
    self.userId = ko.observable(sessionStorage.getItem("userId"));
    self.fromAccountId = ko.observable();
    self.toAccountId = ko.observable();
    self.toAccountNumber = ko.observable();
    self.amount = ko.observable();
    self.transactionType = ko.observable("NEFT");
    self.mpin = ko.observable();
    self.isProcessing = ko.observable(false);
    self.message = ko.observable("");
    self.captchaInput = ko.observable("");
    self.generatedCaptcha = ko.observable("");
    self.transactionRefId = ko.observable("");
    self.modalAmount = ko.observable();
    self.modalToAccount = ko.observable();
    self.modalStatus = ko.observable();
    self.invalidMpinAttempts = ko.observable(0);
    self.mpinValidator = [
      new RegExpValidator({
        pattern: "^[0-9]{6}$",
        hint: "",
        messageSummary: "Invalid PIN",
        messageDetail: "PIN must be exactly 6 digits."
      })
    ];



    self.generateCaptcha = function () {
      // Use alphanumeric characters excluding confusing ones (0,O,I,1,l)
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
      let captcha = '';
      for (let i = 0; i < 6; i++) {
        captcha += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      self.generatedCaptcha(captcha);
      console.log("🔑 Generated CAPTCHA (for testing):", captcha);

      const canvas = document.getElementById("captchaCanvas");
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Banking-style gradient background (light blue to white)
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, '#f0f8ff'); // Alice blue
      gradient.addColorStop(0.3, '#e6f3ff'); // Light blue
      gradient.addColorStop(0.7, '#ffffff'); // White
      gradient.addColorStop(1, '#f5f5f5'); // Light gray
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Add subtle border
      ctx.strokeStyle = '#d0d0d0';
      ctx.lineWidth = 1;
      ctx.strokeRect(0, 0, canvas.width, canvas.height);

      // Draw noise lines (more subtle and professional)
      for (let i = 0; i < 4; i++) {
        ctx.strokeStyle = `rgba(100, 150, 200, 0.3)`; // Subtle blue lines
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
        ctx.bezierCurveTo(
          Math.random() * canvas.width, Math.random() * canvas.height,
          Math.random() * canvas.width, Math.random() * canvas.height,
          Math.random() * canvas.width, Math.random() * canvas.height
        );
        ctx.stroke();
      }

      // Add grid pattern (very subtle)
      ctx.strokeStyle = 'rgba(200, 200, 200, 0.2)';
      ctx.lineWidth = 0.5;
      for (let i = 0; i < canvas.width; i += 15) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
      }
      for (let i = 0; i < canvas.height; i += 15) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(canvas.width, i);
        ctx.stroke();
      }

      // Draw characters with banking-style fonts and colors
      const charSpacing = canvas.width / (captcha.length + 1);
      const colors = ['#1e3a8a', '#1e40af', '#2563eb', '#3b82f6', '#0f172a']; // Professional blue tones

      for (let i = 0; i < captcha.length; i++) {
        const char = captcha[i];
        const x = (i + 1) * charSpacing;
        const y = canvas.height / 2 + 5;

        ctx.save();

        // Slight rotation for security
        const angle = (Math.random() * 0.4) - 0.2; // -0.2 to 0.2 radians
        ctx.translate(x, y);
        ctx.rotate(angle);

        // Professional font styling
        ctx.font = "bold 24px 'Segoe UI', Arial, sans-serif";
        ctx.fillStyle = colors[i % colors.length];
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Add text shadow for depth
        ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
        ctx.shadowBlur = 1;
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 1;

        ctx.fillText(char, 0, Math.sin(i * 0.8) * 3); // Subtle wave effect
        ctx.restore();
      }

      // Add professional noise dots
      for (let i = 0; i < 20; i++) {
        ctx.fillStyle = `rgba(100, 150, 200, ${Math.random() * 0.3})`;
        ctx.beginPath();
        ctx.arc(
          Math.random() * canvas.width,
          Math.random() * canvas.height,
          Math.random() * 2 + 0.5,
          0,
          2 * Math.PI
        );
        ctx.fill();
      }

      // Add security watermark
      ctx.font = "8px Arial";
      ctx.fillStyle = "rgba(150, 150, 150, 0.4)";
      ctx.fillText("SECURE", canvas.width - 30, canvas.height - 5);
    };


    // Fetch user's accounts on init
    self.fetchUserAccounts = function () {
      console.log("🔍 Fetching accounts for userId:", self.userId());
      fetch(`http://localhost:8089/account-service/accounts/user/${self.userId()}`)
        .then(res => {
          console.log("📌 Accounts API response status:", res.status);
          return res.json();
        })
        .then(accounts => {
          console.log("📌 Accounts API response data:", accounts);
          if (accounts && accounts.length > 0) {
            self.fromAccountId(accounts[0].accountId);
            console.log("📌 fromAccountId set to:", self.fromAccountId());
          }
        })
        .catch(err => console.error("❌ Error fetching accounts:", err));
    };

    // Validate MPIN
    self.validateMpin = function () {
      console.log("🔐 Validating MPIN for userId:", self.userId(), "MPIN:", self.mpin());
      return fetch(`http://localhost:8089/user-service/users/${self.userId()}/validate-mpin`, {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mpin: self.mpin() })
      })
        .then(res => {
          console.log("📌 PIN validation response status:", res.status);
          return res.json();
        })
        .then(isValid => {
          console.log("📌 PIN validation result:", isValid);
          return isValid === true;
        })
        .catch(err => {
          console.error("❌ Error validating MPIN:", err);
          return false;
        });
    };

    // Lookup recipient account by number
    self.fetchToAccountId = function (accountNumber) {
      console.log("🔍 Looking up recipient account number:", accountNumber);
      return fetch(`http://localhost:8089/account-service/accounts/id/byNumber/${accountNumber}`)
        .then(res => {
          console.log("📌 Recipient lookup response status:", res.status);
          return res.json();
        })
        .then(data => {
          console.log("📌 Recipient lookup response data:", data);
          let accountId = data?.accountId || (typeof data === 'number' ? data : undefined);
          if (accountId) {
            self.toAccountId(accountId);
            console.log("📌 toAccountId set to:", self.toAccountId());
            return accountId;
          } else {
            self.toAccountId(undefined);
            alert("❌ Recipient account number does not exist!");
            return null;
          }
        })
        .catch(err => {
          console.error("❌ Error fetching recipient account:", err);
          self.toAccountId(undefined);
          return null;
        });
    };

    self.closeSuccessDialog = function () {
      document.getElementById('transactionSuccessDialog').close();
      window.location.href = "/?ojr=home"; // Redirect after success
    };

    self.closeInvalidMpinDialog = function () {
      self.mpin("");              // clear PIN when dialog closes
  self.isProcessing(false); 
      document.getElementById('invalidMpinDialog').close();
    };


    // Submit transaction
    self.submitTransaction = async function () {



      if (self.captchaInput().toUpperCase() !== self.generatedCaptcha()) {
        alert("CAPTCHA does not match. Try again!");
        self.generateCaptcha();
        return;
      }
      self.message("");
      console.log("Submitting transaction with values:", {
        fromAccountId: self.fromAccountId(),
        toAccountNumber: self.toAccountNumber(),
        amount: self.amount(),
        mpin: self.mpin(),
      });

      if (!self.amount() || !self.toAccountNumber() || !self.mpin()) {
        alert("Please enter all required fields (Amount, Recipient Account, MPIN).");
        return;
      }

      self.isProcessing(true);

      try {
        // Validate MPIN
        const isMpinValid = await self.validateMpin();
        if (!isMpinValid) {
          let attempts = self.invalidMpinAttempts() + 1;
          self.invalidMpinAttempts(attempts);

          console.log("⚠️ Invalid MPIN attempt:", attempts);

          if (attempts >= 3) {
            // 🚨 Lock account
            document.getElementById("accountLockedDialog").open();

            // 🔒 Optionally call backend to lock account
            fetch(`http://localhost:8089/user-service/users/${self.userId()}/lock-account`, {
              method: "POST"
            }).catch(err => console.error("❌ Failed to lock account:", err));

          } else {
            // ❌ Show incorrect dialog
            document.getElementById("invalidMpinDialog").open();
            self.mpin(""); 
          }

          self.isProcessing(false);   // ✅ already here
          return; // stop further processing
        }



        // Lookup recipient account
        await self.fetchToAccountId(self.toAccountNumber());
        if (!self.toAccountId()) {
          alert("Recipient account not found. Transaction aborted.");
          return;
        }

        const payload = {
          fromAccountId: self.fromAccountId(),
          toAccountId: self.toAccountId(),
          amount: parseFloat(self.amount()),
          type: self.transactionType(),
          currencyCode: "INR",
          mpin: self.mpin()
        };
        console.log("Transaction payload:", payload);

        const res = await fetch("http://localhost:8089/transaction-service/transactions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });

        console.log("Transaction API response status:", res.status);
        const result = await res.json();
        console.log("Transaction API response data:", result);

        if (result.status !== "FAILED" && !result.error) {
          self.transactionRefId(result.referenceNumber);

          // Capture current input values
          self.modalAmount(parseFloat(self.amount())); // number
          self.modalToAccount(self.toAccountNumber()); // recipient account number
          self.modalStatus(result.status); 

          // Open dialog
          document.getElementById('transactionSuccessDialog').open();

          // Clear input fields
          self.amount(0);
          self.toAccountNumber("");
          self.mpin("");
          self.captchaInput("");
          self.generateCaptcha();
        }

        // if (result.status === "FAILED" || result.error) {
        //   alert("Transaction Failed: " + (result.failureReason || result.error));
        // } 
        else {
          // alert("Transaction Successful! Ref: " + result.transactionId);
          self.transactionRefId(result.referenceNumber);
          self.modalAmount(parseFloat(result.amount));
          self.modalToAccount(self.toAccountNumber());
          self.modalStatus(result.status);
          document.getElementById('transactionSuccessDialog').open();
          self.captchaInput("");
          self.toAccountNumber("");
          self.amount("");
          self.mpin("");
          self.generateCaptcha();
        }

      } catch (err) {
        console.error("Error submitting transaction:", err);
      } finally {
        self.isProcessing(false);
      }
    };

    // Computed observable to check if form is valid
    self.isFormValid = ko.computed(function () {
      return self.toAccountNumber() && self.amount() && self.mpin();
    });

    setTimeout(function () {
      self.generateCaptcha();
    }, 100);

    self.fetchUserAccounts();
  }

  return TransactionsViewModel;
});
