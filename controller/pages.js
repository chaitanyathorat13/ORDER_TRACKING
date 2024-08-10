exports.mainPage = (req, res)=>{
    res.sendFile('home.html', {root: './views/customers'})
}