var express = require("express");
var app = express();
var http = require("http");
var server = http.Server(app);
var socketio = require("socket.io");
var io = socketio(server);
app.use(express.static("pub"));

let products = [
    {
        itemName: "Gaming Desktop",
        price: 500.00,
        inStock: true,
        amtLeft: 3,
        imgSrc: './images/gamingPc.png'
    },
    {
        itemName: "Computer Monitor",
        price: 150.00,
        inStock: true,
        amtLeft: 3,
        imgSrc: './images/monitor.png'
    },
    {
        itemName: "Keyboard",
        price: 30.00,
        inStock: true,
        amtLeft: 1,
        imgSrc: './images/keyboard.jpg'
    },
    {
        itemName: "Mouse",
        price: 15.00,
        inStock: true,
        amtLeft: 2,
        imgSrc: './images/mouse.jpg'
    },
    {
        itemName: "HDMI Cable",
        price: 10.00,
        inStock: true,
        amtLeft: 4,
        imgSrc: './images/hdmi.jpg'
    },
    {
        itemName: "Computer Processor",
        price: 250.00,
        inStock: true,
        amtLeft: 7,
        imgSrc: './images/processor.jpg'
    },
    {
        itemName: "Graphics Card",
        price: 200.00,
        inStock: true,
        amtLeft: 3,
        imgSrc: './images/graphicsCard.jpg'
    },
    {
        itemName: "Laptop",
        price: 600.00,
        inStock: true,
        amtLeft: 5,
        imgSrc: './images/laptop.png'
    },
    {
        itemName: "Desk Chair",
        price: 300.00,
        inStock: true,
        amtLeft: 2,
        imgSrc: './images/chair.jpg'
    },
    {
        itemName: "Power Cord",
        price: 25.00,
        inStock: true,
        amtLeft: 15,
        imgSrc: './images/powerCord.jpg'
    },
    {
        itemName: "External Hard Drive",
        price: 50.00,
        inStock: true,
        amtLeft: 5,
        imgSrc: './images/exHardDrive.jpg'
    },
    {
        itemName: "UPS",
        price: 150.00,
        inStock: true,
        amtLeft: 5,
        imgSrc: './images/ups.jpg'
    }
]

let userDataBase = []
let sales = [];
let userActivity = [];

io.on("connection", function(socket) {
	console.log("Somebody connected.");


    socket.on("getProducts", function() {
        socket.emit("getProducts", products);
    });

    socket.on("removeItemFromUserCart", function(dataFromClient) {
        let name = dataFromClient.objName;
        console.log(name);
        let user = dataFromClient.user;
        let tempCart = [];
        for(let i = 0; i < userDataBase.length; i++){
            if(userDataBase[i].username == user){
                console.log(userDataBase[i].cart);
                for(let x = 0; x < userDataBase[i].cart.length; x++){
                    if(userDataBase[i].cart[x].itemName == name){
                        userDataBase[i].cart.splice(x, 1);
                        tempCart = userDataBase[i].cart;
                        console.log(tempCart)
                        break;
                    }
                }
            }
        }
        socket.emit("removeItemFromUserCart", tempCart);
    });

    socket.on("updateTotal", function(dataFromClient) {
        let user = dataFromClient;
        let tempUser = {
            objUser: user,
            total: 0
        }
        for(let i = 0; i < userDataBase.length; i++){
            if(userDataBase[i].username == user){
                console.log(userDataBase[i].cart);
                for(let x = 0; x < userDataBase[i].cart.length; x++){
                    tempUser.total += userDataBase[i].cart[x].price;
                }
            }
        }
        socket.emit("updateTotal", tempUser.total);
    });

    socket.on("putItemBackInProducts", function(dataFromClient) {
        let itemName = dataFromClient;
        for(let i = 0; i < products.length; i++){
            if(products[i].itemName == itemName){
                products[i].amtLeft++;
            }
        }
        io.emit("putItemBackInProducts", products);
    });

    socket.on("updateProductAmount", function(dataFromClient) {
        console.log("update product amt server side");
        let name = dataFromClient;
        for(let i = 0; i < products.length; i++){
            if(products[i].itemName == name){
                products[i].amtLeft--;
            }
        }
        io.emit("updateProductAmount", products);
    });

    socket.on("addItemToUserCart", function(dataFromClient) {
        console.log("adding item server side");
        console.log(dataFromClient);
        let itemObj = dataFromClient.itemObj;
        let user = dataFromClient.newUser;
        console.log(user);
        let newcart = [];
        for(let i = 0; i < userDataBase.length; i++){
            if(userDataBase[i].username == user){
                userDataBase[i].cart.push(itemObj);
                newcart = userDataBase[i].cart;
            } 
        }
        console.log(newcart);
        socket.emit("addItemToUserCart", newcart);
    });

    socket.on("generateAccount", function(dataFromClient) {
        console.log(dataFromClient);
        let accountStatus = true;
        let newUsername = dataFromClient.username;
        let newPassword = dataFromClient.password;
        let newUserObj = {
            username: newUsername,
            password: newPassword,
            cart: [],
            total: 0
        }
        if(userDataBase.length == 0){
            userDataBase.push(newUserObj);
            console.log("added new user");
        }
        else{
            userDataBase.forEach((obj) =>{
                if(obj.username == newUserObj.username){
                    accountStatus = false;
                }
            })
            if(accountStatus){
                console.log("added new user");
                userDataBase.push(newUserObj);
            }
            else{
                console.log("did not add new user");
                newUserObj.username = "";
                newUserObj.password = "";
            }
        }
        socket.emit("generateAccount", newUserObj);
    });

    socket.on("signIn", function(dataFromClient) {
        let newUsername = dataFromClient.username;
        let newPassword = dataFromClient.password;
        let newUserObj = {
            username: "",
            password: "",
            cart: []
        }
        userDataBase.forEach((obj) =>{
            if(obj.username == newUsername && obj.password == newPassword){
                newUserObj.username = newUsername;
                newUserObj.password = newPassword;
                newUserObj.cart = obj.cart;
                let dateStamp = new Date();
                userActivity.push({user: newUserObj.username, timeStamp: dateStamp});
            }
        })
        socket.emit("signIn", newUserObj);
    });
    
    socket.on("addToSales", function(dataFromClient) {
        sales.push(dataFromClient);
        let user = dataFromClient.user;
        for(let i = 0; i < userDataBase.length; i++){
            if(userDataBase[i].username == user){
                userDataBase[i].cart = [];
                userDataBase[i].total = 0;   
            } 
        }
        socket.emit("addToSales", true);
        console.log("sales");
        console.log(sales);
    });
});


server.listen(80, function() {
    console.log("Server is now running.");
});
