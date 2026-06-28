package utilities

import "encoding/json"

type NullInt64 struct {
	value int64
}

func (nullOrValue NullInt64) GetValue() int64 { return nullOrValue.value }
func (nullOrValue *NullInt64) IsNull() bool   { return nullOrValue == nil }

func CreateNullInt64(value int64) *NullInt64 {
	nullInt64 := new(NullInt64)
	nullInt64.value = value
	return nullInt64
}

func (n *NullInt64) UnmarshalJSON(data []byte) error {
	// Si le JSON est null, on marque comme invalide
	if string(data) == "null" {
		return nil
	}

	// Sinon, on essaie de décoder comme un int64
	var value int64
	if err := json.Unmarshal(data, &value); err != nil {
		return err
	}

	n.value = value
	return nil
}
