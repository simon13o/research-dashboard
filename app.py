import io

import pandas as pd
import plotly.express as px
import streamlit as st


st.set_page_config(
    page_title="Amazon Competitor Sales Dashboard",
    layout="wide",
)

st.markdown(
    """
    <style>
    .main-title {
      font-size: 1.9rem;
      font-weight: 700;
      margin-bottom: 0.2rem;
    }
    .sub-title {
      color: #4b5563;
      margin-bottom: 1rem;
    }
    div[data-testid="stMetric"] {
      border: 1px solid #d1d5db;
      border-radius: 10px;
      padding: 10px;
      background: #fafafa;
    }
    </style>
    """,
    unsafe_allow_html=True,
)


PRODUCT_CATEGORY_MAP = {
    "S12 Pro Breast Pump": "Breast Pump",
    "Bottle Warmer Plus": "Bottle Warmer",
    "Formula Pro Advanced": "Dispenser",
    "One Step Sterilizer Dryer": "Sterilizer",
    "Natural Flow Gift Set": "Baby Bottle Set",
    "Deluxe Bottle Warmer": "Bottle Warmer",
    "Stride Pump": "Breast Pump",
    "Catch Milk Collection Cups": "Milk Collection",
}


@st.cache_data
def load_empty_data() -> pd.DataFrame:
    empty = pd.DataFrame(columns=["category", "brand", "product_name", "time", "sale_units", "price"])
    return normalize_dataframe(empty)


def normalize_time_series(series: pd.Series) -> pd.Series:
    parsed = pd.to_datetime(series, errors="coerce")
    fallback_month = pd.to_datetime(series, format="%Y-%m", errors="coerce")
    parsed = parsed.fillna(fallback_month)
    return parsed.dt.strftime("%Y-%m-%d")


def normalize_dataframe(raw_df: pd.DataFrame) -> pd.DataFrame:
    df = raw_df.copy()
    df.columns = [str(c).strip() for c in df.columns]

    def col_or_default(col_name: str, default_value):
        if col_name in df.columns:
            return df[col_name]
        return pd.Series([default_value] * len(df), index=df.index)

    df["category"] = col_or_default("category", None)
    df["brand"] = col_or_default("brand", "").astype(str).str.strip()
    df["product_name"] = col_or_default("product_name", "").astype(str).str.strip()
    df["time"] = normalize_time_series(col_or_default("time", "").astype(str).str.strip())
    df["sale_units"] = pd.to_numeric(col_or_default("sale_units", 0), errors="coerce").fillna(0).clip(lower=0).astype(int)
    df["price"] = pd.to_numeric(col_or_default("price", 0.0), errors="coerce").fillna(0.0).clip(lower=0.0)
    df["category"] = df["category"].replace("", pd.NA).fillna(df["product_name"].map(PRODUCT_CATEGORY_MAP)).fillna("Other")
    df["revenue"] = df["sale_units"] * df["price"]
    return df[["category", "brand", "product_name", "time", "sale_units", "price", "revenue"]]


def map_csv_columns(raw_df: pd.DataFrame) -> pd.DataFrame:
    alias_map = {
        "category": "category",
        "cat": "category",
        "brand": "brand",
        "brand_name": "brand",
        "product": "product_name",
        "product_name": "product_name",
        "productname": "product_name",
        "item_name": "product_name",
        "time": "time",
        "date": "time",
        "month": "time",
        "sale_units": "sale_units",
        "sale_unit": "sale_units",
        "saleunits": "sale_units",
        "sales_unit": "sale_units",
        "sales_units": "sale_units",
        "units": "sale_units",
        "unit": "sale_units",
        "qty": "sale_units",
        "price": "price",
        "unit_price": "price",
    }
    renamed = {}
    for col in raw_df.columns:
        key = str(col).strip().lower().replace(" ", "_")
        if key in alias_map:
            renamed[col] = alias_map[key]
    return raw_df.rename(columns=renamed)


if "sales_df" not in st.session_state:
    st.session_state["sales_df"] = load_empty_data()
if "last_upload_token" not in st.session_state:
    st.session_state["last_upload_token"] = ""

df = st.session_state["sales_df"].copy()
all_categories = sorted(df["category"].dropna().unique().tolist())
all_dates = sorted(df["time"].dropna().unique().tolist())

st.markdown('<div class="main-title">Amazon Competitor Sales Dashboard</div>', unsafe_allow_html=True)
st.markdown(
    '<div class="sub-title">Upload CSV to auto-map data into table. Dashboard and editor are in separate tabs.</div>',
    unsafe_allow_html=True,
)

with st.sidebar:
    st.header("Filters")
    selected_categories = st.multiselect("Category", all_categories, default=all_categories, key="filter_categories")

    category_df = df[df["category"].isin(selected_categories)] if selected_categories else df.iloc[0:0]
    brand_options = sorted(category_df["brand"].dropna().unique().tolist())
    product_options = sorted(category_df["product_name"].dropna().unique().tolist())

    previous_brands = st.session_state.get("filter_brands", brand_options)
    default_brands = [b for b in previous_brands if b in brand_options] or brand_options
    selected_brands = st.multiselect("Brand", brand_options, default=default_brands, key="filter_brands")

    previous_products = st.session_state.get("filter_products", product_options)
    default_products = [p for p in previous_products if p in product_options] or product_options
    selected_products = st.multiselect("Product", product_options, default=default_products, key="filter_products")

    if all_dates:
        date_range = st.select_slider(
            "Date Range",
            options=all_dates,
            value=(all_dates[0], all_dates[-1]),
            key="filter_date_range",
        )
        start_date, end_date = date_range
    else:
        start_date, end_date = "", ""

