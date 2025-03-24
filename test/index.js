const assert = require('assert'),
    { WebSocket } = require('ws'),
    Koa = require('koa'),
    Router = require('koa-router'),
    KoaWs = require('../index')

process.env.NODE_ENV = 'test'

describe('reed-koa-websocket test', () => {
    const router = new Router()
    router.all('/echo', ctx => {
        ctx.websocket.on('message', msg => ctx.websocket.send(msg));
    })

    router.all('/channel/:name', ctx => {
        ctx.websocket.on('message', msg => {
            ctx.websocket.send(JSON.stringify({
                params: { ...ctx.params },
                query: { ...ctx.query },
                msg: msg.toString()
            }))
        })
    })

    const app = new Koa()
    app.ws = new KoaWs(app)
    app.ws.use(router.routes())

    let server;
    before(done => {
        server = app.listen(done)
    })

    it('echo msg', done => {
        const client = new WebSocket(`ws://localhost:${server.address().port}/echo`)

        client.on('message', msg => {
            assert.strictEqual(msg.toString(), 'hello')
            done()
            client.close()
        })

        client.on('open', () => client.send('hello'))
    })

    it('echo msg 2', done => {
        const client = new WebSocket(`ws://localhost:${server.address().port}/channel/hans?foo=bar`)

        client.on('message', msg => {
            
            let data = JSON.parse(msg.toString())

            assert.strictEqual(data.params.name, 'hans')
            assert.strictEqual(data.query.foo, 'bar')
            assert.strictEqual(data.msg, 'hello')

            done()
            client.close()
        })

        client.on('open', () => client.send('hello'))
    })

    after(async () => {
        await server.close()
    })
})