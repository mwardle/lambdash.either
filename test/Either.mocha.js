var assert = require('assert');

var _ = require('lambdash');
var Either = require('../src/Either');

var Left = Either.Left;
var Right = Either.Right;

describe('Either', function() {
    describe('#member', function() {
        it('should return true if the value is a Right or Left', function() {
            assert.equal(Either.member(Left('error')), true);
            assert.equal(Either.member(Right(1)), true);
        });
        it('should return false if the value is not a Right or Left', function() {
            assert.equal(Either.member(1), false);
            assert.equal(Either.member(true), false);
            assert.equal(Either.member([]), false);
            assert.equal(Either.member('Right'), false);
        });
    });

    describe('#isLeft', function() {
        it('should return true if the value is a Left', function() {
            assert.equal(Either.isLeft(Left(1)), true);
            assert.equal(Either.isLeft(Left('Error')), true);
        });

        it('should return false if the value is a Right', function() {
            assert.equal(Either.isLeft(Right(1)), false);
            assert.equal(Either.isLeft(Right(false)), false);
        });
    });

    describe('#isRight', function() {
        it('should return false if the value is a Left', function() {
            assert.equal(Either.isRight(Left(1)), false);
            assert.equal(Either.isRight(Left('Error')), false);
        });

        it('should return true if the value is a Right', function() {
            assert.equal(Either.isRight(Right(1)), true);
            assert.equal(Either.isRight(Right(false)), true);
        });
    });

    describe('#either', function() {
        it('should execute the left function if the value is a left', function() {
            var l = function(value) {return 'Left: ' + value;};
            var r = function(value) {return 'Right: ' + value;};

            var e = Left('Error');

            assert.equal(Either.either(l,r,e), 'Left: Error');
        });

        it('should execute the right function if the value is a right', function() {
            var l = function(value) {return 'Left: ' + value;};
            var r = function(value) {return 'Right: ' + value;};

            var e = Right('Ok');

            assert.equal(Either.either(l,r,e), 'Right: Ok');
        });
    });

    describe('#lefts', function() {
        it('should filter out all the rights in a sequence', function() {
            var arr = [
                Left(1),
                Right(2),
                Left(3),
                Right(4),
            ];

            var ls = Either.lefts(arr);

            assert(_.Arr.member(ls));
            assert(ls.length, 2);
            assert(Either.isLeft(ls[0]));
            assert(Either.isLeft(ls[1]));
            assert.equal(ls[0].value, 1);
            assert.equal(ls[1].value, 3);
        });
    });

    describe('#rights', function() {
        it('should filter out all the lefts in a sequence', function() {
            var arr = [
                Left(1),
                Right(2),
                Left(3),
                Right(4),
            ];

            var ls = Either.rights(arr);

            assert(_.Arr.member(ls));
            assert(ls.length, 2);
            assert(Either.isRight(ls[0]));
            assert(Either.isRight(ls[1]));
            assert.equal(ls[0].value, 2);
            assert.equal(ls[1].value, 4);
        });
    });

    describe('#concat', function() {
        it('should concat two right values', function() {
            var e1 = Right([1,2,3]);
            var e2 = Right([4,5,6]);
            var e3 = Left('e3');
            var e4 = Left('e4');

            assert(_.eq(Either.concat(e1,e2), Right([1,2,3,4,5,6])));
            assert(_.eq(Either.concat(e2,e1), Right([4,5,6,1,2,3])));
            assert(_.eq(Either.concat(e3,e1), e3));
            assert(_.eq(Either.concat(e1,e3), e3));
            assert(_.eq(Either.concat(e3,e4), e3));
        });
    });

    describe('#caught', function() {
        it('should create a function that takes another function', function() {
            var fn = function(a, b) {return a + b;};
            var c = Either.caught(fn);

            assert(_.Fun.member(c));
            assert.equal(c.length, 2);
        });

        it('should return a left if an exception is thrown by its inner function', function() {
            var fn = function(a, b) {throw new TypeError('Oh No');};

            var c = Either.caught(fn);

            var result = c(1,2);

            assert(Either.isLeft(result));
            assert(result.value instanceof TypeError);
            assert.equal(result.value.message, 'Oh No');
        });

        it('should return a right if an exception is not thrown by its inner function', function() {
            var fn = function(a, b) {return a + b;};

            var c = Either.caught(fn);

            var result = c(1,2);

            assert(Either.isRight(result));
            assert.equal(result.value, 3);
        });
    });

    describe('#compare', function() {
        it('should return _.LT if left value is less than the right', function() {
            assert.equal(Either.compare(Left(1), Right(0)), _.LT);
            assert.equal(Either.compare(Left(1), Right(1)), _.LT);
            assert.equal(Either.compare(Left(1), Left(2)), _.LT);
            assert.equal(Either.compare(Right(1), Right(2)), _.LT);
        });

        it('should return _.GT if left value is greater than the right', function() {
            assert.equal(Either.compare(Right(0), Left(1)), _.GT);
            assert.equal(Either.compare(Right(1), Left(1)), _.GT);
            assert.equal(Either.compare(Left(2), Left(1)), _.GT);
            assert.equal(Either.compare(Right(2), Right(1)), _.GT);
        });

        it('should return _.EQ if left value is greater than the right', function() {
            assert.equal(Either.compare(Left(2), Left(2)), _.EQ);
            assert.equal(Either.compare(Right(2), Right(2)), _.EQ);
        });
    });

    describe('#fmap', function() {
        it('should return the either if the either is a Left', function() {
            var e = Left(1);
            var fn = function(x) {return x + 1;};

            var result = Either.fmap(fn, e);

            assert(Either.isLeft(result));
            assert.equal(result.value, 1);
        });

        it('should return a Right with the function applied to the value if the either is a Right', function() {
            var e = Right(2);
            var fn = function(x) {return x + 1;};

            var result = Either.fmap(fn, e);

            assert(Either.isRight(result));
            assert.equal(result.value, 3);
        });
    });

    describe('#fold', function() {
        it('should return the init if the either is a Left', function() {
            var e = Left(2);
            var fn = function(accum, x) { return accum + x; };

            var result = Either.fold(fn, 1, e);

            assert.equal(result, 1);
        });

        it('should apply the function if the either is a Right', function() {
            var e = Right(2);
            var fn = function(accum, x) { return accum + x; };

            var result = Either.fold(fn, 1, e);

            assert.equal(result, 3);
        });
    });

    describe('#of', function() {
        it('should return a Right with the value give as its contents', function() {
            var e1 = Either.of(1);
            var e2 = Either.of('ok');

            assert(Either.isRight(e1));
            assert(Either.isRight(e2));
            assert.equal(e1.value, 1);
            assert.equal(e2.value, 'ok');
        });
    });

    describe('#ap', function() {
        it('should return the left if the apply is a left', function() {
            var a = Left('Oh No');
            var e = Right(1);

            var result = Either.ap(a, e);

            assert(Either.isLeft(result));
            assert.equal(result.value, 'Oh No');
        });

        it('should return the right value if it is a Left and the left value is not a Left', function() {
            var a = Right(function(x) {return x + 1;});
            var e = Left('Oh No');

            var result = Either.ap(a, e);

            assert(Either.isLeft(result));
            assert.equal(result.value, 'Oh No');
        });

        it('should return a Right with its contents as the applied\'s contents applied to the applied to\'s contents', function() {
            var a = Right(function(x) {return x + 1;});
            var e = Right(2);

            var result = Either.ap(a, e);

            assert(Either.isRight(result));
            assert.equal(result.value, 3);
        });
    });

    describe('#flatten', function() {
        it('should return the value as is if it is a left', function() {
            var e1 = Left(1);
            var e2 = Left(Left(1));

            var r1 = Either.flatten(e1);
            var r2 = Either.flatten(e2);

            assert(Either.isLeft(r1));
            assert(Either.isLeft(r2));
            assert(Either.isLeft(r2.value));
            assert.equal(r1.value, 1);
            assert.equal(r2.value.value, 1);
        });

        it('should return nested either if the value is a right', function() {
            var e1 = Right(Right(1));
            var e2 = Right(Left(1));

            var r1 = Either.flatten(e1);
            var r2 = Either.flatten(e2);

            assert(Either.isRight(r1));
            assert.equal(r1.value, 1);

            assert(Either.isLeft(r2));
            assert.equal(r2.value, 1);
        });
    });

    describe('#show', function() {
        it('should properly show a Left value', function() {
            assert.equal(Either.show(Left(1)), 'Either.Left(1)');
        });
        it('should properly show a Right value', function() {
            assert.equal(Either.show(Right(1)), 'Either.Right(1)');
        });
    });

    describe('@implements', function() {
        it('should implement Eq', function() {
            assert(_.Eq.member(Right(1)));
            assert(_.Eq.member(Left(1)));
        });

        it('should implement Ord', function() {
            assert(_.Ord.member(Right(1)));
            assert(_.Ord.member(Left(1)));
        });

        it('should implement Semigroup', function() {
            assert(_.Semigroup.member(Right(1)));
            assert(_.Semigroup.member(Left(1)));
        });

        it('should implement Functor', function() {
            assert(_.Functor.member(Right(1)));
            assert(_.Functor.member(Left(1)));
        });

        it('should implement Foldable', function() {
            assert(_.Foldable.member(Right(1)));
            assert(_.Foldable.member(Left(1)));
        });

        it('should implement Applicative', function() {
            assert(_.Applicative.member(Right(1)));
            assert(_.Applicative.member(Left(1)));
        });

        it('should implement Monad', function() {
            assert(_.Monad.member(Right(1)));
            assert(_.Monad.member(Left(1)));
        });

        it('should implement Show', function() {
            assert(_.Show.member(Right(1)));
            assert(_.Show.member(Left(1)));
        });
    });
});
