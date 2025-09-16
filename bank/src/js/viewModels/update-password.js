define([
  'knockout',
  'ojs/ojcorerouter',
  'ojs/ojinputtext',
  'ojs/ojformlayout',
  'ojs/ojbutton',
  'ojs/ojvalidator-regexp'
], function (ko, CoreRouter, ojInputText, ojFormLayout, ojButton, RegExpValidator) {

  function UpdatePasswordViewModel() {
    var self = this;

    self.oldPassword = ko.observable("");
    self.newPassword = ko.observable("");
    self.confirmPassword = ko.observable("");
    self.message = ko.observable("");
    self.messageColor = ko.observable("green");

    // password validator
    self.passwordValidator = [
      new RegExpValidator({
        pattern: "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$",
        hint: "Password must contain at least 8 characters with upper, lower, number & special char",
        messageSummary: "Invalid Password",
        messageDetail: "Password must be 8+ chars with uppercase, lowercase, number & special char."
      })
    ];

    // confirm password validator
    self.confirmPasswordValidator = [
      {
        validate: function (value) {
          if (value !== self.newPassword()) {
            throw new Error("Passwords do not match");
          }
          return true;
        },
        hint: "Re-enter the same password",
        messageSummary: "Passwords do not match",
        messageDetail: "Confirm password must match the password"
      }
    ];

    self.updatePassword = function () {
      if (self.newPassword() !== self.confirmPassword()) {
        self.message("❌ New password and confirm password do not match.");
        self.messageColor("red");
        return;
      }

      var userId = sessionStorage.getItem("userId");
      if (!userId) {
        self.message("❌ User not logged in.");
        self.messageColor("red");
        return;
      }

      var payload = {
        oldPassword: self.oldPassword(),
        newPassword: self.newPassword()
      };

      fetch(`http://localhost:8089/user-service/users/${userId}/update-password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })
        .then(async res => {
          if (!res.ok) {
            let err = await res.text();
            throw new Error(err);
          }
          return res.text();
        })
        .then(msg => {
          self.message("✅ " + (msg || "Password updated successfully!"));
          self.messageColor("green");
           setTimeout(() => {
          CoreRouter.instance.go({ path: "home" });
        }, 500);
          self.oldPassword("");
          self.newPassword("");
          self.confirmPassword("");
        })
        .catch(err => {
          self.message("❌ " + err.message);
          self.messageColor("red");
        });
    };
  }

  return UpdatePasswordViewModel;
});
