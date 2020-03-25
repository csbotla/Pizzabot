// See https://github.com/dialogflow/dialogflow-fulfillment-nodejs
// for Dialogflow fulfillment library docs, samples, and to report issues
'use strict';
 
const functions = require('firebase-functions');

const {WebhookClient} = require('dialogflow-fulfillment');
const {Card, Suggestion} = require('dialogflow-fulfillment');

const admin = require('firebase-admin');
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  databaseURL: 'ws://pizzabot-test-brtxxu.firebaseio.com/',
});
 
process.env.DEBUG = 'dialogflow:debug'; // enables lib debugging statements
 
exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
  const agent = new WebhookClient({ request, response });
  console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
  console.log('Dialogflow Request body: ' + JSON.stringify(request.body));
 
  function welcome(agent) {
    agent.add(`Welcome to my agent!`);
  }
 
  function fallback(agent) {
    agent.add(`I didn't understand`);
    agent.add(`I'm sorry, can you try again?`);
  }
  function saveorderData(agent){
    const name=agent.getContext('awaiting_confirm').parameters.name;
    const size=agent.getContext('awaiting_confirm').parameters.size;
    const toppings=agent.getContext('awaiting_confirm').parameters.toppings;
    const crust=agent.getContext('awaiting_confirm').parameters.crust;
    const address=agent.getContext('awaiting_confirm').parameters.address;
    const mobile_no=agent.getContext('awaiting_confirm').parameters.mobile_no;
    //const time=agent.getContext('awaiting_confirm').parameters.time;
    const time=`_${Date.now()}`;
    const order_id=mobile_no+`_${Date.now()}`;
    
    agent.add("Your order is placed! Sit back and Relax "+"Your Order id for future reference is: " +agent.getContext('awaiting_confirm').parameters.mobile_no+"_"+`${Date.now()}`);
    
    //return admin.database().ref('OrderData/'+mobile_no).set({
    return admin.database().ref('OrderData').child(mobile_no).child('Orders').push({
      name:name,
      size:size,
      toppings:toppings,
      crust:crust,
      address:address,
      mobile_no:mobile_no,
      time:time,
      orderid:order_id,
      order_status:"In Process"
    });    
    }
 function orderStatus(agent) {
   agent.add("your orderId");
     const order_id = agent.getContext('order_id').parameters.order_id;
     var orderDetails = order_id.split("_");
     agent.add("Your order with id:" + order_id);
     admin.database().ref('OrderData').child(orderDetails[0]).child('Orders').once('value').then((snapshot) => {
         if (order_id === snapshot.val().order_id) {
             agent.add(snapshot.val().order_status);
         } else {
             agent.add("no such order found");
         }
 });
 }
  
  // Run the proper function handler based on the matched Dialogflow intent name
  let intentMap = new Map();
  intentMap.set('Default Welcome Intent', welcome);
  intentMap.set('Default Fallback Intent', fallback);
  intentMap.set('Order-confirm-yes', saveorderData);
  //intentMap.set('order-status',orderStatus );
  agent.handleRequest(intentMap);
});




// function orderStatus(agent) {
//     console.log("Function called");  
//     const order_id = agent.parameters.orderid;
//       agent.add("Your order with id:");
      //var orderDetails = order_id.split("_");
          //console.log(orderDetails[0]);
      
       //return admin.database().ref('OrderData').once('value').then((snapshot) => {
         // if (order_id === snapshot.child(orderDetails[0]).child('Orders').val().order_id) {
           //   agent.add(snapshot.val().order_status);
          //} else {
            //  agent.add("no such order found");
          //}
  //});
  }