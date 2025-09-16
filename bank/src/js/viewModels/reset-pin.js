define([
  'knockout',
  'ojs/ojknockout',
  "ojs/ojcorerouter",
  'ojs/ojinputtext',
  'ojs/ojformlayout',
  'ojs/ojbutton',
  'ojs/ojvalidator-regexp'
], function (ko,CoreRouter, ojknockout, ojinputtext, ojformlayout, ojbutton, RegExpValidator) {
  function ResetMpinViewModel() {
    var self = this;

    self.oldMpin = ko.observable();
    self.newMpin = ko.observable();
    self.confirmMpin = ko.observable();
    self.message = ko.observable("");
    self.messageColor = ko.observable("red");

    // 🔹 Validator: exactly 6 digits
    self.mpinValidator = [
      new RegExpValidator({
        pattern: "^[0-9]{6}$",
        hint: "Enter exactly 6 digits",
        messageDetail: "PIN must be exactly 6 digits."
      })
    ];

    
    self.confirmMpinValidator = ko.computed(function() {
      var currentPin = self.newMpin();
      console.log('Creating confirm validator for PIN:', currentPin);
      
      return [
        new RegExpValidator({
          pattern: "^[0-9]{6}$",
          hint: "Confirm your 6 digit PIN",
          messageSummary: "Invalid PIN",
          messageDetail: "PIN must be exactly 6 digits."
        }),


        {
          validate: function(value) {
            console.log('🔍 Custom validator - comparing:', value, 'with:', currentPin);
            if (value && currentPin && value !== currentPin) {
              throw new Error("PINs do not match");
            }
            return true;
          }
        }
      ];
    });


    self.resetMpin = function () {
      var userId = sessionStorage.getItem("userId");

      // Frontend validation
      if (!self.oldMpin() || !self.newMpin() || !self.confirmMpin()) {
        self.message("All fields are required.");
        self.messageColor("red");
        return;
      }

      if (self.newMpin() !== self.confirmMpin()) {
        self.message("New PIN and Confirm MPIN do not match.");
        self.messageColor("red");
        return;
      }

      var payload = {
        oldMpin: self.oldMpin(),
        newMpin: self.newMpin(),
        confirmMpin: self.confirmMpin()
      };

      fetch(`http://localhost:8089/user-service/users/${userId}/update-mpin`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })
        .then(async res => {
          const text = await res.text();
          if (!res.ok) {
            throw new Error(text);
          }
          self.message(text);
          self.messageColor("green");
        //   setTimeout(() => {
        //   // window.location.href = "#/dashboard";
        //   CoreRouter.rootInstance.go({ path: "home" })
        // }, 500);
          self.oldMpin(null);
          self.newMpin(null);
          self.confirmMpin(null);
        })
        .catch(err => {
          self.message(err.message || "❌ Failed to update PIN.");
          self.messageColor("red");
        });
    };
     
  }

  return ResetMpinViewModel;
});
