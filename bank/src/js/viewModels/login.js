define([
  'knockout',
  "ojs/ojcorerouter",
  'ojs/ojinputtext',
  'ojs/ojformlayout',
  'ojs/ojbutton',
  'ojs/ojknockout'
], function (ko, CoreRouter) {

  function LoginViewModel() {
    var self = this;

    // self.username = ko.observable('');
    self.identifier = ko.observable('');
    self.password = ko.observable('');
    self.message = ko.observable('');
    self.captchaWidgetId = null;

    // Initialize CAPTCHA when the view is loaded
    self.initCaptcha = function () {
      if (typeof grecaptcha !== "undefined" && self.captchaWidgetId === null) {
        self.captchaWidgetId = grecaptcha.render('recaptcha-container', {
          'sitekey': '6LcXHcYrAAAAAGT87UJ6MsBva8hxeRcL_tj51ZJ8',
          'theme': 'light'
        });
      }
    };

    // Call this function after the view is attached
    self.connected = function () {
      self.initCaptcha();
    };

    self.login = async function () {

      console.log("Login button clicked");

      if (typeof grecaptcha === "undefined" || self.captchaWidgetId === null) {
        self.message("Captcha service not loaded. Please refresh and try again.");
        return;
      }

      var captchaResponse = grecaptcha.getResponse(self.captchaWidgetId);
      if (!captchaResponse) {
        self.message("Please complete the CAPTCHA verification.");
        return;
      }

      const payload = {
        // username: self.username(),
        identifier: self.identifier(),
        password: self.password(),
        captcha: captchaResponse
      };

      console.log("Payload to send:", payload);

      try {
        // http://localhost:8089/user-service/users/login
        const response = await fetch("http://localhost:8089/user-service/users/login/identifier", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          credentials: 'include'
        });

        console.log("API Response Status:", response.status);

        const responseText = await response.text();

        if (!response.ok) {
          console.error("Error Response:", responseText);
          self.message(responseText);
          grecaptcha.reset(self.captchaWidgetId);
          return;
        }

        const data = JSON.parse(responseText);
        console.log("API Response Data:", data);


        sessionStorage.setItem("authUser", JSON.stringify(data));
        // localStorage.setItem("authUser", JSON.stringify(data));
        sessionStorage.setItem("userId", data.id);
        sessionStorage.setItem("firstName", data.firstName || '');
        sessionStorage.setItem("lastName", data.lastName || '');
        sessionStorage.setItem("username", data.username);
        sessionStorage.setItem("email", data.email);
        sessionStorage.setItem("mobile", data.mobile);
        sessionStorage.setItem("role", data.role)

        self.message("Logged in successfully!");

        // if (CoreRouter.instance) {
        //             CoreRouter.instance.go({ path: "dashboard" });
        //         }
        // Redirect to dashboard after 1.5 sec
        setTimeout(() => {
          // window.location.href = "#/dashboard";
          CoreRouter.instance.go({ path: "home" });
        }, 500);

      } catch (err) {
        console.error("API Request Failed:", err);
        // Only show this if network or fetch fails
        self.message("Error occurred while connecting to server");
      }
    };
  }

  return LoginViewModel;
});
