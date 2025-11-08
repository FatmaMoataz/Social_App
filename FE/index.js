const clientIo = io("http://localhost:3000/" , {
    auth: {authorization: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2OGI5NjdjMjAxMDIwNTViOTkwZGY5MGUiLCJqdGkiOiIyODA4YjU5ZC1iYzQ1LTRhNGUtODNhNS1mZTlhODdkZjA2NWMiLCJpYXQiOjE3NTk5MDkxNDQsImV4cCI6MTc1OTkxMjc0NH0.v0xMY5wEyOGMGOr1n5n2U-_WIaFsLCP9KMrJ_kZo31Y"}
})
const clientIo2 = io("http://localhost:3000/admin")

clientIo.on("connect", () => {
    console.log("Server establish connection successfully");
})

clientIo.on("connect_error", (error) => {
    console.log(`Connection error ${error.message}`);
})

clientIo.emit("sayHi" , "Hello from FE to BE" , (res) => {
console.log({res});
})

clientIo.on("productStock" , (data , callback) => {
    console.log({product : data});
    
    callback("Done")
})