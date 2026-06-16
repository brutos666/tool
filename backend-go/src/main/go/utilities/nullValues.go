package utilities

type NullInt64 struct {
	value int64
}
func (nullOrValue NullInt64) GetValue() int64 {	return nullOrValue.value }
func (nullOrValue *NullInt64) IsNull() bool {	return nullOrValue == nil }

func CreateNullInt64(value int64) *NullInt64 {
	nullInt64 := new(NullInt64)
	nullInt64.value = value
	return nullInt64
}