define([
    'knockout',
    "ojs/ojcorerouter",
    'ojs/ojformlayout',
    'ojs/ojvalidator-regexp',
    'ojs/ojinputtext',
    'ojs/ojbutton',
    'ojs/ojvalidationgroup',
    'ojs/ojknockout'
], function (ko,
    CoreRouter,
    ojFormLayout,
    RegExpValidator,
    ojInputText,
    ojButton,
    ojValidationGroup,
    ojKnockout
) {
    function ForgotPasswordViewModel() {
        var self = this;

        // Step tracker
        self.currentStep = ko.observable('request');
        // Fields
        self.email = ko.observable('');
        self.mobile = ko.observable('');
        self.otp1 = ko.observable('');
        self.otp2 = ko.observable('');
        self.otp3 = ko.observable('');
        self.otp4 = ko.observable('');
        self.otp5 = ko.observable('');
        self.otp6 = ko.observable('');
        self.newPassword = ko.observable('');
        self.confirmPassword = ko.observable('');
        self.message = ko.observable('');
        self.error = ko.observable('');

         self.maskedEmail = ko.computed(function() {
            const email = self.email();
            if (!email) return '';
            
            const [username, domain] = email.split('@');
            if (!username || !domain) return email;
            
            // Show first 2 chars, mask middle, show last char before @
            const maskedUsername = username.length <= 3 
                ? username[0] + '*'.repeat(username.length - 1)
                : username.substring(0, 2) + '*'.repeat(username.length - 3) + username.slice(-1);
            
            return maskedUsername + '@' + domain;
        });


        self.newPasswordValidator = [
            new RegExpValidator({
                pattern: "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$",
                hint: "Password must contain at least 8 characters with upper, lower, number & special char",
                messageSummary: "Invalid Password",
                messageDetail:
                    "Password must be 8+ chars with uppercase, lowercase, number & special char."
            })
        ];

        self.moveNext = function (data, event) {
            const input = event.target;
            const value = input.value;

            // Only allow digits
            if (!/^\d*$/.test(value)) {
                input.value = '';
                return;
            }

            // Move focus to next input
            if (value.length === 1) {
                const next = input.nextElementSibling;
                if (next && next.classList.contains('otp-box')) {
                    next.focus();
                }
            }

            // Move back on backspace
            if (event.key === 'Backspace' && value.length === 0) {
                const prev = input.previousElementSibling;
                if (prev && prev.classList.contains('otp-box')) {
                    prev.focus();
                }
            }
        };

        self.code = ko.computed(function () {
            return self.otp1() + self.otp2() + self.otp3() + self.otp4() + self.otp5() + self.otp6();
        });

        self.requestReset = async function () {
            self.message('');
            self.error('');

            try {
                const response = await fetch("http://localhost:8089/user-service/users/forgot-password/request", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        email: self.email(),
                        mobile: self.mobile()   
                    })
                });

                const responseText = await response.text();
                let data;

                try {
                    data = JSON.parse(responseText);
                } catch {
                    data = { message: responseText };
                }

                if (!response.ok) {
                    self.error(data.error || data.message || "Failed to send reset code.");
                    return;
                }

                // self.message(data.message || "Reset code sent to your email.");
                self.currentStep('verify');

            } catch (err) {
                self.error("Server error. Please try again later.");
                console.error(err);
            }
        };

        self.verifyCode = async function () {
            console.log("Sending code:", self.code());
            self.message('');
            self.error('');

            try {
                const response = await fetch("http://localhost:8089/user-service/users/forgot-password/verify", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        email: self.email(),
                        code: self.code()
                    })
                });

                const responseText = await response.text();
                let data;

                try {
                    data = JSON.parse(responseText);
                } catch {
                    data = { message: responseText };
                }

                if (!response.ok) {
                    self.error(data.error || data.message || "Verification failed.");
                    return;
                }

                // self.message(data.message || "Code verified successfully.");
                self.currentStep('reset');

            } catch (err) {
                self.error("Server error during verification.");
                console.error(err);
            }
        };


        self.resetPassword = async function () {
            self.message('');
            self.error('');

            if (!self.newPassword() || !self.confirmPassword()) {
                self.error("Both fields are required.");
                return;
            }
            if (self.newPassword() !== self.confirmPassword()) {
                self.error("Passwords do not match.");
                return;
            }

            try {
                const response = await fetch("http://localhost:8089/user-service/users/forgot-password/reset", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        email: self.email(),
                        code: self.code(),
                        newPassword: self.newPassword()
                    })
                });

                const responseText = await response.text();
                let data;
                try {
                    data = JSON.parse(responseText);
                } catch {
                    data = { message: responseText };
                }

                if (!response.ok) {
                    self.error(data.error || data.message || "Password reset failed.");
                    return;
                }

                self.message(data.message || "Password reset successful.");
                // self.currentStep('login'); // redirect back to login
                setTimeout(() => {
                    // window.location.href = "#/dashboard";
                    CoreRouter.instance.go({ path: "login" });
                }, 1000);


            } catch (err) {
                self.error("Server error during reset.");
                console.error(err);
            }
        };

    }

    return ForgotPasswordViewModel;
});
