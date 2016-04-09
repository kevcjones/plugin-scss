const log = function log(level, msg, _isTerminal) {

    const prefix = '[plugin-scss]';
    const isTerminal = _isTerminal || false;
    if (!isTerminal) {
        console.log(prefix, msg);
    } else {
        // set the color of message based on level
        let msgColor = '\x1b[0m'; // 0 = terminal
        switch (level) {
            case 'info':
                msgColor = '\x1b[36m';
                break;
            case 'warn':
                msgColor = '\x1b[33m';
                break;
            case 'error':
                msgColor = '\x1b[31m';
                break;
            default:
                msgColor = '\x1b[36m';
                break;
        }

        console.log('\x1b[36m', prefix, msgColor, msg, '\x1b[0m');
    }
};

export default log;
