import React from 'react';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';

const PayPalButton = () => {
    return (
        <PayPalScriptProvider options={{ "client-id": "YOUR_CLIENT_ID" }}>
            <PayPalButtons
                createOrder={(data, actions) => {
                    return actions.order.create({
                        purchase_units: [{
                            amount: {
                                value: '0.01', // Change this to your desired amount
                            },
                        }],
                    });
                }}
                onApprove={(data, actions) => {
                    return actions.order.capture().then((details) => {
                        alert('Transaction completed by ' + details.payer.name.given_name);
                    });
                }}
            />
        </PayPalScriptProvider>
    );
};

export default PayPalButton;
