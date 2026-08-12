1 - Get your API Keys
Obtain your API Keys from your dashboard. We recommend you integrate using your test keys to avoid changes to your live data or charging real customers while testing.

2 - Add the pay-ins/collections script
Next, you'll need to add the Kora pay-in/collection script to your website or application.

Sample Form

<form>
    <script src="https://korablobstorage.blob.core.windows.net/modal-bucket/korapay-collections.min.js"></script>
    <button type="button" onclick="payKorapay()"> Pay </button>
</form>
Pay-in Script

<script>
    function payKorapay() {
        window.Korapay.initialize({
            key: "pk_live_*********************",
            reference: "your-unique-reference",
            amount: 22000, 
            currency: "NGN",
            customer: {
              name: "John Doe",
              email: "john@doe.com"
            },
            notification_url: "https://example.com/webhook"
        });
    }
</script>
🚧
Warning!
Avoid exposing your secret key on the client-side (or front end) of your application. Requests to the Kora's API should be initiated from your server.

3 - Initialize the payment gateway.
Use the Korapay.initialize function to pass the relevant transaction details needed to initialize the payment gateway and start accepting payments.

Set the sample API key with your test mode key obtained from your dashboard. This allows you to test through your Korapay account.

Indicate the amount and currency.

Indicate the customer name and email to show on the gateway as the sender of the transaction.

When you’re ready to accept live payments, replace the test key with your live/production key.

4 - Receive confirmation via webhook
When the payment is successful, we will make a POST request to your webhook URL (as set up in your dashboard, or while initializing the transaction using the key: notification_url) in this format:

Code: Response Format

{
   "even"t:  "charge.success" //the notification is only sent for successful charge,
   "data": {
     	"reference": "KPY-C-cUBkIH&98n8b",
     	"currency": "NGN",
     	"amount": "22000", //amount paid by the customer
     	"amount_expected": "22000", //amount that the customer is expected to pay
     	"fee": "25",
     	"status": "success",
     	"payment_reference": "your-unique-reference", //unique reference sent by the merchant
     	"transaction_status": "success" //the status of the charge base on the amount paid by the customer. This can either be `success`, `underpaid` or `overpaid`,
      "metadata": {
        "internalRef": "JD-12-67",
        "age": 15,
        "fixed": true,
      }
   }
}
Configuration parameters
Field	Data Type	Description
key	String	
*Required** - Your public key from Korapay. Use the test public key for test transactions and live public key for live transactions
reference	String	
*Required** - Your unique transaction reference. Must be unique for every transaction.
amount	Integer	
*Required** - Amount to be collected.
currency	String	
*Optional** - Currency of the charge, e.g NGN, KES, GHS. The default is NGN (Nigerian Naira)
customer	Object	
*Required** - JSON object containing customer details
customer.name	String	
Required *- field in the customer object. Customer name derived from name enquiry.
customer.email	String	
*Required** - Field in the customer object. Customer email address
notification_url	String	
*Optional** - HTTPS endpoint to send information to on payment termination, success, or failure. This overrides the webhook URL set on your merchant dashboard for this particular transaction
narration	String	
*Optional** - Information/narration about the transaction
channels	Array[string]	
*Optional** - Methods of payment. E.g, Bank Transfer (bank_transfer), card (card), Pay with Bank (pay_with_bank), Mobile money (mobile_money). Default is [“bank_transfer”][“bank_transfer”]. Note that if only one payment method is available, it cannot be changed to another method.
default_channel	String	
*Optional** - Method of payment that should be active by default. E.g Bank Transfer (bank_transfer), card (card), Pay with Bank (pay_with_bank), Mobile money (mobile_money. The payment method selection page is skipped on the first load.
Note that the default channel must also be specified in the channels parameter.
metadata	Object	
*Optional** - It takes a JSON object with a maximum of 5 fields/keys. Empty JSON objects are not allowed.
Each field name has a maximum length of 20 characters. Allowed characters: A-Z, a-z, 0-9, and -.
containerId	String	
*Optional** - ID of the HTML element you want the payment gateway to be contained in. Note that this would reset all styling on this element. The payment gateway would be resized to fit the container. If this is not set, the payment gateway fills the available screen size.
The recommended size for this container is 400px x 500px (width x height). However, this is not enforced and you can load the checkout in a smaller or larger container.
onClose	[Function]	
*Optional** - function to be called when the payment gateway is closed
onSuccess	[Function]	
*Optional** - function to be called when the payment is completed successfully
onFailed	[Function]	
*Optional** - function to be called when the payment failed
onTokenized	[Function]	Optional - function to be called when card tokenization is completed successfully
onPending	[Function]	
*Optional** - sometimes, bank transfers could take some time before they get resolved. In such a case, this function would be called after 20 seconds. This could allow you to manage the experience for your customer by showing a notification or some other information.
merchant_bears_cost	Boolean	
*Optional**. This will set who bears the fees of the transaction. If it is set to true, the merchant will bear the fee, while if it is set to false, the customer will bear the fee. By default, it is set to true.
Interacting with Checkout Standard through the Korapay script
When using Checkout Standard, the payment gateway is opened in an iframe to ensure security. Some functions are exposed to allow interactions with the application when specific events occur during a transaction. These include:

Event	Field
Succesful Transaction	onSuccess
Failed Transaction	onFailed
Payment Modal Closed	onClose
Card Tokenized	onTokenized
Bank Transfer Pending	onPending
You can pass functions into these fields while calling Korapay.initialize as shown in the script below.

Code: Script

<script>
    function payKorapay() {
        window.Korapay.initialize({
            key: "pk_juigfweofyfewby732gwo8923e",
            reference: "your-unique-reference",
            amount: 3000, 
            currency: "NGN",
            customer: {
              name: "John Doe",
              email: "john@doe.com"
            },
            onClose: function () {
              // Handle when modal is closed
            },
            onSuccess: function (data) {
              // Handle when payment is successful
            },
            onFailed: function (data) {
              // Handle when payment fails
            }
            ...
        });
    }
</script>
The data returned should have the following fields. Note that no data is returned for the onPending function as the transaction is not yet completed:

Field	Data Type	Description
amount	String	Transaction Amount
reference	String	Transaction Reference
status	String	Transaction Status
To close the modal programmatically, use the Korapay.close function.