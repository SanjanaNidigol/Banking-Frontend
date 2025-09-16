define([
  'knockout',
  'ojs/ojbutton',
  'ojs/ojdialog',
  'ojs/ojknockout'
], function (ko) {
  function ProfileViewModel() {
    var self = this;

    // Observables
    self.fullName = ko.observable("");
    self.username = ko.observable("");
    self.email = ko.observable("");
    self.mobile = ko.observable("");
    self.dob = ko.observable("");
    self.pan = ko.observable("");
    self.address = ko.observable("");
    self.state = ko.observable("");
    self.pincode = ko.observable("");
    self.country = ko.observable("");
    self.gender = ko.observable("");
    self.accountStatus = ko.observable("");

    // Fetch user data from backend
    var userId = sessionStorage.getItem("userId"); // fallback to 1
    fetch(`http://localhost:8089/user-service/users/${userId}`)
      .then(res => res.json())
      .then(data => {
        self.fullName(data.firstName + " " + data.lastName);
        self.username(data.username);
        self.email(data.email);
        self.mobile(data.mobile);
        self.dob(data.dob);
        self.pan(data.pan);
        self.address(data.address);
        self.state(data.state);
        self.pincode(data.pincode);
        self.country(data.country);
        self.gender(data.gender);
        self.accountStatus(data.accountStatus);
      })
      .catch(err => console.error("Error fetching user data:", err));

    // Back to dashboard
    self.goBack = function () {
      window.location.href = "/?ojr=home";
    };
  }

  return ProfileViewModel;
});
