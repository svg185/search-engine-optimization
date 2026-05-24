const defaultAdminUser = {
  userId: "KARTIKKUMAR",
  password: "2492597",
  locked: true
};

function getAdminUsers() {
  const savedUsers = JSON.parse(localStorage.getItem("searchEngineAdminUsers") || "[]");
  const mergedUsers = [defaultAdminUser, ...savedUsers.filter((user) => user.userId !== defaultAdminUser.userId)];
  localStorage.setItem("searchEngineAdminUsers", JSON.stringify(mergedUsers));
  return mergedUsers;
}

const adminLoginForm = document.querySelector("#adminLoginForm");
const adminUser = document.querySelector("#adminUser");
const adminPassword = document.querySelector("#adminPassword");
const loginMessage = document.querySelector("#loginMessage");

adminLoginForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const enteredUser = adminUser.value.trim().toUpperCase();
  const enteredPassword = adminPassword.value.trim();
  const isValid = getAdminUsers().some((user) => user.userId === enteredUser && user.password === enteredPassword);

  if (!isValid) {
    loginMessage.textContent = "Invalid user ID or password.";
    return;
  }

  sessionStorage.setItem("searchEngineAdminSession", "true");
  window.location.href = "admin-dashboard.html";
});
