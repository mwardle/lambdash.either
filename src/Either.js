const _ = require('lambdash');

function TypedEither(L,R) {
    const Either = _.Type.sum('Either', {Left: {value: L}, Right: {value: R}});

    const Left = Either.Left;
    const Right = Either.Right;

    /**
     * @sig (a -> c) -> (b -> c) -> Either a b -> c
     */
    Either.either = _.curry(function(leftFn, rightFn, either) {
        return Either.case({
            Left: leftFn,
            Right: rightFn,
        }, either);
    });

    Either.lefts = _.filter(Either.isLeft);

    Either.rights = _.filter(Either.isRight);

    Either.concat = _.curry(function(left, right) {
        if (Either.isLeft(left)) {
            return left;
        }
        if (Either.isLeft(right)) {
            return right;
        }
        return Right(_.concat(left.value, right.value));
    });

    Either.caught = _.curry(function(fn) {
        return _.curryN(fn.length, function() {
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
        return Either.isLeft(either) ? either : _Either.Right(fn(either.value));
    });

    Either.fold = _.curry(function(fn, init, either) {
        return Either.case({
            Left: init,
            Right: function(value) {
                return fn(init, value);
            },
        }, either);
    });

    Either.foldr = Either.foldl = Either.fold;

    Either.of = Either.Right;

    Either.ap = _.curry(function(apply, either) {
        return apply.isLeft() ? apply : Either.map(apply.value, either);
    });

    Either.alt = _.curry((f, s) => Either.case({
        Left: s,
        Right: f,
    }, f));

    Either.flatten = _.curry(function(either) {
        return Either.isLeft(either) ? either : either.value;
    });

    Either.show = Either.case({
        Left: function(value) {
            return 'Either.Left(' + _.show(value) + ')';
        },
        Right: function(value) {
            return 'Either.Right(' + _.show(value) + ')';
        },
    });

    Either.hashWithSeed = _.curry((seed, either) => {

        const newSeed = Either.isLeft(either)
            ? _.Hashable.hashWithSeed(seed, 0)
            : _.Hashable.hashWithSeed(seed, 1)
        ;

        return _.Hashable.hashWithSeed(newSeed, either.value);
    });

    _.Eq.deriveFor(Either);
    _.Ord.deriveFor(Either);
    _.Semigroup.deriveFor(Either);
    _.Functor.deriveFor(Either);
    _.Applicative.deriveFor(Either);
    _.Foldable.deriveFor(Either);
    _.Monad.deriveFor(Either);
    _.Show.deriveFor(Either);
    _.Hashable.deriveFor(Either);

    return Either;
}

const _Either = TypedEither(_.Any, _.Any);
_Either.Typed = TypedEither;

module.exports = _Either;
