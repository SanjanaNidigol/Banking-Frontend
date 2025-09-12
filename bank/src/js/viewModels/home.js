define([
  'knockout',
  "ojs/ojcorerouter",
  'ojs/ojbutton',
  'ojs/ojdialog'
], function (ko, CoreRouter) {
  function HomeViewModel() {
    var self = this;

    // ✅ User full name from session
    var firstName = sessionStorage.getItem("firstName") || "";
    var lastName = sessionStorage.getItem("lastName") || "";
    self.username = ko.observable((firstName + " " + lastName).trim() || "Customer");

    // Open logout dialog
    self.confirmLogout = function () {
      document.getElementById("logoutDialog").open();
    };

    // Cancel logout
    self.cancelLogout = function () {
      document.getElementById("logoutDialog").close();
    };

    // Confirm logout
    self.doLogout = function () {
      sessionStorage.clear();
      localStorage.clear();
      document.getElementById("logoutDialog").close();
      window.location.href = "/?ojr=login";
    };
  }

  return HomeViewModel;
});
