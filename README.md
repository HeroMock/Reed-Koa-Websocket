# Reed-Koa-Websocket
Routable Websocket Wrapper for KOA (ES6+)


## Sample

```js
const Koa = require('koa'),
    Router = require('koa-router'),
    KoaWs = require('reed-koa-websocket')

const app = new Koa()
app.ws = new KoaWs(app)

const router = new Router()
router.all('/channel/:name', ctx => {

    ctx.websocket.send(`Hello ${ctx.params.name}`)

    ctx.websocket.on('message', msg => {
        // echo back
        ctx.websocket.send(JSON.stringify({
            params: { ...ctx.params },
            query: { ...ctx.query },
            msg
        }))
    })
})

app.ws.use(router.routes())
app.listen(8080)

// 
// let client = new WebSocket('ws://localhost:8080/channel/hans?foo=bar')
// ...
```

## Class: KoaWs

__constructor(app[, wsOptions])__

`app`: KOA Application

`wsOptions`: [optional] construction options for [ws](https://github.com/websockets/ws/blob/master/doc/ws.md#new-websocketaddress-protocols-options)


