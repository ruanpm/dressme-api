var codes = {

	// 200 - Successful 2xx
	OK: 200,
	CREATED: 201,
	ACCEPTED: 202,
	NO_CONTENT: 204,

	// 400 - Client Error 4xx
	BAD_REQUEST: 400,
	UNAUTHORIZED: 401,
	NOT_FOUND: 404,
	CONFLICT: 409,
	UNPROCESSABLE_ENTITY: 422,

	// 500 - Server Error 5xx
	INTERNAL_SERVER_ERROR: 500
};


Object.freeze(codes);

module.exports = codes;
