var _ = require('lambdash');

function TypedEither(L,R) {
    var Either = _.Type.sum('Either', {Left: {value: L}, Right: {value: R}});

    var Left = Either.Left;
    var Right = Either.Right;

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
                return Right(fn.apply(this, arguments));
            } catch (e) {
                return Left(e);
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
        return Either.isLeft(either) ? either : Right(fn(either.value));
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

    Either.of = Either.Right;

    Either.ap = _.curry(function(apply, either) {
        return Either.isLeft(apply) ? apply : Either.map(apply.value, either);
    });

    Either.flatten = _.curry(function(either) {
        return Either.isLeft(either) ? either : either.value;
    });

    Either.show = Either.case({
        Left: function(value) {
            return "Either.Left(" + _.show(value) + ")";
        },
        Right: function(value) {
            return "Either.Right(" + _.show(value) + ")";
        }
    });

    return Either;
}

var Either = TypedEither(_.Any, _.Any);

module.exports = Either;
