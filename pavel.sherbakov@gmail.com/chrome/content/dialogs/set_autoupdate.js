function accept() {
  window.arguments[0].interval = document.getElementById("autoUpdateInterval").value + "|" +
                              document.getElementById("autoUpdateIntervalType").value;
}