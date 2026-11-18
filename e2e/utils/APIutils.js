import { expect } from "@playwright/test";
import { json } from "node:stream/consumers";

class APIutils {

constructor(context) {
        this.context = context;
    }

    async gettoken() {
        const response = await this.context.post(
            "https://rahulshettyacademy.com/api/ecom/auth/login",
            {
                data: {
                    userEmail: "anshika@gmail.com",
                    userPassword: "Iamking@000"
                }
            }
        );
        expect(response.ok()).toBeTruthy();

        const responseBody = await response.json();
        const token = responseBody.token;
        return token;
    }

    async createOrder(orderPayLoad) {
        const responsetoken = await this.gettoken();
        const orderResponse = await this.context.post("https://rahulshettyacademy.com/api/ecom/order/create-order", {
            data: orderPayLoad,
            headers: {
                'Authorization': responsetoken,
                'Content-Type': 'application/json'
            }
        });
 
        const orderResponseJson = await orderResponse.json();
        console.log("Order response " , orderResponseJson.orders);
        const orderId = orderResponseJson.orders; 
        return orderId;
    }
}



module.exports = APIutils;