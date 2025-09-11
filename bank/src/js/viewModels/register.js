define([
  'knockout',
  "ojs/ojcorerouter",
  'ojs/ojinputtext',
  "ojs/ojconverter-number",
  'ojs/ojformlayout',
  'ojs/ojbutton',
  'ojs/ojdatetimepicker',
  'ojs/ojselectsingle',
  'ojs/ojvalidator-regexp',
  'ojs/ojarraydataprovider',
  'ojs/ojtrain',
  'ojs/ojavatar',
  'ojs/ojvalidationgroup',
], function (
  ko,
  CoreRouter,
  ojInputText,
  NumberConverter,
  ojFormLayout,
  ojButton,
  ojDateTimePicker,
  ojSelectSingle,
  RegExpValidator,
  ArrayDataProvider
) {
  function RegisterViewModel() {
    var self = this;

    self.username = ko.observable('');
    self.firstName = ko.observable('');
    self.lastName = ko.observable('');
    self.dob = ko.observable('');
    self.pan = ko.observable('');
    self.mobile = ko.observable('');
    self.email = ko.observable('');
    self.password = ko.observable('');
    // self.mpin = ko.observable('');
    self.address = ko.observable('');
    self.state = ko.observable('');
    self.pincode = ko.observable('');
    self.country = ko.observable('');
    self.selectedGender = ko.observable('');
    self.message = ko.observable('');


    self.beforeSelectStep = function(event) {
  const nextStep = event.detail.value; // Step user clicked
  const currentStepId = self.currentStep();

  // Only block if moving forward
  const currentIndex = self.trainSteps.findIndex(s => s.id === currentStepId);
  const nextIndex = self.trainSteps.findIndex(s => s.id === nextStep);

  if (nextIndex > currentIndex) {
    const groupId = currentStepId + 'Group';
    const groupElem = document.getElementById(groupId);

    if (groupElem) {
      // This will trigger validation
      groupElem.validate();
      const tracker = groupElem.valid === 'valid' ? 'valid' : 'invalid';

      if (tracker !== 'valid') {
        event.preventDefault(); // stop the train navigation
        self.message("⚠️ Please complete current step before moving forward");
      }
    }
  }
};


    self.mobileValidator = [
      new RegExpValidator({
        pattern: "^[6-9]\\d{9}$",
        hint: "Enter a valid 10-digit mobile number",
        messageDetail: "Mobile number must be exactly 10 digits"
      })
    ];
    self.emailValidator = [
      new RegExpValidator({
        pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
        hint: 'Enter a valid email address',
        messageDetail: 'Invalid email format'
      })
    ];
    self.panValidators = [
      new RegExpValidator({
        pattern: '^[A-Z]{5}[0-9]{4}[A-Z]$',
        hint: 'Format: ABCDE1234F',
        messageDetail: 'PAN must be in format ABCDE1234F'
      })
    ];
    self.passwordValidator = [
      new RegExpValidator({
        pattern: "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$",
        hint: "Password must contain at least 8 characters with upper, lower, number & special char",
        messageSummary: "Invalid Password",
        messageDetail:
          "Password must be 8+ chars with uppercase, lowercase, number & special char."
      })
    ];
    // self.mpinValidator = [
    //   new RegExpValidator({
    //     pattern: "^\\d{6}$",
    //     hint: "Enter 6 digit PIN",
    //     messageSummary: "Invalid MPIN",
    //     messageDetail: "MPIN must be exactly 6 digits."
    //   })
    // ];

    self.genderOptions = [
      { value: 'Male', label: 'Male' },
      { value: 'Female', label: 'Female' },
      { value: 'Others', label: 'Others' }
    ];
    self.genderDataProvider = new ArrayDataProvider(self.genderOptions, { keyAttributes: 'value' });


//     self.beforeSelectStep = function(event) {
//   console.log("🚦 Train before-select triggered");
//   console.log("Event detail:", event.detail); // <-- add this
//   const nextStep = event.detail.value;
//   console.log("Next step ID:", nextStep);

//   if (!nextStep) {
//     console.warn("⚠️ Next step is undefined, stopping navigation");
//     event.preventDefault(); // Block just in case
//     return;
//   }

//   const currentStepId = self.currentStep();
//   const currentIndex = self.trainSteps.findIndex(s => s.id === currentStepId);
//   const nextIndex = self.trainSteps.findIndex(s => s.id === nextStep);

//   console.log("Current step:", currentStepId, "Next step:", nextStep);
//   console.log("Current index:", currentIndex, "Next index:", nextIndex);

//   if (nextIndex > currentIndex) {
//     const groupId = currentStepId + 'Group';
//     const groupElem = document.getElementById(groupId);

//     if (groupElem) {
//       groupElem.validate();
//       const tracker = groupElem.valid;
//       console.log("Validation result:", tracker);

//       if (tracker !== 'valid') {
//         console.warn("❌ Validation failed. Blocking navigation.");
//         event.preventDefault();
//         self.message("⚠️ Please complete current step before moving forward");
//       }
//     }
//   }
// };


    self.trainSteps = [
      { id: 'personal', label: 'Personal Info' },
      { id: 'addressFinish', label: 'Address & Finish' },
      { id: 'accountSecurity', label: 'Account & Security' }
    ];
    self.currentStep = ko.observable('personal');

    self.currentStep = ko.observable('personal');

    self.isFirstStep = ko.pureComputed(
      () => self.currentStep() === self.trainSteps[0].id
    );
    self.isLastStep = ko.pureComputed(
      () => self.currentStep() === self.trainSteps[self.trainSteps.length - 1].id
    );

    function validateStep(stepId) {
      const group = document.getElementById(stepId + 'Group');
      if (group) {
        const tracker = group.getProperty("valid");
        // const tracker = group.valid;

        if (tracker === "valid") {
          return true;
        } else {
          group.validate();
          return false;
        }
      }
      return true;
    }

    self.nextStep = () => {
      let idx = self.trainSteps.findIndex(s => s.id === self.currentStep());
      if (idx < self.trainSteps.length - 1) {
        let currentId = self.currentStep();
        if (validateStep(currentId)) {
          self.currentStep(self.trainSteps[idx + 1].id);
        }
      }
    };

    self.prevStep = () => {
      let idx = self.trainSteps.findIndex(s => s.id === self.currentStep());
      if (idx > 0) {
        self.currentStep(self.trainSteps[idx - 1].id);
      }
    };


    
    self.submitForm = async function () {
      let lastStepId = self.trainSteps[self.trainSteps.length - 1].id;
      if (!validateStep(lastStepId)) {
        self.message("Please fix errors before submitting");
        return;
      }
      await self.register();
    };

    self.register = async function () {
      const payload = {
        username: self.username(),
        firstName: self.firstName(),
        lastName: self.lastName(),
        dob: self.dob()
          ? (self.dob() instanceof Date
            ? self.dob().toISOString().split('T')[0]
            : self.dob())
          : null,
        pan: self.pan(),
        mobile: self.mobile(),
        email: self.email(),
        password: self.password(),
        // mpin: self.mpin(),
        address: self.address(),
        state: self.state(),
        pincode: self.pincode(),
        country: self.country(),
        gender: self.selectedGender()
      };

      console.log("Payload to send:", payload);
      self.message("Sending registration request...");

      try {
        const response = await fetch("http://localhost:8089/user-service/users/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });

        const responseText = await response.text();
        console.log("API response status:", response.status);
        console.log("API response text:", responseText);

        
        
        console.log("Trying to navigate to login page...");
        console.log("CoreRouter.instance:", CoreRouter.instance);

        setTimeout(() => {
          if (CoreRouter.instance) {
            console.log("Navigating to login page now...");
            CoreRouter.instance.go({ path: "login" });
          } else {
            console.error("CoreRouter.instance is undefined! Navigation failed.");
          }
        }, 1000);

        if (!response.ok) {
          self.message("Registration failed: " + responseText);
          return;
        }

      } catch (err) {
        console.error("Error during registration:", err);
        self.message("Error occurred while registering");
      }
    };
  }

  return RegisterViewModel;
});