import accounting from "utils/accounting";

export default function formatCurrency(amount) {
  return accounting.formatColumn([amount, 1000000.0], {
    format: {
      pos: "%s %v", // for positive values, eg. "$ 1.00" (required)
      neg: "%s -%v", // for negative values, eg. "$ (1.00)" [optional]
      zero: "%s  -- ", // for zero values, eg. "$  --" [optional]
    },
  })[0];
}
