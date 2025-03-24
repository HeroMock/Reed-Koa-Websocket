
const { WebSocketServer } = require('ws'),
    compose = require('koa-compose'),
    log = require('debug')('Websocket')

module.exports = class KoaWs {
    constructor(app, wsOptions) {
        this.app = app

        this.middleware = []

        this.wsServer = new WebSocketServer({ ...wsOptions, noServer: true });
        this.wsServer.on('connection', (...s) => this._onConnection(...s))

        this._wrapListen(app)
    }

    use(fn) {
        this.middleware.push(fn)
        return this
    }

    _wrapListen(app) {
        const oldListen = app.listen

        app.listen = (...args) => {

            app.server = oldListen.apply(app, args)
            app.server.on('upgrade', (...s) => this._onUpgrade(...s))
            app.server.on('close', () => this.wsServer.close())

            return app.server
        }
    }

    _onUpgrade(request, socket, head) {
        this.wsServer.handleUpgrade(request, socket, head, ws => {
            this.wsServer.emit('connection', ws, request)
        })
    }

    _onConnection(socket, request) {
        log(`Connection received: ${request.url}`)

        socket.on('error', e => log(`OnConnection Error: ${e.message}`))

        const fn = compose(this.middleware),
            context = this.app.createContext(request)
        context.websocket = socket;
        context.path = new URL(request.url, `ws://${request.headers.host}`).pathname

        fn(context)
            .catch(e => log(`Middleware Chain Error: ${e.message}`))
    }
}