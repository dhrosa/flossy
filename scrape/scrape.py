"""Scrape database of DMC floss info."""

from requests import get
from bs4 import BeautifulSoup

from json import dumps


def main():
    soup = BeautifulSoup(
        get("https://dmc.crazyartzone.com/dmc_to_hex.php").text, "html.parser"
    )
    table = soup.find("table")
    # First row is a header row (even though it's in the tbody).

    flosses = []
    for tr in table.find_all("tr")[1:]:
        if tr.has_attr("style"):
            # Embedded advertisement.
            continue
        try:
            _, name, description, color, *_ = tr.find_all("td")
        except ValueError:
            # Another form of advertisement
            continue
        name = name.text.strip()
        # Replace inconsistent abbreviations.
        description = (
            description.text.strip().replace("Grn", "Green").replace("Vy", "Very")
        )
        color = color.text.strip()
        flosses.append(dict(name=name, description=description, color=color))

    print(dumps(flosses, indent=2))


if __name__ == "__main__":
    main()
