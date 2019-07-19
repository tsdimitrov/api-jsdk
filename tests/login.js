/* eslint-env jasmine */

const Jsdk = require('../dist/api-js-sdk.js').default;
const jsdk = new Jsdk({ 
    apiCode: "JQq5BzW7a7d", 
    baseURL: "https://user-management-dev.codixfr.private/v1/"
}); 

describe('Get request tokens', () => {
    let requestTokens;
    let error;

    beforeEach((done) => {
        //jsdk.userLogin({username: "tsdimitrov", password: "dasdas"})
        jsdk.getRequestToken()
            .then((data) => {
                requestTokens = data;
                done();
            })
            .catch((err) => {
                error = err;
                done();
            });
    });

    it('should return the request token', () => {
        expect(error).toBeUndefined();
    });
});

// describe('Get authorised URL', () => {
//     jsdk = new Jsdk(configs);
//     let error;
//     const token = 'totally-obvious-fake-token';

//     const authorisedURL = jsdk.getAuthorisedURL(token);

//     it('should return the URL to authorise the requested token', () => {
//         expect(error).toBeUndefined();
//         expect(authorisedURL).toEqual(`${jsdk.baseURL}v4/oauth/authorise/?oauth_token=${token}`);
//     });
// });
