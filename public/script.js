const login = document.querySelector(".login");
const newuser_button = document.querySelector(".newuser_button");
const olduser_button = document.querySelector(".olduser_button");
const newuser = document.querySelector(".newuser");
const logout = document.querySelector(".logout");

newuser_button.addEventListener("click", ()=>{
  console.log("user is new");
  login.classList.add("hide");
  newuser.classList.remove("hide");
  newuser_button.classList.add("hide");
  olduser_button.classList.remove("hide");
})

olduser_button.addEventListener("click", ()=>{
  console.log("user is old");
  login.classList.remove("hide");
  newuser.classList.add("hide");
  newuser_button.classList.remove("hide");
  olduser_button.classList.add("hide");
})
const enter_otp = document.querySelector(".enter_otp");

document.querySelector("#sendOtpBtn").addEventListener("click", async () => {
  const form = document.querySelector("#registerForm");
  const phone = form.querySelector('input[name="phone"]').value;
  const email = form.querySelector('input[name="email"]').value;
  const method = form.querySelector('input[name="method"]:checked')?.value;

  console.log("Phone:", phone, "Email:", email, "Method:", method);

  try {
    const res = await fetch("/send_otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, email, method })
    });

    const data = await res.json();
    console.log("Server response:", data);

    if (data.success) {
      enter_otp.classList.remove("hide");
    } else {
      alert(data.message || "OTP not sent!");
    }

  } catch (err) {
    console.error("Error sending OTP:", err);
    alert("Server error! OTP not sent.");
  }
});

logout.addEventListener("click", async ()=>{
  try{
    const res = await fetch("/logout",{
      method: "POST",
      headers : {"Content-Type":"application/json"},
    });
    const log = await res.json();
    console.log(log);
  }
  catch
  {
    console.log("Error in logout");
  }
});