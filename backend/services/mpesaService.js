const axios = require('axios');
const moment = require('moment');
const crypto = require('crypto');

const MPESA_BASE_URL = process.env.MPESA_BASE_URL || 'https://sandbox.safaricom.co.ke';
const MPESA_CONSUMER_KEY = process.env.MPESA_CONSUMER_KEY;
const MPESA_CONSUMER_SECRET = process.env.MPESA_CONSUMER_SECRET;
const MPESA_SHORTCODE = process.env.MPESA_SHORTCODE;
const MPESA_PASSKEY = process.env.MPESA_PASSKEY;
const MPESA_CALLBACK_URL = process.env.MPESA_CALLBACK_URL || 'https://yourdomain.com/api/payments/mpesa-callback';
const MPESA_ENVIRONMENT = process.env.MPESA_ENVIRONMENT || 'sandbox'; // sandbox or production

class MpesaService {
  constructor() {
    this.accessToken = null;
    this.tokenExpiry = null;
  }

  async getAccessToken() {
    // Check if we have a valid token
    if (this.accessToken && this.tokenExpiry && new Date() < this.tokenExpiry) {
      return this.accessToken;
    }

    try {
      const auth = Buffer.from(`${MPESA_CONSUMER_KEY}:${MPESA_CONSUMER_SECRET}`).toString('base64');
      const response = await axios.get(`${MPESA_BASE_URL}/oauth/v1/generate?grant_type=client_credentials`, {
        headers: { 
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/json'
        }
      });

      this.accessToken = response.data.access_token;
      this.tokenExpiry = new Date(Date.now() + (response.data.expires_in * 1000));
      
      console.log('✅ M-Pesa access token obtained');
      return this.accessToken;
    } catch (error) {
      console.error('❌ M-Pesa access token error:', error.response?.data || error.message);
      throw new Error('Failed to get M-Pesa access token');
    }
  }

  async initiateSTKPush({ phone, amount, reference, description }) {
    try {
      const accessToken = await this.getAccessToken();
      const timestamp = moment().format('YYYYMMDDHHmmss');
      const password = Buffer.from(`${MPESA_SHORTCODE}${MPESA_PASSKEY}${timestamp}`).toString('base64');

      // Format phone number (remove +254 and add 254)
      const formattedPhone = phone.replace(/^\+254/, '254').replace(/^0/, '254');

      const payload = {
        BusinessShortCode: MPESA_SHORTCODE,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: amount,
        PartyA: formattedPhone,
        PartyB: MPESA_SHORTCODE,
        PhoneNumber: formattedPhone,
        CallBackURL: MPESA_CALLBACK_URL,
        AccountReference: reference,
        TransactionDesc: description
      };

      console.log('📱 Initiating M-Pesa STK Push:', { phone: formattedPhone, amount, reference });

      const response = await axios.post(
        `${MPESA_BASE_URL}/mpesa/stkpush/v1/processrequest`,
        payload,
        { 
          headers: { 
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('✅ M-Pesa STK Push initiated:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ M-Pesa STK Push error:', error.response?.data || error.message);
      throw new Error('Failed to initiate M-Pesa payment');
    }
  }

  async checkSTKPushStatus(checkoutRequestId) {
    try {
      const accessToken = await this.getAccessToken();
      const timestamp = moment().format('YYYYMMDDHHmmss');
      const password = Buffer.from(`${MPESA_SHORTCODE}${MPESA_PASSKEY}${timestamp}`).toString('base64');

      const payload = {
        BusinessShortCode: MPESA_SHORTCODE,
        Password: password,
        Timestamp: timestamp,
        CheckoutRequestID: checkoutRequestId
      };

      const response = await axios.post(
        `${MPESA_BASE_URL}/mpesa/stkpushquery/v1/query`,
        payload,
        { 
          headers: { 
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('❌ M-Pesa STK Push status check error:', error.response?.data || error.message);
      throw new Error('Failed to check M-Pesa payment status');
    }
  }

  async handleCallback(callbackData) {
    try {
      console.log('📞 M-Pesa callback received:', callbackData);

      // Verify the callback signature (in production)
      if (MPESA_ENVIRONMENT === 'production') {
        const isValid = this.verifyCallbackSignature(callbackData);
        if (!isValid) {
          console.error('❌ Invalid M-Pesa callback signature');
          return { success: false, error: 'Invalid signature' };
        }
      }

      // Parse the callback data
      const resultCode = callbackData.Body?.stkCallback?.ResultCode;
      const checkoutRequestId = callbackData.Body?.stkCallback?.CheckoutRequestID;
      const merchantRequestId = callbackData.Body?.stkCallback?.MerchantRequestID;
      const amount = callbackData.Body?.stkCallback?.CallbackMetadata?.Item?.find(item => item.Name === 'Amount')?.Value;
      const mpesaReceiptNumber = callbackData.Body?.stkCallback?.CallbackMetadata?.Item?.find(item => item.Name === 'MpesaReceiptNumber')?.Value;
      const transactionDate = callbackData.Body?.stkCallback?.CallbackMetadata?.Item?.find(item => item.Name === 'TransactionDate')?.Value;
      const phoneNumber = callbackData.Body?.stkCallback?.CallbackMetadata?.Item?.find(item => item.Name === 'PhoneNumber')?.Value;

      if (resultCode === 0) {
        // Payment successful
        return {
          success: true,
          reference: checkoutRequestId,
          amount: amount,
          phone: phoneNumber,
          receiptNumber: mpesaReceiptNumber,
          transactionDate: transactionDate,
          merchantRequestId: merchantRequestId
        };
      } else {
        // Payment failed
        const errorMessage = callbackData.Body?.stkCallback?.ResultDesc || 'Payment failed';
        console.error('❌ M-Pesa payment failed:', errorMessage);
        return {
          success: false,
          error: errorMessage,
          reference: checkoutRequestId
        };
      }
    } catch (error) {
      console.error('❌ M-Pesa callback processing error:', error);
      return { success: false, error: 'Failed to process callback' };
    }
  }

  verifyCallbackSignature(callbackData) {
    // Implement signature verification for production
    // This is a placeholder - implement according to M-Pesa documentation
    return true;
  }

  // Get transaction status from M-Pesa
  async getTransactionStatus(transactionId) {
    try {
      const accessToken = await this.getAccessToken();
      const response = await axios.get(
        `${MPESA_BASE_URL}/mpesa/transactionstatus/v1/query`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
          params: {
            Initiator: MPESA_SHORTCODE,
            SecurityCredential: this.generateSecurityCredential(),
            CommandID: 'TransactionStatusQuery',
            TransactionID: transactionId,
            PartyA: MPESA_SHORTCODE,
            IdentifierType: '4',
            ResultURL: `${MPESA_CALLBACK_URL}/transaction-status`,
            QueueTimeOutURL: `${MPESA_CALLBACK_URL}/transaction-status`,
            Remarks: 'Transaction status query',
            Occasion: 'Transaction status'
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('❌ M-Pesa transaction status error:', error.response?.data || error.message);
      throw new Error('Failed to get transaction status');
    }
  }

  generateSecurityCredential() {
    // Implement security credential generation
    // This is a placeholder - implement according to M-Pesa documentation
    return 'security_credential_placeholder';
  }

  // Health check for M-Pesa service
  async healthCheck() {
    try {
      await this.getAccessToken();
      return true;
    } catch (error) {
      console.error('❌ M-Pesa health check failed:', error);
      return false;
    }
  }
}

module.exports = new MpesaService(); 