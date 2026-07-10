import webbrowser
import time

# Your ASIN list
asin_list = [
    "B07MYW28QR", "B0D3ND71LF", "B0C3DHD9LL", "B09K4KVN3Z", "B0B4X54TJT",
    "B09HJDX5S6", "B0FLLPZN3H", "B00MYRXSE2", "B0FPHY6GXR", "B0FPJ72LKQ",
    "B0DK6FCRW4", "B09NQKC2CN", "B0CKRWC8ZN", "B0DDLGJG5J", "B0FP2Y2LJN",
    "B0DPL81FJM", "B0DPL6F2ZG", "B0DKG24NS4", "B0DPL7PK26", "B0GFQ5V98B",
    "B0GFQ59MQB", "B0GFPZZ2HH", "B0FSGH2ZRJ", "B08CDF2TYQ", "B0FC6R4KM3",
    "B0GCNC1TRF", "B0G5MY8RTL", "B09HH7HSGV", "B0D7ZS8NG3", "B0CKYFBH55",
    "B0CWLHKQNT", "B0CQQFFQKJ", "B0B97M3PX2", "B0DKHCWJ5G", "B0CZ86PPVQ",
    "B0FQBY4H7D", "B0DGL879NT", "B09NPXK9GK", "B08FD8VRYZ", "B0876T9DQZ",
    "B0G4794WNM", "B0D3195F82", "B0FDQFRD4R", "B0F6B55KVW"
]


def open_amazon_in_batches(asins, batch_size=5):
    base_url = "https://www.amazon.com/dp/"

    for i in range(0, len(asins), batch_size):
        batch = asins[i : i + batch_size]
        print(f"--- Opening batch {i // batch_size + 1} ({len(batch)} items) ---")

        for asin in batch:
            url = f"{base_url}{asin}"
            webbrowser.open(url)
            time.sleep(0.5)  # Small delay to avoid overwhelming the browser.

        # Ask before opening the next batch.
        if i + batch_size < len(asins):
            cont = input("Batch opened. Press Enter to continue, or type 'q' to quit: ")
            if cont.lower() == "q":
                break


if __name__ == "__main__":
    print(f"Preparing to open {len(asin_list)} Amazon product pages...")
    open_amazon_in_batches(asin_list, batch_size=5)
    print("Done.")
