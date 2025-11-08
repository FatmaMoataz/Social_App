const clientIo = io("http://localhost:3000/")
const clientIo2 = io("http://localhost:3000/admin")

clientIo.on("connect", () => {
    console.log("Server establish connection successfully");
})

clientIo.emit("sayHi" , "Hello from FE to BE" , (res) => {
console.log({res});
})

clientIo.on("productStock" , (data , callback) => {
    console.log({product : data});
    
    callback("Done")
})