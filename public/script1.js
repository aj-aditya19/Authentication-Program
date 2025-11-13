const logout = document.querySelector(".logout");

logout.addEventListener("click", async () => {
  console.log("Button pressed logout");
  try {
    const res = await fetch("/logout"); // GET by default
    if (res.redirected) {
      window.location.href = res.url; // Redirects back to login page
    }
  } catch (err) {
    console.log("Error in logout:", err);
  }
});


async function getUserName() {
  try {
    const response = await fetch("/userdata");
    if (!response.ok) {
      throw new Error("Not logged in");
    }

    const data = await response.json();

    // Show name in the div
    document.querySelector(".showname").innerText = `Agya Mhan insan , ${data.name}!`;
  } catch (error) {
    console.error("Error:", error);
    alert("Session expired. Please login again.");
    window.location.href = "/";
  }
}

getUserName();

// Logout button
document.querySelector(".logout").addEventListener("click", async () => {
  await fetch("/logout");
  window.location.href = "/";
});
