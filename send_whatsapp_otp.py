# import sys
# import random
# import json
# from twilio.rest import Client
# import os
# from dotenv import load_dotenv

# # Load environment variables
# load_dotenv()
# TWILIO_SID = os.getenv("TWILIO_SID")
# TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
# TWILIO_WHATSAPP_NUMBER = os.getenv("TWILIO_WHATSAPP_NUMBER")  # e.g., 'whatsapp:+14155238886'

# phone = sys.argv[1]

# try:
#     print(f"📞 Attempting to send OTP to WhatsApp number: {phone}", file=sys.stderr)

#     otp = random.randint(100000, 999999)
#     print(f"🔢 Generated OTP: {otp}", file=sys.stderr)

#     client = Client(TWILIO_SID, TWILIO_AUTH_TOKEN)

#     message = client.messages.create(
#         from_=TWILIO_WHATSAPP_NUMBER,
#         to=f"whatsapp:+91{phone}",
#         body=f"🌾 Your OTP is: {otp} (valid for 5 minutes)"
#     )

#     print(f"✅ OTP sent. Message SID: {message.sid}", file=sys.stderr)

#     # Only JSON goes to stdout for Node.js
#     print(json.dumps({"otp": otp}))

# except Exception as e:
#     print(f"❌ Failed to send OTP. Error: {e}", file=sys.stderr)
#     print(json.dumps({"otp": -1}))


# send_sms_otp.py
import sys, random, json, os
from twilio.rest import Client
from dotenv import load_dotenv

load_dotenv()
TWILIO_SID = os.getenv("TWILIO_SID")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
TWILIO_PHONE_NUMBER = os.getenv("TWILIO_PHONE_NUMBER")  # e.g. "+1XXXXXXXXXX"

phone = sys.argv[1]
if phone.startswith('0'): phone = phone.lstrip('0')  # quick sanitize
if not phone.startswith('+'): phone = '+91' + phone   # assume India; change as needed

otp = random.randint(100000, 999999)
client = Client(TWILIO_SID, TWILIO_AUTH_TOKEN)
try:
    msg = client.messages.create(
        from_=TWILIO_PHONE_NUMBER,
        to=phone,
        body=f"Your OTP is {otp} (valid 5 minutes)."
    )
    print(json.dumps({"otp": otp}))
except Exception as e:
    print(json.dumps({"otp": -1, "error": str(e)}))
