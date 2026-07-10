import argparse
from pathlib import Path

import pandas as pd


def calculate_sales_sum_for_csv(csv_path: Path) -> float:
    """
    Read a CSV file and return the sum of the `sales` column.
    """
    df = pd.read_csv(csv_path)
    if "sales" not in df.columns:
        raise ValueError(f"'sales' column not found in file: {csv_path.name}")

    sales_series = pd.to_numeric(df["sales"], errors="coerce")
    return float(sales_series.sum(skipna=True))


def build_summary(input_dir: Path) -> pd.DataFrame:
    """
    Build a summary DataFrame with columns: Product, sales.
    Product is derived from CSV filename (without extension).
    """
    rows = []
    csv_files = sorted(input_dir.glob("*.csv"))

    if not csv_files:
        raise FileNotFoundError(f"No CSV files found in folder: {input_dir}")

    for csv_file in csv_files:
        sales_sum = calculate_sales_sum_for_csv(csv_file)
        rows.append(
            {
                "Product": csv_file.stem,
                "sales": sales_sum,
            }
        )

    return pd.DataFrame(rows, columns=["Product", "sales"])


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Read all CSV files in a folder and summarize sales into a new Excel file."
    )
    parser.add_argument(
        "-i",
        "--input-dir",
        default=".",
        help="Folder containing CSV files (default: current folder)",
    )
    parser.add_argument(
        "-o",
        "--output-file",
        default="sales_summary.xlsx",
        help="Output Excel filename (default: sales_summary.xlsx)",
    )
    args = parser.parse_args()

    input_dir = Path(args.input_dir).resolve()
    output_file = Path(args.output_file).resolve()

    summary_df = build_summary(input_dir)
    summary_df.to_excel(output_file, index=False)

    print(f"Done. Summary written to: {output_file}")
    print(summary_df)


if __name__ == "__main__":
    main()
