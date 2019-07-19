import axios from "axios";
import isUrl from "is-url";
import queryString from "query-string";

/**
 * Rejects the request.
 * @return {Promise} error - Returns a Promise with the details for the wrong request.
 */
function rejectValidation(module, param) {
  return Promise.reject(
    new Error({
      status: 0,
      message: `The ${module} ${param} is not valid or it was not specified properly`
    })
  );
}

/**
 * Set header and berear token.
 * @return {Object} header - Returns an object with the Authorization header.
 */
function createHeader(token) {
  const auth = token !== undefined ? token : localStorage.getItem("api-token");
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${auth}`
  };

  return headers;
}

/**
 * Get the request token.
 * @see {@link https://user-management-dev.codixfr.private/docs.html#operation/auth.token|API Call}
 * @return {Promise} Credentials - Returns a Promise that, when fulfilled, will either return an string with the
 * token or an Error with the problem.
 */
function getRequestToken(authURL, apiCode) {
  const options = {};
  options.baseURL = authURL;
  options.apiCode = apiCode;

  const api = new APICall(options);

  return api
    .send("GET", `auth/token?code=${options.apiCode}`)
    .then(response => {
      if (response.token.length) {
        localStorage.setItem("api-token", response.token);
      }
    });
}

/**
 * @classdesc Represents an API call.
 * @class
 * @abstract
 */
class APICall {
  /**
   * Create a APICall.
   * @constructor
   * @param {string} baseURL - A string with the base URL for account.
   * @param {string} apiCode - Access api code.
   * @param {Object} [data={}] - An object containing the query parameters.
   */
  constructor(options) {
    if (!isUrl(options.baseURL))
      throw new Error("The base URL provided is not valid");

    this.baseURL = options.baseURL;
    this.apiCode = options.apiCode;
    this.authURL = options.authURL;
  }

  /**
   * Fetch the information from the API.
   * @return {Promise} - Returns a Promise that, when fulfilled, will either return an JSON Object with the requested
   * data or an Error with the problem.
   */
  send(method, url, data = {}) {
    let callURL = this.baseURL + url;
    const headers = createHeader();
    let body = "";

    if (method === "POST" || method === "PUT") {
      body = JSON.stringify(data);
    } else if (data.length) {
      const query = queryString.stringify(data, { arrayFormat: "index" });
      callURL = `${callURL}?${query}`;
    }

    // const instance = axios.create();
    // instance.interceptors.response.use(function (response) {
    //     return response;
    //   }, function (error) {
    //     return Promise.reject(error);
    //   });

    return axios(callURL, {
      method,
      withCredentials: true,
      data: body,
      headers
    })
      .then(response => {
        if (response.status >= 200 && response.status <= 202) {
          return response.data;
        }
        return {};
      })
      .catch(error => {
        if (error.response.status === 401) {
          getRequestToken(this.authURL, this.apiCode).then(() => {
            const errObj = error;
            errObj.config.headers = createHeader();
            return axios.request(error.config);
          });
        }
        if (error.response.status >= 402) {
          // check for 4XX, 5XX
          return Promise.reject(
            new Error({
              status: error.response.status,
              message: error.response.statusText
            })
          );
        }
        return {};
      });
  }
}

/**
 * @classdesc Represents the Jsdk SDK. It allows the user to make every call to the API with a single function.
 * @class
 */
export default class Jsdk {
  /**
   * Create Jsdk SDK.
   * @constructor
   * @param {String} options.apiCode - The access token.
   * @param {String} options.baseURL - The API URL.
   * @param {String} options.authURL - The URL used for authentication.
   * @param {Object} options - An object containing filter data and the base URL.
   */
  constructor(options) {
    this.options = options;
    this.baseURL = options.baseURL;
    this.authURL = options.authURL;
    this.apiCode = options.apiCode;

    this.api = new APICall(options);
  }

  /**
   * Login.
   * @see {@link https://user-management.codixfr.private/docs.html|API Call}
   * @param {Object} params={} - An object containing the credentials with which the user intends to login.
   * @param {String} params.username - The username of the user.
   * @param {String} params.password - The password of the user.
   * @return {Promise} Credentials - Returns a Promise that, when fulfilled, will either return an Object with the
   * credentials for login or an Error.
   */
  userLogin(params) {
    if (params.sso) {
      const returnUrl = window.location.href;
      localStorage.removeItem("token");
      const url = new URL(this.baseURL);
      return window.location.assign(
        `${url.origin}/login?redirect_url=${returnUrl}`
      );
    }
    if (!params.username || !params.password) {
      return rejectValidation("authentication", "username, password");
    }

    return this.api.send("POST", "auth/login", params).then(response => {
      if (response.id.length) {
        const user = JSON.stringify(response);
        localStorage.setItem("user", user);
      }
    });
  }

  /**
   * Get the request token.
   * @see {@link https://user-management-dev.codixfr.private/docs.html#operation/auth.token|API Call}
   * @return {Promise} Credentials - Returns a Promise that, when fulfilled, will either return an string with the
   * token or an Error with the problem.
   */
  getToken() {
    this.authURL = this.authURL ? this.authURL : this.baseURL;
    const data = queryString.parse(window.location.search);
    if (data.token) {
      localStorage.setItem("token", data.token);
      window.history.replaceState(null, null, window.location.pathname);
      return axios(`${this.authURL}auth/identity`, {
        method: "get",
        headers: createHeader(data.token)
      }).then(response => {
        if (response.data) {
          localStorage.setItem("user", JSON.stringify(response.data));
        }
      });
    }

    return getRequestToken(this.authURL, this.apiCode);
  }

  /**
   * Get API resource.
   * @see {@link https://api-mmpi-dev.codixfr.private/docs.html|API Call}
   * @param {string} resource - The name of the desired asset.
   * @return {Promise} Resource - Returns a Promise that, when fulfilled, will either return an Object with the asset or
   * an Error with the problem.
   */
  get(resource, options) {
    if (!resource) {
      return rejectValidation("get resource", "params");
    }
    return this.api.send("GET", resource, options);
  }

  /**
   * Post API resource.
   * @see {@link https://api-mmpi-dev.codixfr.private/docs.html|API Call}
   * @param {string} resource - The name of the desired asset.
   * @return {Promise} Resource - Returns a Promise that, when fulfilled, will either return an Object with the asset or
   * an Error with the problem.
   */
  post(resource, options) {
    if (!resource) {
      return rejectValidation("post resource", "params");
    }
    return this.api.send("POST", resource, options);
  }

  /**
   * Put API resource.
   * @see {@link https://api-mmpi-dev.codixfr.private/docs.html|API Call}
   * @param {string} resource - The name of the desired asset.
   * @return {Promise} Resource - Returns a Promise that, when fulfilled, will either return an Object with the asset or
   * an Error with the problem.
   */
  put(resource, options) {
    if (!resource) {
      return rejectValidation("put resource", "params");
    }
    return this.api.send("PUT", resource, options);
  }

  /**
   * Delete API resource.
   * @see {@link https://api-mmpi-dev.codixfr.private/docs.html|API Call}
   * @param {string} resource - The name of the desired asset.
   * @return {Promise} Resource - Returns a Promise that, when fulfilled, will either return an Object with the asset or
   * an Error with the problem.
   */
  delete(resource, options) {
    if (!resource) {
      return rejectValidation("delete resource", "params");
    }
    return this.api.send("DELETE", resource, options);
  }
}
