from pathlib import Path

import pandas as pd


SCRIPT_PATH = Path(r"C:\Users\simon13o\Desktop\Amazon_sales_tool\merge_amazon_data.py")


def load_script_namespace():
    source = SCRIPT_PATH.read_text(encoding="utf-8-sig")
    source_without_run_block = source.split("# Run", 1)[0]
    namespace = {}
    exec(source_without_run_block, namespace)
    return namespace


def test_merge_sales_and_price_uses_previous_available_price():
    namespace = load_script_namespace()
    merge_sales_and_price = namespace["merge_sales_and_price"]

    sales = pd.DataFrame(
        {
            "time": pd.to_datetime(["2026-01-01", "2026-01-02", "2026-01-03"]),
            "sales_units": [10, 20, 30],
        }
    )
    price = pd.DataFrame(
        {
            "time": pd.to_datetime(["2026-01-01", "2026-01-03"]),
            "price": [100.0, 120.0],
        }
    )

    merged, exact_missing_rows, filled_price_rows, remaining_missing_rows = merge_sales_and_price(
        sales, price
    )

    assert merged["price"].tolist() == [100.0, 100.0, 120.0]
    assert exact_missing_rows == 1
    assert filled_price_rows == 1
    assert remaining_missing_rows == 0


def test_write_csv_uses_timestamped_fallback_when_target_is_locked(tmp_path):
    namespace = load_script_namespace()
    write_csv_with_permission_fallback = namespace["write_csv_with_permission_fallback"]
    output_path = tmp_path / "Merge_Audit.csv"
    calls = []

    class LockedOnceFrame:
        def to_csv(self, path, **kwargs):
            calls.append(Path(path).name)
            if Path(path).name == "Merge_Audit.csv":
                raise PermissionError("locked")
            Path(path).write_text("ok", encoding="utf-8")

    actual_path = write_csv_with_permission_fallback(LockedOnceFrame(), output_path)

    assert calls == ["Merge_Audit.csv", actual_path.name]
    assert actual_path.name.startswith("Merge_Audit_")
    assert actual_path.read_text(encoding="utf-8") == "ok"
