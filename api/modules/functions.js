
const fs = require('fs');
const path = require('path');
const { HOST, PORT } = process.env;
const config = require('../config.json')

async function createpath(fileName) {
    const ans = fs.readFileSync(fileName)
    const arr = ans.toString().split(';')
    let pathArr = [];
    let useArr = arr.filter(m =>
        (m + '').includes("app.use('/") && (m + '').includes("db")
    )
    useArr.forEach(e => {
        let r = e.indexOf(',')
        let rr = e.slice(11, r - 1)
        pathArr.push(rr)
    })
    return pathArr
}
async function createrouter(fileName) {
    const ans = fs.readFileSync(fileName)
    const arr = ans.toString().split(';')
    let routerArr = [];
    let useArr2 = arr.filter(m =>
        (m + '').includes("const") && (m + '').includes("_db")
    )
    useArr2.forEach(e => {
        let p = e.indexOf('=')
        let pp = e.slice(8, p)
        routerArr.push(pp)
    })
    return routerArr
}
async function createpathName(fileName) {
    const ans = fs.readFileSync(fileName)
    const arr = ans.toString().split(';')
    let pathNameArr = [];
    let useArr2 = arr.filter(m =>
        (m + '').includes("const") && (m + '').includes("_db")
    )
    useArr2.forEach(e => {
        let h = useArr2[0].indexOf('/')
        let hh = e.indexOf(')')
        let wer = e.slice(h + 1, hh - 1)
        pathNameArr.push(wer)
    })
    return pathNameArr;
}
async function createFunctionsbyRouterPage(fileName) {
    console.log("lll");
    let pathNameArr = await createpathName(fileName);
    console.log("now", pathNameArr);
    // const a = path.join(__dirname, '../../routers/create.js')  
    const a = path.join(__dirname, `../../${pathNameArr[0]}.js`)

    const ans = fs.readFileSync(a)
    let ans2 = ans.toString()
    const arr = ans.toString().split(';')
    // console.log("ggggggg",ans);
    return ans2
}

async function createAllObj(fileName,name) {
    let pathArr = await createpath(fileName);
    let routerArr = await createrouter(fileName);
    let pathNameArr = await createpathName(fileName);
    console.log("pathArr", pathArr);
  
    let allArr = [];
    // let ar = []
    let a = []
    let All = []
    let AllByRouter = []
   
    for (let i = 0;i<pathArr.length;i++){
        config.documents[i].functions.forEach(e => {
            a.push({ nameFunction:e.key,type: e.typeFun, path: e.path,exampleSend:e.exampleSend,parameters:e.arguments,exampleResponse:e.exampleResponse})
        })
        All.push({one:a})
        a=[]
        }
    for (let i = 0; i < pathArr.length; i++) {
        console.log("start",All[i])
        allArr.push({ path: pathArr[i], router: routerArr[i], pathName: pathNameArr[i], apiRequest: All[i].one})
    } 
    allArr.forEach(e=>{
        e.router.includes(`${name}`)?
       AllByRouter.push(e):''
 })
    // console.log("bbbbbbbbbb", AllByRouter);
    return AllByRouter
}
module.exports = { createpath, createrouter, createpathName, createAllObj, createFunctionsbyRouterPage }