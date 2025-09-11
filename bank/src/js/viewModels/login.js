define([
  'knockout',
  "ojs/ojcorerouter",
  'ojs/ojinputtext',
  'ojs/ojformlayout',
  'ojs/ojbutton',
  'ojs/ojknockout',
], function (ko,CoreRouter) {

  function LoginViewModel() {
    var self = this;

    self.username = ko.observable('');
    self.password = ko.observable('');
    self.message = ko.observable('');

    self.login = async function () {
      console.log("🔹 Login button clicked");

      const payload = {
        username: self.username(),
        password: self.password()
      };

      console.log("📦 Payload to send:", payload);

      try {
        const response = await fetch("http://localhost:8089/user-service/users/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });

        console.log("📡 API Response Status:", response.status);

        if (!response.ok) {
          let errMsg;
          try {
            const errJson = await response.json();
            errMsg = errJson.message || JSON.stringify(errJson);
          } catch {
            errMsg = await response.text();
          }
          console.error("Error Response:", errMsg);
          self.message("Login failed: " + errMsg);
          return;
        }

        const data = await response.json();
        console.log("API Response Data:", data);

        if (data.token) {
          localStorage.setItem("authToken", data.token);
        }

        self.message("Successfully logged in!");

      } catch (err) {
        console.error("API Request Failed:", err);
        self.message("Error occurred while logging in");
      }
    };
  }

  return LoginViewModel;
});
