module.exports = {
    apps: [{
        name: 'test_backend_web_tedarikci_portal',
        script: 'server.js',
        autorestart: true,
        watch: false,
        time: true,
        error_file: 'logs/pm2-error.log',
        out_file: 'logs/pm2-out.log',
        log_file: 'logs/pm2-combined.log',
    }]
};