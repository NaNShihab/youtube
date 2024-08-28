const asyncHandler = (requesthandler) => {
    (res, req, next) => {
        Promise.resolve((requesthandler(res, req, next))).catch((error) => next(error))
    }
}

export {asyncHandler}