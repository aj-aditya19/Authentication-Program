import smtplib
import os
import sys
import random
from dotenv import load_dotenv
from email.message import EmailMessage
import json

# Load .env variables
load_dotenv()
EMAIL_ADDRESS = os.getenv("EMAIL_ADDRESS")
EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD")

receiver_email = sys.argv[1]

otp = random.randint(100000, 999999)

msg = EmailMessage()
msg['Subject'] = 'Your OTP Code'
msg['From'] = EMAIL_ADDRESS
msg['To'] = receiver_email
# print(EMAIL_ADDRESS)
msg.set_content(f"Your OTP is: {otp}")

try:
    with smtplib.SMTP_SSL('smtp.gmail.com', 465) as smtp:
        smtp.login(EMAIL_ADDRESS, EMAIL_PASSWORD)
        smtp.send_message(msg)
    # Return OTP as JSON
    print(json.dumps({"otp": otp}))
except Exception as e:
    # Return -1 on error as JSON
    print(json.dumps({"otp": -1}))