filtered = df[
    (df["category"].isin(selected_categories))
    & (df["brand"].isin(selected_brands))
    & (df["product_name"].isin(selected_products))
    & (df["time"] >= start_date)
    & (df["time"] <= end_date)
].copy()

tab_dashboard, tab_data = st.tabs(["Dashboard", "Data Editor"])

with tab_dashboard:
    if filtered.empty:
        if df.empty:
            st.info("No data loaded yet. Please go to 'Data Editor' tab and upload a CSV file.")
        else:
            st.warning("No data for current filters. Please adjust filter settings.")
    else:
        total_units = int(filtered["sale_units"].sum())
        total_revenue = float(filtered["revenue"].sum())
        avg_price = float(filtered["price"].mean())
        brand_count = int(filtered["brand"].nunique())

        with st.container(border=True):
            st.subheader("KPI Overview")
            c1, c2, c3, c4 = st.columns(4)
            c1.metric("Total Units", f"{total_units:,}")
            c2.metric("Total Revenue (USD)", f"${total_revenue:,.0f}")
            c3.metric("Average Price (USD)", f"${avg_price:,.2f}")
            c4.metric("Brand Count", f"{brand_count}")

        trend_df = (
            filtered.groupby(["time", "brand"], as_index=False)["sale_units"]
            .sum()
            .sort_values("time")
        )
        trend_fig = px.line(
            trend_df,
            x="time",
            y="sale_units",
            color="brand",
            markers=True,
            title="Sales Trend by Brand",
            labels={"time": "Date (YYYY-MM-DD)", "sale_units": "Sale Units", "brand": "Brand"},
        )

        product_df = (
            filtered.groupby(["category", "brand", "product_name"], as_index=False)["sale_units"]
            .sum()
            .sort_values("sale_units", ascending=False)
            .head(10)
        )
        product_df["product_label"] = (
            product_df["product_name"] + " (" + product_df["brand"] + " | " + product_df["category"] + ")"
        )
        product_fig = px.bar(
            product_df.sort_values("sale_units"),
            x="sale_units",
            y="product_label",
            color="brand",
            orientation="h",
            title="Top Product Sales Comparison",
            labels={"sale_units": "Sale Units", "product_label": "Product"},
        )

        with st.container(border=True):
            st.subheader("Visual Comparison")
            col_left, col_right = st.columns(2)
            col_left.plotly_chart(trend_fig, use_container_width=True)
            col_right.plotly_chart(product_fig, use_container_width=True)

with tab_data:
    with st.container(border=True):
        st.subheader("Upload CSV")
        uploaded = st.file_uploader("Upload a CSV file to replace current table data", type=["csv"])
        if uploaded is not None:
            file_bytes = uploaded.getvalue()
            upload_token = f"{uploaded.name}-{len(file_bytes)}"
            if upload_token != st.session_state["last_upload_token"]:
                try:
                    csv_df = pd.read_csv(io.BytesIO(file_bytes))
                    mapped_df = map_csv_columns(csv_df)
                    normalized_df = normalize_dataframe(mapped_df)
                    st.session_state["sales_df"] = normalized_df
                    st.session_state["last_upload_token"] = upload_token
                    st.success("CSV loaded and mapped to table columns.")
                    st.rerun()
                except Exception as exc:
                    st.error(f"CSV parsing failed: {exc}")

    with st.container(border=True):
        st.subheader("Editable Sales Table")
        edit_source = filtered[
            ["category", "brand", "product_name", "time", "sale_units", "price"]
        ].sort_values(["time", "category", "brand", "product_name"]).copy()

        edited = st.data_editor(
            edit_source,
            use_container_width=True,
            hide_index=False,
            num_rows="fixed",
            column_config={
                "category": st.column_config.TextColumn("Category"),
                "brand": st.column_config.TextColumn("Brand"),
                "product_name": st.column_config.TextColumn("Product Name"),
                "time": st.column_config.TextColumn("Time (YYYY-MM-DD)"),
                "sale_units": st.column_config.NumberColumn("Sale Units", min_value=0, step=1),
                "price": st.column_config.NumberColumn("Price (USD)", min_value=0.0, step=0.01, format="$%.2f"),
            },
            key="editable_table",
        )

        if not edited.equals(edit_source):
            updated = edited.copy()
            updated = normalize_dataframe(updated)

            base = st.session_state["sales_df"].copy()
            overlap_idx = [i for i in updated.index if i in base.index]
            base.loc[overlap_idx, ["category", "brand", "product_name", "time", "sale_units", "price"]] = (
                updated.loc[overlap_idx, ["category", "brand", "product_name", "time", "sale_units", "price"]]
            )

            added_rows = updated.loc[~updated.index.isin(base.index), ["category", "brand", "product_name", "time", "sale_units", "price"]]
            if not added_rows.empty:
                base = pd.concat([base, added_rows], ignore_index=True)

            base = normalize_dataframe(base)
            st.session_state["sales_df"] = base
            st.rerun()
