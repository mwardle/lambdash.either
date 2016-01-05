var _ = require('lambdash');

var Either = _.Type.sum('Either', {Left: {value: null}, Right: {value: null}});

Either.isLeft = Either.case({
    Left: true,
    Right: false
});

Either.isRight = Either.case({
    Left: false,
    Right: true
});

/**
 * @sig (a -> c) -> (b -> c) -> Either a b -> c
 */
Either.either = _.curry(function(leftFn, rightFn, either){
    return Either.case({
        Left: leftFn,
        Right: rightFn
    }, either);
});

Either.lefts = _.filter(Either.isLeft);

Either.rights = _.filter(Either.isRight);

Either.caught = _.curry(function(fn) {
    return _.curryN(fn.length, function(){
        try {
            return Either.right(fn.apply(arguments));
        } catch (e) {
            return Either.left(e);
        }
    });
});

Either.compare = _.curry(function(left, right) {
    if (Either.isLeft(left)) {
        if (Either.isLeft(right)) {
            return _.compare(left.value, right.value);
        }

        return _.LT;
    }

    if (Either.isLeft(right)) {
        return _.GT;
    }

    return _.compare(left.value, right.value);
});

Either.map = _.curry(function(fn, either) {
    return Either.isLeft(either) ? either : Either.Right(fn(either.value));
});

Either.fold = _.curry(function(fn, init, either) {
    return Either.case({
        Left: init,
        Right: function(value) {
            return fn(init, value);
        }
    }, either);
});

Either.foldr = Either.foldl = Either.fold;

Either.of = Either.right;

Either.ap = _.curry(function(apply, either) {
    return Either.isLeft(either) ? either : Either.map(apply.value, either);
});

Either.flatten = _.curry(function(either) {
    return Either.isLeft(either) ? either : Either.value;
});