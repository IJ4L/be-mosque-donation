# Midtrans Webhook Setup Guide

## Overview

This guide explains how to set up Midtrans payment notifications (webhooks) for your Mosque Donation application.

## Prerequisites

1. Midtrans account with API keys (sandbox or production)
2. Your application deployed to a server with a public URL

## Configuration Steps

### 1. Configure Midtrans Dashboard

1. Log in to your Midtrans dashboard (sandbox or production)
2. Go to Settings > Configuration
3. Under "Payment Notification URL" enter your callback URL:
   ```
   https://your-domain.com/api/donations/notification
   ```
   Replace `your-domain.com` with your actual domain

### 2. Set Environment Variables

Ensure your application has the following environment variables configured:

```
MIDTRANS_SERVER_KEY=your_server_key_here
MIDTRANS_CLIENT_KEY=your_client_key_here
MIDTRANS_MERCHANT_ID=your_merchant_id_here
MIDTRANS_IS_PRODUCTION=false  # Set to 'true' for production
```

### 3. Test the Webhook

1. Make a test payment in the Midtrans sandbox
2. Check your application logs to verify the webhook was received
3. Verify the donation status was updated in your database

## Troubleshooting

- If webhooks aren't being received, check your server firewall settings
- Ensure your endpoint is publicly accessible
- Verify your Midtrans API keys are correctly configured
- Check the application logs for any errors in the webhook handler

## Local Development Testing

For testing in development:

1. Deploy a temporary version of your application to a hosting service like Vercel, Heroku, or Render
2. Configure the webhook URL in the Midtrans dashboard to point to your temporary deployment
3. After testing, update the webhook URL to your production environment

## Additional Resources

- [Midtrans Documentation](https://docs.midtrans.com/)
- [Handling Payment Notifications](https://docs.midtrans.com/en/after-payment/http-notification)
