# Either

This package implements an either type for [lambdash](https://github.com/mwardle/lambdash.git).

## Installation

Use npm.

```

npm install --save lambdash.either

```

## Implements

1. Eq
2. Ord
3. Functor
4. Semigroup (If its right type implements Semigroup)
5. Monoid
6. Foldable
7. Applicative
8. Monad
9. Show

## Typed Either

By default the Either implementation accepts any value for the left or the right.
You can create typed Either like so:

```javascript
    var _ = require('lambdash');
    var Either = require('lambdash.either')

    // An either that accepts strings on the left and numbers on the right
    var StringOrNumber = Either.Typed(_.Str, _.Num);
```
