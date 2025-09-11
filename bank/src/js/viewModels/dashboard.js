define(['knockout'], function (ko) {
    function DashboardViewModel() {
        var self = this;

        self.logout = function () {
            localStorage.removeItem("authToken");
            window.location.href = "#/login";
        };
    }
    return DashboardViewModel;
});
