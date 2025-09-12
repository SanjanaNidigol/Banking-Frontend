define([
  'knockout',
  "ojs/ojcorerouter",
  'ojs/ojinputtext',
  'ojs/ojinputnumber',
  'ojs/ojselectsingle',
  'ojs/ojbutton',
  'ojs/ojformlayout',
  'ojs/ojlabel',
  'ojs/ojtrain',
  'ojs/ojvalidator-regexp',
  'ojs/ojarraydataprovider',
], function (ko, CoreRouter, InputText, InputNumber, SelectSingle, Button, FormLayout, Label, Train, RegExpValidator, ArrayDataProvider) {
  function CreateAccountViewModel() {
    var self = this;

    self.trainSteps = [
      { id: 'step1', label: 'Account Details' },
      { id: 'step2', label: 'Set PIN' }
    ];

    self.stepValue = ko.observable('step1');

    // Observables
    self.accountType = ko.observable('');
    self.selectedAccountType = ko.observable(''); 
    self.balance = ko.observable(null);
    self.pin = ko.observable('');
    self.confirmPin = ko.observable('');
    self.message = ko.observable('');

    self.accountTypeOptions = [
      { value: 'salary', label: 'Salary' },
      { value: 'fixed_deposit', label: 'Fixed Deposit' },
      { value: 'current', label: 'Current' }
    ];

    self.accountTypeDataProvider = new ArrayDataProvider(self.accountTypeOptions, { keyAttributes: 'value' });

    // self.pin.subscribe(function(newValue) {
    //   console.log('📌 PIN changed to:', newValue, '(length:', newValue ? newValue.length : 0, ')');
    // });

    // self.confirmPin.subscribe(function(newValue) {
    //   console.log('🔒 Confirm PIN changed to:', newValue, '(length:', newValue ? newValue.length : 0, ')');
    // });

    // Computed for PIN matching
    self.pinMatch = ko.computed(function() {
      var pin = self.pin();
      var confirmPin = self.confirmPin();
      var match = pin === confirmPin && pin !== '' && confirmPin !== '';
      
      console.log('🔍 PIN Match Check:', {
        pin: pin,
        confirmPin: confirmPin,
        match: match,
        pinLength: pin ? pin.length : 0,
        confirmPinLength: confirmPin ? confirmPin.length : 0
      });
      
      return match;
    });

    self.pinMatchError = ko.computed(function() {
      var confirmPin = self.confirmPin();
      if (confirmPin === '') {
        console.log('Confirm PIN is empty, no error shown');
        return '';
      }
      
      var match = self.pinMatch();
      var errorMsg = match ? '' : 'PINs do not match';
      console.log('PIN Match Error:', errorMsg);
      return errorMsg;
    });

    self.mpinValidator = [
      new RegExpValidator({
        pattern: "^[0-9]{6}$",
        hint: "Enter 6 digit PIN",
        messageSummary: "Invalid PIN",
        messageDetail: "PIN must be exactly 6 digits."
      })
    ];

    self.confirmMpinValidator = ko.computed(function() {
      var currentPin = self.pin();
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

    self.goToNextStep = function() {
      console.log('Going to next step from:', self.stepValue());
      
      if (self.stepValue() === 'step1') {
        if (!self.selectedAccountType()) {
          self.message("Please select Account Type.");
          return;
        }
        self.message('');
        self.stepValue('step2');
      } else if (self.stepValue() === 'step2') {
        var pin = self.pin();
        var confirmPin = self.confirmPin();
        
        console.log('Step 2 validation:', {
          pin: pin,
          confirmPin: confirmPin,
          pinLength: pin ? pin.length : 0,
          confirmPinLength: confirmPin ? confirmPin.length : 0
        });
        
        if (!pin || !confirmPin) {
          self.message("Please enter PIN and confirm it.");
          return;
        }
        
        if (pin.length !== 6) {
          self.message("PIN must be exactly 6 digits.");
          return;
        }
        
        if (pin !== confirmPin) {
          self.message("PIN and Confirm PIN do not match.");
          return;
        }

        self.message('');
        self.createAccount();
      }
    };

    self.goToPreviousStep = function() {
      console.log('Going to previous step from:', self.stepValue());
      if (self.stepValue() === 'step2') {
        self.stepValue('step1');
        self.message(''); 
      }
    };

    self.handleTrainStepChange = function(event) {
      console.log('Train step changed to:', event.detail.value);
      self.stepValue(event.detail.value);
    };

    self.createAccount = function() {
      // console.log('Creating account...');
      var userId = sessionStorage.getItem('userId');
      if (!userId) {
        self.message('Please login first.');
        return;
      }

      self.accountType(self.selectedAccountType());

      var payload = {
        userId: parseInt(userId),
        accountType: self.accountType(),
        balance: self.balance() ? parseFloat(self.balance()) : undefined,
        currencyCode: "INR"
      };

      // console.log('Account creation payload:', payload);

      fetch("http://localhost:8089/account-service/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })
      .then(res => {
        if (!res.ok) return res.text().then(t => { throw new Error(t || 'Account creation failed'); });
        return res.json();
      })
      .then(data => {
        console.log("✅ Account created:", data);

        // Step 2: Set PIN
        var pinPayload = { mpin: self.pin() };
        console.log('PIN setting payload:', pinPayload);
        
        return fetch(`http://localhost:8089/user-service/users/${userId}/mpin`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(pinPayload)
        });
      })
      .then(res => {
        if (!res.ok) return res.text().then(t => { throw new Error(t || 'Failed to set PIN'); });
        return res.json();
      })
      .then(() => {
        console.log("PIN set successfully!");
        self.message("Account created and PIN set successfully!");


        setTimeout(() => {
          if (CoreRouter.instance) {
            console.log("Navigating to home page now...");
            CoreRouter.instance.go({ path: "home" });
          } else {
            console.error("CoreRouter.instance is undefined! Navigation failed.");
          }
        }, 1000);
      })
      .catch(err => {
        console.error("Error:", err);
        self.message("" + err.message);
      });
    };

    console.log('CreateAccountViewModel initialized');
  }

  return CreateAccountViewModel;
});