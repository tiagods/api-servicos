const fs = require('fs');
const {createLogger, format, transports} = require("winston");

const logger = createLogger({
    format: format.combine(
        format.timestamp(),
        format.simple()
    ),
    transports: [
        new transports.Console({
            format: format.combine(
                format.timestamp({
                    format: 'YYYY-MM-DD HH:mm:ss'
                }),
                format.colorize(),
                format.simple()
            )
        }),
        new transports.Stream({
            stream: fs.createWriteStream('./arquivo.log')
        })
    ]
})

module.exports = {
    logger
}