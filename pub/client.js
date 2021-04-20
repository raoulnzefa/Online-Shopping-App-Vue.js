

var socket = io();
let vm = {
    data() { //properties of our object must be established here, and are returned as an object.
        return {
            products: null,
            cart: [],
            cartAmt: 0,
            total: 0,
            user: null,
            viewType: "login",
            taxes: 0,
            totalAft: 0,
            orderComplete: false,
        }
    }, 
    methods: { //An object that contains whatever methods we need.
        getProducts(){
            socket.emit("getProducts");
            socket.on("getProducts", dataFromServer => {
                this.products = dataFromServer;
            });
           this.updateTotal();
        },

        addToCart(obj){
            socket.emit("updateProductAmount", obj.itemName);
            socket.on("updateProductAmount", dataFromServer =>{
                this.products = dataFromServer;
            });
            socket.emit("addItemToUserCart", {itemObj: obj, newUser: this.user});
            socket.on("addItemToUserCart", dataFromServer =>{
                this.cart = dataFromServer;
                this.cartAmt = this.cart.length;
            });
            this.updateTotal();
            console.log("adding product to some users cart");
        },

        removeItemFromCart(cartItem){
            let item;
            for(let i = 0; i < this.cart.length; i++){
                if(this.cart[i].itemName == cartItem.itemName){
                    item = this.cart[i];
                    socket.emit("removeItemFromUserCart", {objName: item.itemName, user: this.user});
                    socket.on("removeItemFromUserCart", dataFromServer =>{
                        this.cart = dataFromServer;
                        this.cartAmt = this.cart.length;
                    });
                    this.cartAmt--;
                    break;
                }
            }
            socket.emit("putItemBackInProducts", item.itemName)
            socket.on("putItemBackInProducts", dataFromServer =>{
                this.products = dataFromServer;
            });
            this.updateTotal();
        },

        openCartView(){
            this.viewType = "cartView";
            this.orderComplete = false;
        },

        backToShoppingView(){
            this.viewType = "productsView";
            this.orderComplete = false;
        },

        openCheckout(){
            this.viewType = "checkout";
            let newTot = this.total * 0.06;
            this.taxes = newTot;
            this.totalAft = this.total + newTot;
        },

        generateAccount(){
            let newUsername = document.getElementById("createdUsername").value;
            let newPassword = document.getElementById("createdPassword").value;
            let status = document.getElementById("statusBar");
            if(newUsername == "" || newPassword == ""){
                newUsername = "";
                newPassword = "";
                status.innerHTML = "Invalid credentials";
            }
            else{
                let obj = {
                    username: newUsername,
                    password: newPassword
                }
                socket.emit("generateAccount", {username: obj.username, password: obj.password});
                socket.on("generateAccount", function(dataFromServer){
                    newUsername = "";
                    newPassword = "";
                    if(dataFromServer.username == "" && dataFromServer.password == ""){
                        status.innerHTML = "Account could not be created";
                    }
                    else{
                        status.innerHTML = "Account created successfully";
                    }
                });
            } 
        },

        signIn(){
            let newUsername = document.getElementById("signInUsername").value;
            let newPassword = document.getElementById("signInPassword").value;
            let status = document.getElementById("statusBar");
            if(newUsername == "" || newPassword == ""){
                newUsername = "";
                newPassword = "";
                status.innerHTML = "Invalid credentials";
            }
            else{
                let obj = {
                    username: newUsername,
                    password: newPassword
                }
                socket.emit("signIn", {username: obj.username, password: obj.password});
                socket.on("signIn", dataFromServer =>{
                    newUsername = "";
                    newPassword = "";
                    if(dataFromServer.username == "" && dataFromServer.password == ""){
                        status.innerHTML = "Invalid Credentials";
                    }
                    else{
                        this.user = dataFromServer.username;
                        this.cart = dataFromServer.cart;
                        this.cartAmt = dataFromServer.cart.length;
                        this.viewType = "productsView";
                        this.getProducts();
                    }
                });
            }
        },

        updateTotal(){
            socket.emit("updateTotal", this.user)
            socket.on("updateTotal", dataFromServer =>{
                this.total = dataFromServer;
            });          
        },

        completePurchase(){
            let goodPurchase = true;
            let purchaseObj = {
                user: null,
                objEmail: null,
                objName: null,
                objCc: null,
                objState: null,
                objCity: null,
                objStreet: null,
                cart: this.cart,
                total: this.totalAft,
            }
            let arr = [];
            let email = document.getElementById("email").value;
            let name = document.getElementById("name").value;
            let creditCard = document.getElementById("cc").value;
            let state = document.getElementById("state").value;
            let street = document.getElementById("street").value;
            let city = document.getElementById("city").value;
            arr.push(email, name, creditCard, state, city, street);
            arr.forEach((item) =>{
                if(item == ""){
                    let status = document.getElementById("purchaseStatus");
                    status.innerHTML = "Invalid Credentials: missing field";
                    goodPurchase = false;
                }
            })

            if(goodPurchase){
                purchaseObj.user = this.user;
                purchaseObj.objEmail = email;
                purchaseObj.objName = name;
                purchaseObj.objCc = creditCard;
                purchaseObj.objState = state;
                purchaseObj.objCity = city;
                purchaseObj.objStreet = street;

                socket.emit("addToSales", purchaseObj);
                socket.on("addToSales", dataFromServer =>{
                    this.total = 0;
                    this.cart = [];
                    this.cartAmt = 0;
                });
                this.orderComplete = true;
            }
        }



        
    },
    computed: { //computed properties (methods that compute stuff based on "data" properties)
        //Do not change the value of a property from within these functions.  Side-effects
        //will not be reliable because Vue might skip calls to computed functions as an optimization.
    }
}

let app = Vue.createApp(vm).mount('#main');