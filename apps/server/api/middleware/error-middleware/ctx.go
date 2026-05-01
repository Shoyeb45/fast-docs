package errormiddleware

import "context"

type ctxKey int

const errKey ctxKey = iota

func withError(ctx context.Context, err error) context.Context {
	return context.WithValue(ctx, errKey, err)
}

func errorFromCtx(ctx context.Context) error {
	err, _ := ctx.Value(errKey).(error)
	return err
}
