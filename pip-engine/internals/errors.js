function NotImplementedError() {
    const error = new Error('Not implemented');
    error.name = 'NotImplementedError';
    return error;
}

module.exports = {
    NotImplementedError,
};